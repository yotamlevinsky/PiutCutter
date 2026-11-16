interface DrumMachineProps {
  pattern: boolean[][]; // [drumIndex][stepIndex]
  currentStep: number;
  isPlaying: boolean;
  onToggleStep: (drumIndex: number, stepIndex: number) => void;
  onClear: () => void;
}

const DRUM_NAMES = ['Kick', 'Snare', 'HH Closed', 'HH Open', 'Clap'];
const STEPS = 16;

export function DrumMachine({
  pattern,
  currentStep,
  isPlaying,
  onToggleStep,
  onClear,
}: DrumMachineProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">808 Drum Machine</h2>
          <p className="text-sm text-gray-600">Click to toggle steps • Syncs with sequencer</p>
        </div>
        <button
          onClick={onClear}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
        >
          Clear Pattern
        </button>
      </div>

      {/* Step sequencer grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Step numbers */}
          <div className="flex mb-2">
            <div className="w-24 flex-shrink-0"></div>
            {Array.from({ length: STEPS }).map((_, i) => (
              <div
                key={i}
                className={`w-10 h-6 flex items-center justify-center text-xs font-bold mx-0.5 rounded ${
                  isPlaying && currentStep === i
                    ? 'bg-yellow-400 text-gray-900'
                    : i % 4 === 0
                    ? 'bg-gray-200 text-gray-700'
                    : 'text-gray-500'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Drum rows */}
          {pattern.map((drumSteps, drumIndex) => (
            <div key={drumIndex} className="flex mb-1">
              {/* Drum name */}
              <div className="w-24 flex-shrink-0 flex items-center">
                <span className="text-sm font-semibold text-gray-700">
                  {DRUM_NAMES[drumIndex]}
                </span>
              </div>

              {/* Steps */}
              {drumSteps.map((isActive, stepIndex) => (
                <button
                  key={stepIndex}
                  onClick={() => onToggleStep(drumIndex, stepIndex)}
                  className={`w-10 h-10 mx-0.5 rounded-lg transition-all ${
                    isActive
                      ? isPlaying && currentStep === stepIndex
                        ? 'bg-yellow-400 scale-110 shadow-lg'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                      : isPlaying && currentStep === stepIndex
                      ? 'bg-yellow-100 border-2 border-yellow-400'
                      : stepIndex % 4 === 0
                      ? 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                  title={`${DRUM_NAMES[drumIndex]} - Step ${stepIndex + 1}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
