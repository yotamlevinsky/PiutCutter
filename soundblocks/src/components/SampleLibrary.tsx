import { Trash2 } from 'lucide-react';
import { WaveformViewer } from './WaveformViewer';
import type { Sample } from '../types';

interface SampleLibraryProps {
  samples: Sample[];
  onRemoveSample: (sampleId: string) => void;
  onDragStart: (sample: Sample) => void;
}

export function SampleLibrary({
  samples,
  onRemoveSample,
  onDragStart,
}: SampleLibraryProps) {
  const handleDragStart = (e: React.DragEvent, sample: Sample) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', sample.id); // Required for Firefox
    onDragStart(sample);
  };

  if (samples.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Sample Library</h2>
        <p className="text-sm text-gray-600 mb-4">
          Saved samples appear here • Drag them to the sequencer slots below
        </p>
        <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-400">No samples yet - add some from above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Sample Library</h2>
      <p className="text-sm text-gray-600 mb-4">
        Drag samples to the sequencer below • Reuse the same sample multiple times
      </p>

      {/* Scrollable sample library */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {samples.map((sample) => (
          <div
            key={sample.id}
            className="relative flex-shrink-0 w-32 h-32 rounded-lg shadow-lg cursor-grab active:cursor-grabbing transition-transform hover:scale-105"
            style={{ backgroundColor: sample.color }}
            draggable
            onDragStart={(e) => handleDragStart(e, sample)}
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

            {/* Remove button */}
            <button
              onClick={() => onRemoveSample(sample.id)}
              className="absolute top-1 right-1 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors z-10"
              title="Remove sample"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Duration badge */}
            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs font-bold rounded px-2 py-1">
              {sample.duration.toFixed(1)}s
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
