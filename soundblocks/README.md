# SoundBlocks 🎵

A playful, browser-based audio sampler and sequencer designed for children, beginners, and anyone who wants to create music without prior production experience.

## Features

- **Interactive Waveform Viewer**: See your audio as a visual waveform
- **Sample Cutter**: Drag a window across the waveform to select 2-second audio segments
- **Preview Samples**: Listen to your selection before adding it
- **8-Slot Sequencer**: Build patterns by arranging up to 8 audio blocks
- **Drag & Drop**: Rearrange blocks easily
- **Loop Mode**: Continuously repeat your creation
- **Real Audio Engine**: Uses Web Audio API for precise, gapless playback
- **No Setup Required**: Fully client-side, no backend needed

## Technology Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Web Audio API** for audio processing and playback
- **Lucide Icons** for UI elements

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd soundblocks
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to [http://localhost:5173](http://localhost:5173)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Lint the code

### Project Structure

```
src/
├── components/         # React components
│   ├── Header.tsx
│   ├── AudioSource.tsx
│   ├── WaveformViewer.tsx
│   ├── SampleCutter.tsx
│   ├── Sequencer.tsx
│   ├── SequencerSlot.tsx
│   └── TransportControls.tsx
├── audio/             # Audio engine and generation
│   ├── AudioEngine.ts
│   └── generateDemoAudio.ts
├── hooks/             # React hooks
│   └── useAudioEngine.ts
├── types/             # TypeScript interfaces
│   └── index.ts
├── utils/             # Helper functions
│   └── helpers.ts
├── App.tsx           # Main app component
└── main.tsx          # App entry point
```

## How to Use

1. **Select a Sound**: Drag the blue window on the waveform to choose a 2-second segment
2. **Preview**: Click "Preview" to hear your selection
3. **Add to Sequencer**: Click "Add to Sequencer" to create a new block
4. **Build Your Pattern**: Repeat steps 1-3 to create up to 8 different blocks
5. **Play**: Press the "Play" button to hear your creation
6. **Loop**: Enable "Loop" to continuously repeat your pattern
7. **Rearrange**: Drag blocks to change the order
8. **Replace/Remove**: Hover over blocks to replace or remove them

## Deployment

### Deploy to Vercel

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)

3. Click "New Project"

4. Import your GitHub repository

5. Vercel will auto-detect Vite configuration

6. Click "Deploy"

Your app will be live in minutes!

### Deploy to Other Platforms

Since this is a static site, you can deploy to:

- **Netlify**: Drag the `dist` folder to netlify.com/drop
- **GitHub Pages**: Use `gh-pages` branch
- **Cloudflare Pages**: Connect your GitHub repo
- **Any static hosting**: Upload the contents of the `dist` folder

## Audio Architecture

### Key Design Decisions

1. **AudioBuffer-based**: Source audio is loaded once into an AudioBuffer. Samples are references (offset + duration) rather than copies.

2. **Lookahead Scheduling**: Uses Web Audio API's precise timing with 100ms lookahead to ensure gapless playback.

3. **Fade Envelopes**: 10ms fade in/out on each sample prevents audible clicks at boundaries.

4. **Demo Audio**: Generates a musical loop using Web Audio API oscillators and synthesis (no external files required for MVP).

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires browsers with modern Web Audio API support.

## Future Enhancements

Potential features for future versions:

- Upload custom audio files
- Multiple parallel sequencer tracks
- BPM-based timing and quantization
- Time stretching to fit samples to tempo
- Record from microphone
- Save/load compositions
- Export to WAV
- Visual effects and animations
- MIDI controller support
- More sample editing tools

## License

MIT

## Credits

Built as an MVP demonstrating:
- Clean React + TypeScript architecture
- Proper Web Audio API usage
- Intuitive UX for music creation
- Deployment-ready Vite configuration
