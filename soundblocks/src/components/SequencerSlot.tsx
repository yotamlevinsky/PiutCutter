import { useState } from 'react';
import { X, Replace } from 'lucide-react';
import { WaveformViewer } from './WaveformViewer';
import type { Sample } from '../types';

interface SequencerSlotProps {
  slotId: number;
  sample: Sample | null;
  isPlaying: boolean;
  onRemove: (slotId: number) => void;
  onReplace: (slotId: number) => void;
  onDragStart: (slotId: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (slotId: number) => void;
}

export function SequencerSlot({
  slotId,
  sample,
  isPlaying,
  onRemove,
  onReplace,
  onDragStart,
  onDragOver,
  onDrop,
}: SequencerSlotProps) {
  const [showActions, setShowActions] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (!sample) return;
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(slotId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
    onDragOver(e);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(slotId);
  };

  if (!sample) {
    return (
      <div
        className={`w-32 h-32 bg-gray-100 border-2 border-dashed rounded-lg flex items-center justify-center transition-all ${
          isDragOver ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <span className="text-gray-400 text-sm font-semibold">
          {isDragOver ? 'Drop here' : 'Empty'}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative w-32 h-32 rounded-lg shadow-lg cursor-move transition-all ${
        isPlaying ? 'ring-4 ring-yellow-400 scale-105' : ''
      } ${isDragOver ? 'ring-4 ring-blue-500 scale-105' : ''}`}
      style={{ backgroundColor: sample.color }}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Waveform */}
      <div className="absolute inset-2 bg-white bg-opacity-20 rounded overflow-hidden">
        <WaveformViewer
          waveformData={sample.waveformData}
          width={112}
          height={112}
          color="rgba(255, 255, 255, 0.8)"
          backgroundColor="transparent"
        />
      </div>

      {/* Actions overlay */}
      {showActions && !isPlaying && (
        <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center gap-2">
          <button
            onClick={() => onReplace(slotId)}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="Replace with current selection"
          >
            <Replace className="w-5 h-5" />
          </button>
          <button
            onClick={() => onRemove(slotId)}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            title="Remove sample"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Slot number badge */}
      <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs font-bold rounded px-2 py-1">
        {slotId + 1}
      </div>
    </div>
  );
}
