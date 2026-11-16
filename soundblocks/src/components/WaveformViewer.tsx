import { useEffect, useRef } from 'react';

interface WaveformViewerProps {
  waveformData: Float32Array;
  width: number;
  height: number;
  color?: string;
  backgroundColor?: string;
}

export function WaveformViewer({
  waveformData,
  width,
  height,
  color = '#4F46E5',
  backgroundColor = '#F3F4F6',
}: WaveformViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    ctx.fillStyle = color;
    const barWidth = width / waveformData.length;
    const centerY = height / 2;

    for (let i = 0; i < waveformData.length; i++) {
      const amplitude = waveformData[i];
      const barHeight = amplitude * centerY * 0.9;

      const x = i * barWidth;
      const y = centerY - barHeight / 2;

      ctx.fillRect(x, y, Math.max(barWidth * 0.8, 1), barHeight);
    }
  }, [waveformData, width, height, color, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}
