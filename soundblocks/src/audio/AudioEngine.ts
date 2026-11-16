import type { Sample, SequencerSlot, AudioTrack } from '../types';
import type { DrumKit } from './drumSounds';

export class AudioEngine {
  private audioContext: AudioContext;
  private sourceBuffer: AudioBuffer | null = null;
  private tracks: Map<string, AudioBuffer> = new Map();
  private drumKit: DrumKit | null = null;
  private scheduledNodes: AudioBufferSourceNode[] = [];
  private isPlaying = false;
  private isLooping = false;
  private currentSlotIndex = 0;
  private currentDrumStep = 0;
  private scheduleAheadTime = 0.1; // Schedule 100ms ahead
  private schedulerTimer: number | null = null;
  private drumSchedulerTimer: number | null = null;
  private nextNoteTime = 0;
  private nextDrumStepTime = 0;
  private slots: SequencerSlot[] = [];
  private drumPattern: boolean[][] = [];

  // Callbacks
  private onSlotChange: ((slotIndex: number) => void) | null = null;
  private onPlaybackStop: (() => void) | null = null;
  private onDrumStepChange: ((step: number) => void) | null = null;

  constructor() {
    this.audioContext = new AudioContext();
  }

  async initialize(): Promise<void> {
    // AudioContext will be resumed on first user interaction (preview/play)
    // Don't try to resume here as it will hang without user gesture
  }

  setSourceBuffer(buffer: AudioBuffer): void {
    this.sourceBuffer = buffer;
  }

  getSourceBuffer(): AudioBuffer | null {
    return this.sourceBuffer;
  }

  addTrack(trackId: string, buffer: AudioBuffer): void {
    this.tracks.set(trackId, buffer);
  }

  getTrackBuffer(trackId: string): AudioBuffer | null {
    return this.tracks.get(trackId) || null;
  }

  getAudioContext(): AudioContext {
    return this.audioContext;
  }

  setSlots(slots: SequencerSlot[]): void {
    this.slots = slots;
  }

  setOnSlotChange(callback: (slotIndex: number) => void): void {
    this.onSlotChange = callback;
  }

  setOnPlaybackStop(callback: () => void): void {
    this.onPlaybackStop = callback;
  }

  setDrumKit(drumKit: DrumKit): void {
    this.drumKit = drumKit;
  }

  setDrumPattern(pattern: boolean[][]): void {
    this.drumPattern = pattern;
  }

  setOnDrumStepChange(callback: (step: number) => void): void {
    this.onDrumStepChange = callback;
  }

  // Preview a sample segment
  async previewSample(sample: Sample): Promise<void> {
    const trackBuffer = this.getTrackBuffer(sample.trackId);
    if (!trackBuffer) return;

    await this.initialize();

    // Stop any existing preview
    this.stopAllScheduledNodes();

    const source = this.audioContext.createBufferSource();
    source.buffer = trackBuffer;

    // Apply fade envelope to prevent clicks
    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.audioContext.destination);

    const fadeTime = 0.01; // 10ms fade
    const now = this.audioContext.currentTime;

    // Fade in
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + fadeTime);

    // Fade out
    const endTime = now + sample.duration;
    gainNode.gain.setValueAtTime(1, endTime - fadeTime);
    gainNode.gain.linearRampToValueAtTime(0, endTime);

    source.connect(gainNode);
    source.start(now, sample.startTime, sample.duration);

    this.scheduledNodes.push(source);

    // Clean up after playback
    source.onended = () => {
      const index = this.scheduledNodes.indexOf(source);
      if (index > -1) {
        this.scheduledNodes.splice(index, 1);
      }
    };
  }

  // Start sequencer playback
  async play(loop: boolean = false): Promise<void> {
    if (this.isPlaying) return;
    if (!this.sourceBuffer || this.slots.length === 0) return;

    await this.initialize();

    this.isPlaying = true;
    this.isLooping = loop;
    this.currentSlotIndex = 0;
    this.currentDrumStep = 0;
    this.nextNoteTime = this.audioContext.currentTime;
    this.nextDrumStepTime = this.audioContext.currentTime;

    this.scheduleNote();
    this.schedulerTimer = window.setInterval(() => this.scheduler(), 25);

    // Start drum scheduler
    if (this.drumKit && this.drumPattern.length > 0) {
      this.drumSchedulerTimer = window.setInterval(() => this.drumScheduler(), 25);
    }
  }

  // Stop playback
  stop(): void {
    this.isPlaying = false;
    this.currentSlotIndex = 0;
    this.currentDrumStep = 0;

    if (this.schedulerTimer !== null) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    if (this.drumSchedulerTimer !== null) {
      clearInterval(this.drumSchedulerTimer);
      this.drumSchedulerTimer = null;
    }

    this.stopAllScheduledNodes();

    if (this.onPlaybackStop) {
      this.onPlaybackStop();
    }
  }

  // Main scheduler using lookahead
  private scheduler(): void {
    const currentTime = this.audioContext.currentTime;

    // Schedule notes that need to play within the lookahead window
    while (this.nextNoteTime < currentTime + this.scheduleAheadTime) {
      this.scheduleNote();
    }
  }

  // Schedule the next note
  private scheduleNote(): void {
    if (!this.isPlaying || !this.sourceBuffer) return;

    // Find the last non-empty slot
    let lastFilledSlotIndex = -1;
    for (let i = this.slots.length - 1; i >= 0; i--) {
      if (this.slots[i].sample !== null) {
        lastFilledSlotIndex = i;
        break;
      }
    }

    // If no filled slots, stop
    if (lastFilledSlotIndex < 0) {
      this.isPlaying = false;
      if (this.schedulerTimer !== null) {
        clearInterval(this.schedulerTimer);
        this.schedulerTimer = null;
      }
      if (this.onPlaybackStop) {
        this.onPlaybackStop();
      }
      return;
    }

    const currentSlot = this.slots[this.currentSlotIndex];

    // Only schedule if there's a sample
    if (currentSlot && currentSlot.sample) {
      const sample = currentSlot.sample;
      const trackBuffer = this.getTrackBuffer(sample.trackId);
      if (!trackBuffer) {
        // Track buffer not found, skip this slot
        this.nextNoteTime += 2.0;
        this.currentSlotIndex++;
        if (this.currentSlotIndex > lastFilledSlotIndex) {
          if (this.isLooping) {
            this.currentSlotIndex = 0;
          } else {
            this.isPlaying = false;
            if (this.schedulerTimer !== null) {
              clearInterval(this.schedulerTimer);
              this.schedulerTimer = null;
            }
            if (this.onPlaybackStop) {
              this.onPlaybackStop();
            }
          }
        }
        return;
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = trackBuffer;

      // Apply fade envelope to prevent clicks
      const gainNode = this.audioContext.createGain();
      gainNode.connect(this.audioContext.destination);

      const fadeTime = 0.01; // 10ms fade
      const startTime = this.nextNoteTime;
      const endTime = startTime + sample.duration;

      // Fade in
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(1, startTime + fadeTime);

      // Fade out
      gainNode.gain.setValueAtTime(1, endTime - fadeTime);
      gainNode.gain.linearRampToValueAtTime(0, endTime);

      source.connect(gainNode);
      source.start(startTime, sample.startTime, sample.duration);

      this.scheduledNodes.push(source);

      // Update UI to show current slot
      const slotIndex = this.currentSlotIndex;
      setTimeout(() => {
        if (this.onSlotChange) {
          this.onSlotChange(slotIndex);
        }
      }, (startTime - this.audioContext.currentTime) * 1000);

      // Clean up after playback
      source.onended = () => {
        const index = this.scheduledNodes.indexOf(source);
        if (index > -1) {
          this.scheduledNodes.splice(index, 1);
        }
      };

      // Move to next slot with sample duration
      this.nextNoteTime += sample.duration;
    } else {
      // Empty slot - use default duration
      this.nextNoteTime += 2.0;
    }

    // Move to next slot
    this.currentSlotIndex++;

    // If we've gone past the last filled slot, loop or stop
    if (this.currentSlotIndex > lastFilledSlotIndex) {
      if (this.isLooping) {
        this.currentSlotIndex = 0;
      } else {
        this.isPlaying = false;
        if (this.schedulerTimer !== null) {
          clearInterval(this.schedulerTimer);
          this.schedulerTimer = null;
        }
        if (this.onPlaybackStop) {
          this.onPlaybackStop();
        }
      }
    }
  }

  // Drum machine scheduler
  private drumScheduler(): void {
    const currentTime = this.audioContext.currentTime;

    // Schedule drum steps that need to play within the lookahead window
    while (this.nextDrumStepTime < currentTime + this.scheduleAheadTime) {
      this.scheduleDrumStep();
    }
  }

  private scheduleDrumStep(): void {
    if (!this.isPlaying || !this.drumKit || this.drumPattern.length === 0) return;

    const stepDuration = 2.0 / 16; // 16 steps per 2-second sample = 0.125s per step

    // Play all active drums for this step
    const drumBuffers = [
      this.drumKit.kick,
      this.drumKit.snare,
      this.drumKit.hihatClosed,
      this.drumKit.hihatOpen,
      this.drumKit.clap,
    ];

    this.drumPattern.forEach((drumSteps, drumIndex) => {
      if (drumSteps[this.currentDrumStep]) {
        const source = this.audioContext.createBufferSource();
        source.buffer = drumBuffers[drumIndex];

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.6; // Drum volume
        gainNode.connect(this.audioContext.destination);

        source.connect(gainNode);
        source.start(this.nextDrumStepTime);

        this.scheduledNodes.push(source);

        source.onended = () => {
          const index = this.scheduledNodes.indexOf(source);
          if (index > -1) {
            this.scheduledNodes.splice(index, 1);
          }
        };
      }
    });

    // Update UI to show current drum step
    const stepIndex = this.currentDrumStep;
    setTimeout(() => {
      if (this.onDrumStepChange) {
        this.onDrumStepChange(stepIndex);
      }
    }, (this.nextDrumStepTime - this.audioContext.currentTime) * 1000);

    // Move to next drum step
    this.nextDrumStepTime += stepDuration;
    this.currentDrumStep++;

    // Loop drum pattern every 16 steps (every 2 seconds)
    if (this.currentDrumStep >= 16) {
      this.currentDrumStep = 0;
    }
  }

  private stopAllScheduledNodes(): void {
    this.scheduledNodes.forEach(node => {
      try {
        node.stop();
      } catch (e) {
        // Node may already be stopped
      }
    });
    this.scheduledNodes = [];
  }

  getCurrentSlotIndex(): number {
    return this.currentSlotIndex;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  destroy(): void {
    this.stop();
    this.audioContext.close();
  }
}
