export interface Sample {
  id: string;
  startTime: number;  // in seconds
  duration: number;   // in seconds
  color: string;
  waveformData: Float32Array; // for visualization
}

export interface SequencerSlot {
  id: number;
  sample: Sample | null;
}

export interface PlaybackState {
  isPlaying: boolean;
  isLooping: boolean;
  currentSlot: number;
}

export interface CutterPosition {
  startTime: number; // in seconds
  duration: number;  // in seconds
}

export interface AudioTrack {
  id: string;
  name: string;
  buffer: AudioBuffer;
  duration: number;
  waveformData: Float32Array;
}
