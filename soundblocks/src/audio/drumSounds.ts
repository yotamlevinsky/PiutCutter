// Generate 808-style drum sounds using Web Audio API

export function generate808Kick(audioContext: AudioContext): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.5;
  const length = Math.floor(duration * sampleRate);
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    // Pitch envelope: 150Hz -> 50Hz
    const freq = 150 * Math.exp(-t * 10) + 50 * Math.exp(-t * 3);
    // Amplitude envelope
    const env = Math.exp(-t * 8);
    // Sine wave with pitch bend
    data[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.8;
  }

  return buffer;
}

export function generate808Snare(audioContext: AudioContext): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.3;
  const length = Math.floor(duration * sampleRate);
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 15);
    // Noise
    const noise = (Math.random() * 2 - 1) * 0.4;
    // Tonal component (200Hz + 300Hz)
    const tone = Math.sin(2 * Math.PI * 200 * t) * 0.3 + Math.sin(2 * Math.PI * 300 * t) * 0.2;
    data[i] = (noise + tone) * env;
  }

  return buffer;
}

export function generate808HiHatClosed(audioContext: AudioContext): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.08;
  const length = Math.floor(duration * sampleRate);
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 50);
    // High-frequency noise
    const noise = (Math.random() * 2 - 1) * 0.2 * env;
    data[i] = noise;
  }

  return buffer;
}

export function generate808HiHatOpen(audioContext: AudioContext): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.3;
  const length = Math.floor(duration * sampleRate);
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 8);
    // High-frequency noise
    const noise = (Math.random() * 2 - 1) * 0.15 * env;
    data[i] = noise;
  }

  return buffer;
}

export function generate808Clap(audioContext: AudioContext): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.2;
  const length = Math.floor(duration * sampleRate);
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  // Three burst of noise for realistic clap
  const burstTimes = [0, 0.015, 0.03];

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    let sample = 0;

    burstTimes.forEach(burstTime => {
      const burstT = t - burstTime;
      if (burstT >= 0) {
        const env = Math.exp(-burstT * 25);
        const noise = (Math.random() * 2 - 1) * 0.3;
        sample += noise * env;
      }
    });

    data[i] = sample;
  }

  return buffer;
}

export interface DrumKit {
  kick: AudioBuffer;
  snare: AudioBuffer;
  hihatClosed: AudioBuffer;
  hihatOpen: AudioBuffer;
  clap: AudioBuffer;
}

export function generateDrumKit(audioContext: AudioContext): DrumKit {
  return {
    kick: generate808Kick(audioContext),
    snare: generate808Snare(audioContext),
    hihatClosed: generate808HiHatClosed(audioContext),
    hihatOpen: generate808HiHatOpen(audioContext),
    clap: generate808Clap(audioContext),
  };
}
