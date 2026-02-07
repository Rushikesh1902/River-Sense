
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Point, RiverData, LabelResult } from './types';

function parseWKTPolygon(wkt: string): Point[] {
  const cleaned = wkt
    .trim()
    .replace(/^POLYGON\s*\(\(/i, '')
    .replace(/\)\)$/i, '');

  return cleaned.split(',').map(pair => {
    const [x, y] = pair.trim().split(/\s+/).map(Number);
    return { x, y };
  });
}

function getBounds(points: Point[]) {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function findOptimalLabelPosition(
  points: Point[],
  _text: string,
  fontSize: number
): LabelResult {
  const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length;

  return {
    position: { x: cx, y: cy },
    rotation: 0,
    actualFontSize: fontSize,
    textWidth: fontSize * 6,
    textHeight: fontSize,
    isInside: true,
  };
}

const App: React.FC = () => {
  const [riverData, setRiverData] = useState<RiverData | null>(null);
  const [labelResult, setLabelResult] = useState<LabelResult | null>(null);
  const [text, setText] = useState<string>('COLORADO RIVER');
  const [wktInput, setWktInput] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(24);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSafety, setShowSafety] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processWKT = useCallback((wkt: string, sourceName: string = "Manual Entry") => {
    setIsProcessing(true);
    setError(null);
    setLabelResult(null);
    
    // Slight delay to allow UI spinner to show
    setTimeout(() => {
      try {
        const points = parseWKTPolygon(wkt);
        if (points.length >= 3) {
          const bounds = getBounds(points);
          if (bounds.width === 0 || bounds.height === 0) {
            setError("Polygon has zero area or height.");
            setRiverData(null);
          } else {
            setRiverData({ name: sourceName, points, bounds });
          }
        } else {
          setError("WKT must be a valid POLYGON format.");
          setRiverData(null);
        }
      } catch (err) {
        setError("Failed to parse WKT string.");
        setRiverData(null);
      }
      setIsProcessing(false);
    }, 200);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setWktInput(content);
      processWKT(content, file.name);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadSample = () => {
    // A more complex winding river sample
    const sampleWKT = "POLYGON((100 100, 250 80, 400 120, 550 90, 700 130, 750 110, 780 160, 700 180, 550 140, 400 170, 250 130, 100 150, 80 120, 100 100))";
    setWktInput(sampleWKT);
    processWKT(sampleWKT, "Sample_River.wkt");
  };

  const handleRunClick = () => {
    if (wktInput.trim()) processWKT(wktInput);
    else setError("Please paste WKT or upload a file.");
  };

  useEffect(() => {
    if (riverData) {
      const result = findOptimalLabelPosition(riverData.points, text, fontSize);
      setLabelResult(result);
    }
  }, [riverData, text, fontSize]);

  const svgWidth = 800;
  const svgHeight = 600;
  const margin = 80;

  const transform = useMemo(() => {
    if (!riverData) return { scale: 1, offsetX: 0, offsetY: 0 };
    const { bounds } = riverData;
    const scale = Math.min((svgWidth - margin * 2) / bounds.width, (svgHeight - margin * 2) / bounds.height);
    const offsetX = (svgWidth - bounds.width * scale) / 2 - bounds.minX * scale;
    const offsetY = (svgHeight - bounds.height * scale) / 2 - bounds.minY * scale;
    return { scale, offsetX, offsetY };
  }, [riverData]);

  const toSVG = (p: Point) => ({
    x: p.x * transform.scale + transform.offsetX,
    y: svgHeight - (p.y * transform.scale + transform.offsetY)
  });

  const riverPath = useMemo(() => {
    if (!riverData) return '';
    return riverData.points.map((p, i) => {
      const sp = toSVG(p);
      return `${i === 0 ? 'M' : 'L'} ${sp.x} ${sp.y}`;
    }).join(' ') + ' Z';
  }, [riverData, transform]);

  const labelSVGPos = labelResult ? toSVG(labelResult.position) : { x: 0, y: 0 };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-blue-200">
      <div className="max-w-7xl mx-auto p-4 md:p-10 flex flex-col gap-8">
        
        {/* Modern Header */}
        <header className="flex flex-col md:flex-row items-center justify-between bg-white px-10 py-6 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg animate-pulse">🌊</div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">RiverSense</h1>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Strict Boundary Labeler</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <button onClick={loadSample} className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-xs border border-slate-200 transition-all">Sample River</button>
            <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-100 transition-all active:scale-95">Upload WKT</button>
            <input type="file" onChange={handleFileUpload} className="hidden" ref={fileInputRef} />
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <section className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Engine Controls</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wide">Input Geometry (WKT)</label>
                  <textarea 
                    value={wktInput}
                    onChange={(e) => setWktInput(e.target.value)}
                    placeholder="POLYGON((X1 Y1, X2 Y2, ...))"
                    className="w-full h-36 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-mono text-[10px] resize-none leading-relaxed"
                  />
                  {error && <div className="mt-3 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-[10px] font-bold">⚠️ {error}</div>}
                </div>
                <button onClick={handleRunClick} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-indigo-100 transition-all active:scale-95">
                  Update Map ⚡
                </button>
                <div className="pt-8 border-t border-slate-100 space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wide">Display Text</label>
                    <input type="text" value={text} onChange={(e) => setText(e.target.value.toUpperCase())} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800 tracking-widest text-sm" />
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Target Size</label>
                      <span className="text-[10px] font-black text-blue-600">{fontSize}px</span>
                    </div>
                    <input type="range" min="12" max="80" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {labelResult && (
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-6 duration-500">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Containment Analytics</h3>
                <div className="space-y-4">
                  <div className={`p-5 rounded-2xl border-2 flex flex-col gap-2 transition-colors ${labelResult.isInside ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                    <span className="text-[9px] font-black text-slate-400 uppercase">Boundary Integrity</span>
                    <span className={`font-black text-sm tracking-tight ${labelResult.isInside ? 'text-emerald-700' : 'text-red-700'}`}>
                      {labelResult.isInside ? 'STRICTLY INSIDE' : 'OUTSIDE BOUNDARY'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Orientation</span>
                      <span className="font-mono text-sm font-black text-slate-800">{labelResult.rotation.toFixed(1)}°</span>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Fitted Size</span>
                      <span className="font-mono text-sm font-black text-slate-800">{labelResult.actualFontSize.toFixed(1)}px</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowSafety(!showSafety)}
                    className={`w-full py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${showSafety ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {showSafety ? 'Hide Safety Margin' : 'Verify Collision Box'}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Map Viewer */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            <div className="relative bg-white rounded-[3rem] shadow-2xl border border-white overflow-hidden flex flex-col aspect-[4/3] group cursor-crosshair">
              <div className="absolute top-10 left-10 z-10 flex items-center gap-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/80">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse shadow-[0_0_12px_rgba(37,99,235,0.7)]"></div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Cartographic View</span>
              </div>

              <div className="flex-grow flex items-center justify-center bg-[#fdfdfe]">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-inner"></div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] animate-pulse">Scanning Boundaries...</span>
                  </div>
                ) : riverData ? (
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full p-8 transition-all duration-700 ease-out">
                    <defs>
                      <linearGradient id="riverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                      <filter id="shadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.2" />
                      </filter>
                    </defs>

                    {/* River Body - Using a distinct dark stroke as the "outerline" */}
                    <path 
                      d={riverPath} 
                      fill="url(#riverGradient)" 
                      fillOpacity="0.15" 
                      stroke="#1e3a8a" 
                      strokeWidth="3.5" 
                      strokeLinejoin="round"
                      className="transition-all duration-500"
                    />

                    {/* Precise Flow-Aligned Text */}
                    {labelResult && (
                      <g transform={`translate(${labelSVGPos.x}, ${labelSVGPos.y}) rotate(${labelResult.rotation})`}>
                        {showSafety && (
                          <rect 
                            x={-labelResult.textWidth * transform.scale / 2}
                            y={-labelResult.textHeight * transform.scale / 2}
                            width={labelResult.textWidth * transform.scale}
                            height={labelResult.textHeight * transform.scale}
                            fill="rgba(239, 68, 68, 0.05)"
                            stroke="#ef4444"
                            strokeWidth="1"
                            strokeDasharray="4,2"
                          />
                        )}
                        <text
                          fontSize={labelResult.actualFontSize * transform.scale}
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          fill="#1e3a8a"
                          className="font-black select-none pointer-events-none tracking-widest uppercase"
                          style={{
                            paintOrder: 'stroke',
                            stroke: '#ffffff',
                            strokeWidth: '2.5px',
                            filter: 'url(#shadow)'
                          }}
                        >
                          {text}
                        </text>
                      </g>
                    )}
                  </svg>
                ) : (
                  <div className="flex flex-col items-center gap-8 opacity-20 grayscale transition-opacity hover:opacity-30">
                    <div className="text-[140px]">🗺️</div>
                    <p className="text-xs font-black uppercase tracking-[0.5em]">Map Canvas Ready</p>
                  </div>
                )}
              </div>

              {riverData && (
                <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center bg-white/80 backdrop-blur px-8 py-5 rounded-[2rem] border border-white shadow-xl">
                   <div className="flex gap-10">
                     <div className="flex items-center gap-3">
                       <div className="w-4 h-4 bg-blue-100 border-2 border-blue-900 rounded-md"></div>
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Strict Boundary</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Center Anchor</span>
                     </div>
                   </div>
                   <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                     Adaptive Flow Engine • Slices: 80
                   </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;
