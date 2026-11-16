import { Play, Plus } from 'lucide-react';
import { WaveformViewer } from './WaveformViewer';
import { SampleCutter } from './SampleCutter';
import { TrackManager } from './TrackManager';
import type { CutterPosition, AudioTrack } from '../types';

interface AudioSourceProps {
  tracks: AudioTrack[];
  currentTrackId: string | null;
  waveformData: Float32Array | null;
  sourceDuration: number;
  cutterPosition: CutterPosition;
  onCutterPositionChange: (position: number) => void;
  onPreview: () => void;
  onAddSample: () => void;
  onUploadTrack: (file: File) => void;
  onSelectTrack: (trackId: string) => void;
  onRemoveTrack: (trackId: string) => void;
}

export function AudioSource({
  tracks,
  currentTrackId,
  waveformData,
  sourceDuration,
  cutterPosition,
  onCutterPositionChange,
  onPreview,
  onAddSample,
  onUploadTrack,
  onSelectTrack,
  onRemoveTrack,
}: AudioSourceProps) {
  const containerWidth = 1000;
  const containerHeight = 150;

  if (!waveformData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center text-gray-500">Loading audio...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Source Audio</h2>
          <p className="text-sm text-gray-600">
            Drag the blue window to select a {cutterPosition.duration}s segment
          </p>
        </div>
        <div className="w-80">
          <TrackManager
            tracks={tracks}
            currentTrackId={currentTrackId}
            onSelectTrack={onSelectTrack}
            onRemoveTrack={onRemoveTrack}
            onUploadTrack={onUploadTrack}
          />
        </div>
      </div>

      {/* Waveform with cutter overlay */}
      <div className="relative mb-6 inline-block">
        <WaveformViewer
          waveformData={waveformData}
          width={containerWidth}
          height={containerHeight}
          color="#6366F1"
          backgroundColor="#F9FAFB"
        />
        <SampleCutter
          duration={cutterPosition.duration}
          maxDuration={sourceDuration}
          position={cutterPosition.startTime}
          onPositionChange={onCutterPositionChange}
          containerWidth={containerWidth}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={onPreview}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors"
        >
          <Play className="w-5 h-5" />
          Preview
        </button>
        <button
          onClick={onAddSample}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add to Library
        </button>
      </div>
    </div>
  );
}
