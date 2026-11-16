// Generate a demo audio track using Web Audio API
// Creates a simple musical loop with drums, bass, and melody

export async function generateDemoAudio(audioContext: AudioContext): Promise<AudioBuffer> {
  const duration = 16; // 16 seconds of audio
  const sampleRate = audioContext.sampleRate;
  const totalSamples = duration * sampleRate;

  // Create a stereo buffer
  const audioBuffer = audioContext.createBuffer(2, totalSamples, sampleRate);
  const leftChannel = audioBuffer.getChannelData(0);
  const rightChannel = audioBuffer.getChannelData(1);

  // BPM and timing
  const bpm = 120;
  const beatDuration = 60 / bpm; // seconds per beat
  const barDuration = beatDuration * 4; // 4/4 time

  // Helper to synthesize a sine wave at a given frequency and time
  function addSineWave(
    buffer: Float32Array,
    frequency: number,
    startTime: number,
    duration: number,
    amplitude: number = 0.3,
    fadeOut: boolean = true
  ) {
    const startSample = Math.floor(startTime * sampleRate);
    const durationSamples = Math.floor(duration * sampleRate);

    for (let i = 0; i < durationSamples && startSample + i < buffer.length; i++) {
      const t = i / sampleRate;
      let envelope = 1;

      if (fadeOut) {
        // Apply ADSR envelope
        const attackTime = 0.01;
        const releaseTime = 0.1;

        if (t < attackTime) {
          envelope = t / attackTime;
        } else if (t > duration - releaseTime) {
          envelope = (duration - t) / releaseTime;
        }
      }

      const sample = Math.sin(2 * Math.PI * frequency * t) * amplitude * envelope;
      buffer[startSample + i] += sample;
    }
  }

  // Helper to add kick drum
  function addKick(buffer: Float32Array, time: number) {
    const startSample = Math.floor(time * sampleRate);
    const kickDuration = 0.3;
    const durationSamples = Math.floor(kickDuration * sampleRate);

    for (let i = 0; i < durationSamples && startSample + i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 60 * Math.exp(-t * 10); // Pitch drops
      const envelope = Math.exp(-t * 8);
      const sample = Math.sin(2 * Math.PI * frequency * t) * 0.5 * envelope;
      buffer[startSample + i] += sample;
    }
  }

  // Helper to add snare drum
  function addSnare(buffer: Float32Array, time: number) {
    const startSample = Math.floor(time * sampleRate);
    const snareDuration = 0.2;
    const durationSamples = Math.floor(snareDuration * sampleRate);

    for (let i = 0; i < durationSamples && startSample + i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 15);
      // White noise + pitched component
      const noise = (Math.random() * 2 - 1) * 0.3;
      const tone = Math.sin(2 * Math.PI * 200 * t) * 0.2;
      const sample = (noise + tone) * envelope;
      buffer[startSample + i] += sample;
    }
  }

  // Helper to add hi-hat
  function addHiHat(buffer: Float32Array, time: number) {
    const startSample = Math.floor(time * sampleRate);
    const hatDuration = 0.05;
    const durationSamples = Math.floor(hatDuration * sampleRate);

    for (let i = 0; i < durationSamples && startSample + i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 40);
      const noise = (Math.random() * 2 - 1) * 0.15 * envelope;
      buffer[startSample + i] += noise;
    }
  }

  // Bassline frequencies (C2, D2, E2, F2, G2)
  const bassNotes = [65.41, 73.42, 82.41, 87.31, 98.00];

  // Melody frequencies (C4, D4, E4, G4, A4)
  const melodyNotes = [261.63, 293.66, 329.63, 392.00, 440.00];

  // Generate 4 bars of music
  for (let bar = 0; bar < 4; bar++) {
    const barStart = bar * barDuration;

    // Drum pattern: kick on 1 and 3, snare on 2 and 4
    addKick(leftChannel, barStart);
    addKick(rightChannel, barStart);
    addSnare(leftChannel, barStart + beatDuration);
    addSnare(rightChannel, barStart + beatDuration);
    addKick(leftChannel, barStart + beatDuration * 2);
    addKick(rightChannel, barStart + beatDuration * 2);
    addSnare(leftChannel, barStart + beatDuration * 3);
    addSnare(rightChannel, barStart + beatDuration * 3);

    // Hi-hats on every eighth note
    for (let eighth = 0; eighth < 8; eighth++) {
      addHiHat(leftChannel, barStart + (eighth * beatDuration) / 2);
      addHiHat(rightChannel, barStart + (eighth * beatDuration) / 2);
    }

    // Bassline pattern
    const bassPattern = [0, 0, 1, 2, 1, 0];
    bassPattern.forEach((noteIdx, i) => {
      if (i * (beatDuration / 1.5) + barStart < duration) {
        addSineWave(
          leftChannel,
          bassNotes[noteIdx],
          barStart + i * (beatDuration / 1.5),
          beatDuration / 2,
          0.25
        );
        addSineWave(
          rightChannel,
          bassNotes[noteIdx],
          barStart + i * (beatDuration / 1.5),
          beatDuration / 2,
          0.25
        );
      }
    });

    // Melody pattern (different for each bar)
    if (bar % 2 === 0) {
      const melodyPattern = [0, 2, 4, 2];
      melodyPattern.forEach((noteIdx, i) => {
        addSineWave(
          leftChannel,
          melodyNotes[noteIdx],
          barStart + i * beatDuration,
          beatDuration * 0.9,
          0.15
        );
        addSineWave(
          rightChannel,
          melodyNotes[noteIdx],
          barStart + i * beatDuration,
          beatDuration * 0.9,
          0.15
        );
      });
    } else {
      const melodyPattern = [4, 3, 2, 0];
      melodyPattern.forEach((noteIdx, i) => {
        addSineWave(
          leftChannel,
          melodyNotes[noteIdx],
          barStart + i * beatDuration,
          beatDuration * 0.9,
          0.15
        );
        addSineWave(
          rightChannel,
          melodyNotes[noteIdx],
          barStart + i * beatDuration,
          beatDuration * 0.9,
          0.15
        );
      });
    }
  }

  // Normalize audio to prevent clipping
  let maxAmplitude = 0;
  for (let i = 0; i < leftChannel.length; i++) {
    maxAmplitude = Math.max(maxAmplitude, Math.abs(leftChannel[i]), Math.abs(rightChannel[i]));
  }

  if (maxAmplitude > 0) {
    const scale = 0.9 / maxAmplitude;
    for (let i = 0; i < leftChannel.length; i++) {
      leftChannel[i] *= scale;
      rightChannel[i] *= scale;
    }
  }

  return audioBuffer;
}
