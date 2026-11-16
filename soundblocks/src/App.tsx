import { useState } from 'react';
import { Header } from './components/Header';
import { AudioSource } from './components/AudioSource';
import { SampleLibrary } from './components/SampleLibrary';
import { DrumMachine } from './components/DrumMachine';
import { Sequencer } from './components/Sequencer';
import { useAudioEngine } from './hooks/useAudioEngine';
import type { Sample } from './types';

function App() {
  const {
    isInitialized,
    tracks,
    currentTrackId,
    sourceWaveform,
    sourceDuration,
    cutterPosition,
    updateCutterPosition,
    slots,
    librarySamples,
    isPlaying,
    isLooping,
    currentSlot,
    currentDrumStep,
    drumPattern,
    uploadTrack,
    selectTrack,
    removeTrack,
    addSampleToLibrary,
    removeSampleFromLibrary,
    addLibrarySampleToSlot,
    removeSampleFromSlot,
    replaceSampleInSlot,
    moveSample,
    previewCurrentSelection,
    play,
    stop,
    toggleLoop,
    toggleDrumStep,
    clearDrumPattern,
  } = useAudioEngine();

  const [draggedLibrarySample, setDraggedLibrarySample] = useState<Sample | null>(null);

  const handleLibrarySampleDragStart = (sample: Sample) => {
    setDraggedLibrarySample(sample);
  };

  const handleLibrarySampleDrop = (sample: Sample, slotId: number) => {
    addLibrarySampleToSlot(sample, slotId);
    setDraggedLibrarySample(null);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-6xl mb-4">🎵</div>
          <div className="text-xl font-semibold text-gray-700">Loading SoundBlocks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <Header />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Top section: Audio source and sample cutter */}
        <AudioSource
          tracks={tracks}
          currentTrackId={currentTrackId}
          waveformData={sourceWaveform}
          sourceDuration={sourceDuration}
          cutterPosition={cutterPosition}
          onCutterPositionChange={updateCutterPosition}
          onPreview={previewCurrentSelection}
          onAddSample={addSampleToLibrary}
          onUploadTrack={uploadTrack}
          onSelectTrack={selectTrack}
          onRemoveTrack={removeTrack}
        />

        {/* Sample Library */}
        <SampleLibrary
          samples={librarySamples}
          onRemoveSample={removeSampleFromLibrary}
          onDragStart={handleLibrarySampleDragStart}
        />

        {/* Sequencer */}
        <Sequencer
          slots={slots}
          isPlaying={isPlaying}
          isLooping={isLooping}
          currentSlot={currentSlot}
          onPlay={play}
          onStop={stop}
          onToggleLoop={toggleLoop}
          onRemoveSample={removeSampleFromSlot}
          onReplaceSample={replaceSampleInSlot}
          onMoveSample={moveSample}
          onLibrarySampleDrop={handleLibrarySampleDrop}
          draggedLibrarySample={draggedLibrarySample}
        />

        {/* 808 Drum Machine */}
        <DrumMachine
          pattern={drumPattern}
          currentStep={currentDrumStep}
          isPlaying={isPlaying}
          onToggleStep={toggleDrumStep}
          onClear={clearDrumPattern}
        />

        {/* Instructions */}
        <div className="bg-white bg-opacity-50 backdrop-blur rounded-xl p-6 text-center">
          <h3 className="font-bold text-gray-800 mb-2">How to use:</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>1. Drag the blue window on the waveform to select a sound</p>
            <p>2. Click "Preview" to hear it, or "Add to Library" to save it</p>
            <p>3. Drag samples from the library to the sequencer slots below</p>
            <p>4. Reuse the same sample in multiple slots if you want!</p>
            <p>5. Press "Play" to hear your creation • Enable "Loop" to repeat</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
