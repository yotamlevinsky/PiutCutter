import { Music } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Music className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">SoundBlocks</h1>
            <p className="text-sm text-purple-100 mt-1">
              Create music by cutting and arranging audio blocks
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
