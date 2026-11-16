import { useRef, useState, useEffect } from 'react';
import { formatTime } from '../utils/helpers';

interface SampleCutterProps {
  duration: number; // Duration of the sample in seconds
  maxDuration: number; // Total duration of source audio
  position: number; // Start position in seconds
  onPositionChange: (position: number) => void;
  containerWidth: number;
}

export function SampleCutter({
  duration,
  maxDuration,
  position,
  onPositionChange,
  containerWidth,
}: SampleCutterProps) {
  const cutterRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(0);

  // Calculate cutter width and position in pixels
  const cutterWidth = (duration / maxDuration) * containerWidth;
  const cutterLeft = (position / maxDuration) * containerWidth;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartPosition(position);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartX;
      const deltaTime = (deltaX / containerWidth) * maxDuration;
      let newPosition = dragStartPosition + deltaTime;

      // Clamp position
      newPosition = Math.max(0, Math.min(newPosition, maxDuration - duration));

      onPositionChange(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartX, dragStartPosition, containerWidth, maxDuration, duration, position, onPositionChange]);

  return (
    <div
      ref={cutterRef}
      className={`absolute top-0 bottom-0 bg-blue-500 bg-opacity-30 border-4 border-blue-600 cursor-move select-none transition-shadow ${
        isDragging ? 'shadow-2xl' : 'shadow-lg'
      }`}
      style={{
        left: `${cutterLeft}px`,
        width: `${cutterWidth}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute top-2 left-2 right-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs font-mono text-gray-800">
        <div>{formatTime(position)} - {formatTime(position + duration)}</div>
        <div className="text-blue-600 font-bold">{duration.toFixed(2)}s</div>
      </div>

      {/* Left handle */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-600" />

      {/* Right handle */}
      <div className="absolute right-0 top-0 bottom-0 w-2 bg-blue-600" />
    </div>
  );
}
