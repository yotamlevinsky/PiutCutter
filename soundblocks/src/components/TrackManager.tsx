import { Upload, Trash2, Music } from 'lucide-react';
import type { AudioTrack } from '../types';

interface TrackManagerProps {
  tracks: AudioTrack[];
  currentTrackId: string | null;
  onSelectTrack: (trackId: string) => void;
  onRemoveTrack: (trackId: string) => void;
  onUploadTrack: (file: File) => void;
}

export function TrackManager({
  tracks,
  currentTrackId,
  onSelectTrack,
  onRemoveTrack,
  onUploadTrack,
}: TrackManagerProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadTrack(file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Music className="w-4 h-4" />
          Audio Tracks
        </h3>
        <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-semibold cursor-pointer transition-colors">
          <Upload className="w-4 h-4" />
          Upload
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          No tracks uploaded yet
        </div>
      ) : (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`flex items-center gap-2 p-2 rounded transition-colors ${
                currentTrackId === track.id
                  ? 'bg-blue-100 border border-blue-300'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="track"
                checked={currentTrackId === track.id}
                onChange={() => onSelectTrack(track.id)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">
                  {track.name}
                </div>
                <div className="text-xs text-gray-500">
                  {track.duration.toFixed(1)}s
                </div>
              </div>
              <button
                onClick={() => onRemoveTrack(track.id)}
                disabled={tracks.length === 1}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title={tracks.length === 1 ? 'Cannot remove last track' : 'Remove track'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
