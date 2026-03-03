# [RiverSense](https://rushikesh1902.github.io/River-Sense/) — Intelligent River Label Placement



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

## Techstack
- **React 19** — UI framework
- **TypeScript** — Type safety
- **Vite** — Fast build tool
- **Tailwind CSS** — Styling
- **SVG** — Vector graphics rendering


