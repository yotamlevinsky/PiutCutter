import { Play, Square, Repeat } from 'lucide-react';

interface TransportControlsProps {
  isPlaying: boolean;
  isLooping: boolean;
  onPlay: () => void;
  onStop: () => void;
  onToggleLoop: () => void;
  disabled?: boolean;
}

export function TransportControls({
  isPlaying,
  isLooping,
  onPlay,
  onStop,
  onToggleLoop,
  disabled = false,
}: TransportControlsProps) {
  return (
    <div className="flex gap-3 items-center">
      {!isPlaying ? (
        <button
          onClick={onPlay}
          disabled={disabled}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-6 h-6 fill-current" />
          Play
        </button>
      ) : (
        <button
          onClick={onStop}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
        >
          <Square className="w-6 h-6 fill-current" />
          Stop
        </button>
      )}

      <button
        onClick={onToggleLoop}
        disabled={disabled}
        className={`flex items-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
          isLooping
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        }`}
      >
        <Repeat className="w-5 h-5" />
        Loop
      </button>
    </div>
  );
}
