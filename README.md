# RiverSense — Intelligent River Label Placement

Deployed Link : https://rushikesh1902.github.io/River-Sense/

A React + TypeScript + Vite application for intelligent label placement on river polygons with strict boundary containment checking.

## Features
- **WKT Polygon Parsing**: Upload or paste WKT polygon data for river geometry
- **Intelligent Label Placement**: Automatic optimal label positioning following river flow
- **Strict Boundary Enforcement**: Labels stay within polygon boundaries
- **Real-time Visualization**: SVG-based cartographic view with interactive controls
- **Responsive UI**: Built with Tailwind CSS and modern React patterns

## Prerequisites
- Node.js 16+ 
- npm or yarn

## Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USER/REPO_NAME.git
   cd REPO_NAME
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Gemini API key if needed

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser.

## Build & Deploy

Build for production:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

Deploy to Vercel:
- Push to GitHub
- Connect your repo to [Vercel](https://vercel.com)
- Vercel will auto-detect Vite and deploy

## Project Structure
```
.
├── App.tsx              # Main React component
├── index.tsx            # React DOM entry point
├── types.ts             # TypeScript interfaces
├── utils/
│   ├── geometry.ts      # Polygon math & containment
│   └── wktParser.ts     # WKT parsing logic
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript config
├── package.json         # Dependencies
└── index.html           # HTML template
```

## Technologies
- **React 19** — UI framework
- **TypeScript** — Type safety
- **Vite** — Fast build tool
- **Tailwind CSS** — Styling
- **SVG** — Vector graphics rendering

## License
MIT
