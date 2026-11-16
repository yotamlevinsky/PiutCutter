import { useState } from 'react';
import { SequencerSlot } from './SequencerSlot';
import { TransportControls } from './TransportControls';
import type { SequencerSlot as SequencerSlotType, Sample } from '../types';

interface SequencerProps {
  slots: SequencerSlotType[];
  isPlaying: boolean;
  isLooping: boolean;
  currentSlot: number;
  onPlay: () => void;
  onStop: () => void;
  onToggleLoop: () => void;
  onRemoveSample: (slotId: number) => void;
  onReplaceSample: (slotId: number) => void;
  onMoveSample: (fromSlotId: number, toSlotId: number) => void;
  onLibrarySampleDrop: (sample: Sample, slotId: number) => void;
  draggedLibrarySample: Sample | null;
}

export function Sequencer({
  slots,
  isPlaying,
  isLooping,
  currentSlot,
  onPlay,
  onStop,
  onToggleLoop,
  onRemoveSample,
  onReplaceSample,
  onMoveSample,
  onLibrarySampleDrop,
  draggedLibrarySample,
}: SequencerProps) {
  const [draggedSlotId, setDraggedSlotId] = useState<number | null>(null);

  const handleDragStart = (slotId: number) => {
    setDraggedSlotId(slotId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetSlotId: number) => {
    // Check if dropping from library
    if (draggedLibrarySample) {
      onLibrarySampleDrop(draggedLibrarySample, targetSlotId);
    } else if (draggedSlotId !== null && draggedSlotId !== targetSlotId) {
      // Dropping from another sequencer slot
      onMoveSample(draggedSlotId, targetSlotId);
    }
    setDraggedSlotId(null);
  };

  // Check if there are any samples in the sequencer
  const hasSamples = slots.some(slot => slot.sample !== null);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Sequencer</h2>
        <p className="text-sm text-gray-600">
          {hasSamples
            ? 'Drag blocks to rearrange • Hover to replace or remove'
            : 'Add samples from above to create your sequence'}
        </p>
      </div>

      {/* Slots grid */}
      <div className="flex gap-4 mb-6 overflow-x-auto pb-4">
        {slots.map((slot, index) => (
          <SequencerSlot
            key={slot.id}
            slotId={slot.id}
            sample={slot.sample}
            isPlaying={currentSlot === index && isPlaying}
            onRemove={onRemoveSample}
            onReplace={onReplaceSample}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {/* Transport controls */}
      <TransportControls
        isPlaying={isPlaying}
        isLooping={isLooping}
        onPlay={onPlay}
        onStop={onStop}
        onToggleLoop={onToggleLoop}
        disabled={!hasSamples}
      />
    </div>
  );
}
