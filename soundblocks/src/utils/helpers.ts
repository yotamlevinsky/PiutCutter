// Generate a unique color for each sample
const SAMPLE_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Orange
  '#52B788', // Green
];

let colorIndex = 0;

export function getNextSampleColor(): string {
  const color = SAMPLE_COLORS[colorIndex % SAMPLE_COLORS.length];
  colorIndex++;
  return color;
}

export function resetColorIndex(): void {
  colorIndex = 0;
}

// Extract waveform data from an AudioBuffer segment
export function extractWaveformData(
  audioBuffer: AudioBuffer,
  startTime: number,
  duration: number,
  targetWidth: number = 200
): Float32Array {
  const sampleRate = audioBuffer.sampleRate;
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.floor((startTime + duration) * sampleRate);
  const totalSamples = endSample - startSample;

  const channelData = audioBuffer.getChannelData(0);
  const samplesPerPixel = Math.floor(totalSamples / targetWidth);
  const waveformData = new Float32Array(targetWidth);

  for (let i = 0; i < targetWidth; i++) {
    const start = startSample + i * samplesPerPixel;
    const end = start + samplesPerPixel;
    let sum = 0;
    let count = 0;

    for (let j = start; j < end && j < channelData.length; j++) {
      sum += Math.abs(channelData[j]);
      count++;
    }

    waveformData[i] = count > 0 ? sum / count : 0;
  }

  return waveformData;
}

// Generate full waveform data for visualization
export function generateFullWaveformData(
  audioBuffer: AudioBuffer,
  targetWidth: number = 1000
): Float32Array {
  const channelData = audioBuffer.getChannelData(0);
  const totalSamples = channelData.length;
  const samplesPerPixel = Math.floor(totalSamples / targetWidth);
  const waveformData = new Float32Array(targetWidth);

  for (let i = 0; i < targetWidth; i++) {
    const start = i * samplesPerPixel;
    const end = start + samplesPerPixel;
    let sum = 0;
    let count = 0;

    for (let j = start; j < end && j < totalSamples; j++) {
      sum += Math.abs(channelData[j]);
      count++;
    }

    waveformData[i] = count > 0 ? sum / count : 0;
  }

  return waveformData;
}

// Format time in seconds to MM:SS.mmm
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}
