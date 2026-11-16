import { useEffect, useRef, useState, useCallback } from 'react';
import { AudioEngine } from '../audio/AudioEngine';
import { generateDrumKit } from '../audio/drumSounds';
import type { Sample, SequencerSlot, CutterPosition, AudioTrack } from '../types';
import { extractWaveformData, getNextSampleColor, generateFullWaveformData } from '../utils/helpers';

const SAMPLE_DURATION = 2.0; // Fixed 2-second samples
const DRUM_COUNT = 5; // kick, snare, hihat-closed, hihat-open, clap
const STEP_COUNT = 16;

export function useAudioEngine() {
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [slots, setSlots] = useState<SequencerSlot[]>(
    Array.from({ length: 8 }, (_, i) => ({ id: i, sample: null }))
  );
  const [librarySamples, setLibrarySamples] = useState<Sample[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(-1);
  const [currentDrumStep, setCurrentDrumStep] = useState(-1);
  const [drumPattern, setDrumPattern] = useState<boolean[][]>(
    Array.from({ length: DRUM_COUNT }, () => Array(STEP_COUNT).fill(false))
  );
  const [cutterPosition, setCutterPosition] = useState<CutterPosition>({
    startTime: 0,
    duration: SAMPLE_DURATION,
  });

  // Get current track data
  const currentTrack = tracks.find(t => t.id === currentTrackId) || null;
  const sourceBuffer = currentTrack?.buffer || null;
  const sourceWaveform = currentTrack?.waveformData || null;
  const sourceDuration = currentTrack?.duration || 0;

  // Initialize audio engine and load demo audio
  useEffect(() => {
    const init = async () => {
      try {
        console.log('Starting initialization...');
        const engine = new AudioEngine();
        await engine.initialize();
        console.log('Engine initialized');

        // Load audio file from public folder
        const response = await fetch('/sample.mp3');
        const arrayBuffer = await response.arrayBuffer();
        const fullAudioBuffer = await engine.getAudioContext().decodeAudioData(arrayBuffer);

        // Use only first 20 seconds
        const maxDuration = 20;
        const duration = Math.min(fullAudioBuffer.duration, maxDuration);
        const sampleRate = fullAudioBuffer.sampleRate;
        const numberOfChannels = fullAudioBuffer.numberOfChannels;
        const length = Math.floor(duration * sampleRate);

        // Create a new buffer with just the first 20 seconds
        const audioBuffer = engine.getAudioContext().createBuffer(
          numberOfChannels,
          length,
          sampleRate
        );

        // Copy the first 20 seconds from each channel
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sourceData = fullAudioBuffer.getChannelData(channel);
          const targetData = audioBuffer.getChannelData(channel);
          for (let i = 0; i < length; i++) {
            targetData[i] = sourceData[i];
          }
        }

        console.log('Audio loaded:', audioBuffer.duration, 'seconds (trimmed from', fullAudioBuffer.duration.toFixed(1), 'seconds)');

        // Create initial track
        const waveform = generateFullWaveformData(audioBuffer, 1000);
        const initialTrack: AudioTrack = {
          id: 'default',
          name: 'Default Track',
          buffer: audioBuffer,
          duration: audioBuffer.duration,
          waveformData: waveform,
        };

        setTracks([initialTrack]);
        setCurrentTrackId('default');
        engine.setSourceBuffer(audioBuffer);
        console.log('Waveform generated');

        // Generate drum kit
        const drumKit = generateDrumKit(engine.getAudioContext());
        engine.setDrumKit(drumKit);
        console.log('Drum kit generated');

        audioEngineRef.current = engine;
        setIsInitialized(true);
        console.log('Initialization complete!');
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };

    init();

    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.destroy();
      }
    };
  }, []);

  // Update slots in audio engine when they change
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setSlots(slots);
    }
  }, [slots]);

  // Update drum pattern in audio engine when it changes
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setDrumPattern(drumPattern);
    }
  }, [drumPattern]);

  // Set up playback callbacks
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setOnSlotChange((slotIndex) => {
        setCurrentSlot(slotIndex);
      });

      audioEngineRef.current.setOnPlaybackStop(() => {
        setIsPlaying(false);
        setCurrentSlot(-1);
        setCurrentDrumStep(-1);
      });

      audioEngineRef.current.setOnDrumStepChange((step) => {
        setCurrentDrumStep(step);
      });
    }
  }, []);

  const createSampleFromCutter = useCallback((): Sample | null => {
    if (!sourceBuffer) return null;

    const sample: Sample = {
      id: `sample-${Date.now()}-${Math.random()}`,
      startTime: cutterPosition.startTime,
      duration: cutterPosition.duration,
      color: getNextSampleColor(),
      waveformData: extractWaveformData(
        sourceBuffer,
        cutterPosition.startTime,
        cutterPosition.duration,
        200
      ),
    };

    return sample;
  }, [sourceBuffer, cutterPosition]);

  const addSampleToLibrary = useCallback(() => {
    const sample = createSampleFromCutter();
    if (!sample) return;

    setLibrarySamples(prev => [...prev, sample]);
  }, [createSampleFromCutter]);

  const removeSampleFromLibrary = useCallback((sampleId: string) => {
    setLibrarySamples(prev => prev.filter(s => s.id !== sampleId));
  }, []);

  const addLibrarySampleToSlot = useCallback((sample: Sample, slotId: number) => {
    setSlots(prevSlots => {
      const newSlots = [...prevSlots];
      const slotIndex = newSlots.findIndex(s => s.id === slotId);
      if (slotIndex !== -1) {
        // Create a copy of the sample so each slot has its own independent instance
        const sampleCopy: Sample = {
          ...sample,
          id: `${sample.id}-slot-${slotId}-${Date.now()}`,
          waveformData: new Float32Array(sample.waveformData),
        };
        newSlots[slotIndex] = { ...newSlots[slotIndex], sample: sampleCopy };
      }
      return newSlots;
    });
  }, []);

  const removeSampleFromSlot = useCallback((slotId: number) => {
    setSlots(prevSlots => {
      const newSlots = [...prevSlots];
      const slotIndex = newSlots.findIndex(s => s.id === slotId);
      if (slotIndex !== -1) {
        newSlots[slotIndex] = { ...newSlots[slotIndex], sample: null };
      }
      return newSlots;
    });
  }, []);

  const replaceSampleInSlot = useCallback((slotId: number) => {
    const sample = createSampleFromCutter();
    if (!sample) return;

    setSlots(prevSlots => {
      const newSlots = [...prevSlots];
      const slotIndex = newSlots.findIndex(s => s.id === slotId);
      if (slotIndex !== -1) {
        newSlots[slotIndex] = { ...newSlots[slotIndex], sample };
      }
      return newSlots;
    });
  }, [createSampleFromCutter]);

  const moveSample = useCallback((fromSlotId: number, toSlotId: number) => {
    setSlots(prevSlots => {
      const newSlots = [...prevSlots];
      const fromIndex = newSlots.findIndex(s => s.id === fromSlotId);
      const toIndex = newSlots.findIndex(s => s.id === toSlotId);

      if (fromIndex !== -1 && toIndex !== -1) {
        const temp = newSlots[fromIndex].sample;
        newSlots[fromIndex] = { ...newSlots[fromIndex], sample: newSlots[toIndex].sample };
        newSlots[toIndex] = { ...newSlots[toIndex], sample: temp };
      }

      return newSlots;
    });
  }, []);

  const previewCurrentSelection = useCallback(async () => {
    if (!audioEngineRef.current || !sourceBuffer) return;

    const sample = createSampleFromCutter();
    if (sample) {
      await audioEngineRef.current.previewSample(sample);
    }
  }, [createSampleFromCutter, sourceBuffer]);

  const play = useCallback(async () => {
    if (!audioEngineRef.current) return;
    await audioEngineRef.current.play(isLooping);
    setIsPlaying(true);
  }, [isLooping]);

  const stop = useCallback(() => {
    if (!audioEngineRef.current) return;
    audioEngineRef.current.stop();
    setIsPlaying(false);
    setCurrentSlot(-1);
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLooping(prev => !prev);
  }, []);

  const updateCutterPosition = useCallback((startTime: number) => {
    setCutterPosition({
      startTime,
      duration: SAMPLE_DURATION,
    });
  }, []);

  const toggleDrumStep = useCallback((drumIndex: number, stepIndex: number) => {
    setDrumPattern(prev => {
      const newPattern = prev.map(row => [...row]);
      newPattern[drumIndex][stepIndex] = !newPattern[drumIndex][stepIndex];
      return newPattern;
    });
  }, []);

  const clearDrumPattern = useCallback(() => {
    setDrumPattern(
      Array.from({ length: DRUM_COUNT }, () => Array(STEP_COUNT).fill(false))
    );
  }, []);

  const uploadTrack = useCallback(async (file: File) => {
    if (!audioEngineRef.current) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const fullAudioBuffer = await audioEngineRef.current.getAudioContext().decodeAudioData(arrayBuffer);

      // Use only first 20 seconds
      const maxDuration = 20;
      const duration = Math.min(fullAudioBuffer.duration, maxDuration);
      const sampleRate = fullAudioBuffer.sampleRate;
      const numberOfChannels = fullAudioBuffer.numberOfChannels;
      const length = Math.floor(duration * sampleRate);

      const audioBuffer = audioEngineRef.current.getAudioContext().createBuffer(
        numberOfChannels,
        length,
        sampleRate
      );

      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sourceData = fullAudioBuffer.getChannelData(channel);
        const targetData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          targetData[i] = sourceData[i];
        }
      }

      const waveform = generateFullWaveformData(audioBuffer, 1000);
      const newTrack: AudioTrack = {
        id: `track-${Date.now()}`,
        name: file.name,
        buffer: audioBuffer,
        duration: audioBuffer.duration,
        waveformData: waveform,
      };

      setTracks(prev => [...prev, newTrack]);
      setCurrentTrackId(newTrack.id);
      audioEngineRef.current.setSourceBuffer(audioBuffer);

      console.log('Track uploaded:', file.name);
    } catch (error) {
      console.error('Failed to upload track:', error);
    }
  }, []);

  const selectTrack = useCallback((trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (track && audioEngineRef.current) {
      setCurrentTrackId(trackId);
      audioEngineRef.current.setSourceBuffer(track.buffer);
      // Reset cutter position when switching tracks
      setCutterPosition({
        startTime: 0,
        duration: SAMPLE_DURATION,
      });
    }
  }, [tracks]);

  const removeTrack = useCallback((trackId: string) => {
    if (tracks.length <= 1) return; // Don't remove the last track

    setTracks(prev => {
      const filtered = prev.filter(t => t.id !== trackId);
      // If removing current track, switch to first remaining track
      if (trackId === currentTrackId && filtered.length > 0) {
        const newTrack = filtered[0];
        setCurrentTrackId(newTrack.id);
        if (audioEngineRef.current) {
          audioEngineRef.current.setSourceBuffer(newTrack.buffer);
        }
      }
      return filtered;
    });
  }, [tracks, currentTrackId]);

  return {
    isInitialized,
    tracks,
    currentTrackId,
    sourceBuffer,
    sourceWaveform,
    sourceDuration,
    cutterPosition,
    updateCutterPosition,
    slots,
    librarySamples,
    isPlaying,
    isLooping,
    currentSlot,
    currentDrumStep,
    drumPattern,
    uploadTrack,
    selectTrack,
    removeTrack,
    addSampleToLibrary,
    removeSampleFromLibrary,
    addLibrarySampleToSlot,
    removeSampleFromSlot,
    replaceSampleInSlot,
    moveSample,
    previewCurrentSelection,
    play,
    stop,
    toggleLoop,
    toggleDrumStep,
    clearDrumPattern,
  };
}
