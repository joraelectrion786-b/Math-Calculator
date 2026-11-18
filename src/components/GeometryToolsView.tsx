import { useState } from 'react';
import type { Language } from '../types';

interface GeometryToolsViewProps {
  language: Language;
}

type ShapeTool = 'triangle' | 'square' | 'rectangle' | 'circle' | 'angles' | 'volume';
type Solid3D = 'cube' | 'cuboid' | 'cylinder' | 'cone' | 'sphere';

export function GeometryToolsView({ language }: GeometryToolsViewProps) {
  const isUr = language === 'ur';
  const [tool, setTool] = useState<ShapeTool>('triangle');

  // 2D Interactive parameters
  const [triBase, setTriBase] = useState(12);
  const [triHeight, setTriHeight] = useState(8);
  const [sqSide, setSqSide] = useState(9);
  const [rectL, setRectL] = useState(14);
  const [rectW, setRectW] = useState(8);
  const [circleR, setCircleR] = useState(7);
  const [angleDeg, setAngleDeg] = useState(60);

  // 3D Volume parameters
  const [solid, setSolid] = useState<Solid3D>('cylinder');
  const [dimA, setDimA] = useState(7); // radius or length
  const [dimB, setDimB] = useState(10); // height or width
  const [dimC, setDimC] = useState(6); // depth for cuboid

  const toolTabs: Array<{ id: ShapeTool; en: string; ur: string }> = [
    { id: 'triangle', en: 'Triangle', ur: 'مثلث' },
    { id: 'square', en: 'Square', ur: 'مربع' },
    { id: 'rectangle', en: 'Rectangle', ur: 'مستطیل' },
    { id: 'circle', en: 'Circle', ur: 'دائرہ' },
    { id: 'angles', en: 'Angles', ur: 'زاویے' },
    { id: 'volume', en: '3D Volume & Shapes', ur: 'حجم اور سہ ابعادی اشکال' },
  ];

  // Angle classification
  const classifyAngle = (deg: number) => {
    if (deg === 0) return isUr ? 'صفر زاویہ (Zero Angle)' : 'Zero Angle';
    if (deg < 90) return isUr ? 'حادہ زاویہ (Acute Angle)' : 'Acute Angle (< 90°)';
    if (deg === 90) return isUr ? 'قائمہ زاویہ (Right Angle)' : 'Right Angle (= 90°)';
    if (deg < 180) return isUr ? 'منفرجہ زاویہ (Obtuse Angle)' : 'Obtuse Angle (90°–180°)';
    if (deg === 180) return isUr ? 'مستقیم زاویہ (Straight Angle)' : 'Straight Angle (= 180°)';
    if (deg < 360) return isUr ? 'منعکس زاویہ (Reflex Angle)' : 'Reflex Angle (180°–360°)';
    return isUr ? 'مکمل زاویہ (Full Rotation)' : 'Full Rotation (= 360°)';
  };

  // Volume computations
  const computeSolidStats = () => {
    const pi = Math.PI;
    if (solid === 'cube') {
      return {
        volume: (dimA ** 3).toFixed(2),
        surfaceArea: (6 * dimA * dimA).toFixed(2),
        formulaV: 'V = s³',
        formulaSA: 'TSA = 6s²',
      };
    }
    if (solid === 'cuboid') {
      return {
        volume: (dimA * dimB * dimC).toFixed(2),
        surfaceArea: (2 * (dimA * dimB + dimB * dimC + dimA * dimC)).toFixed(2),
        formulaV: 'V = l × w × h',
        formulaSA: 'TSA = 2(lw + wh + lh)',
      };
    }
    if (solid === 'cylinder') {
      return {
        volume: (pi * dimA * dimA * dimB).toFixed(2),
        surfaceArea: (2 * pi * dimA * (dimA + dimB)).toFixed(2),
        formulaV: 'V = πr²h',
        formulaSA: 'TSA = 2πr(r + h)',
      };
    }
    if (solid === 'cone') {
      const slant = Math.sqrt(dimA * dimA + dimB * dimB);
      return {
        volume: ((1 / 3) * pi * dimA * dimA * dimB).toFixed(2),
        surfaceArea: (pi * dimA * (dimA + slant)).toFixed(2),
        formulaV: 'V = ⅓πr²h',
        formulaSA: 'TSA = πr(r + l), l = √(r²+h²)',
      };
    }
    return {
      volume: ((4 / 3) * pi * dimA ** 3).toFixed(2),
      surfaceArea: (4 * pi * dimA * dimA).toFixed(2),
      formulaV: 'V = (4/3)πr³',
      formulaSA: 'SA = 4πr²',
    };
  };

  const solidStats = computeSolidStats();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isUr ? 'انٹرایکٹو جیومیٹری لیب' : 'Interactive Geometry Tools'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isUr
              ? 'مثلث، مربع، مستطیل، دائرہ، زاویے، احاطہ، رقبہ اور سہ ابعادی اشکال کا حجم براہ راست سلائیڈرز سے سمجھیں۔'
              : 'Explore shapes, angles, perimeter, area, and 3D volume interactively with live mathematical diagrams.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {toolTabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTool(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                tool === item.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isUr ? item.ur : item.en}
            </button>
          ))}
        </div>
      </div>

      {/* Two-zone Educational Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Canvas Stage (Left / Top) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center justify-center min-h-[320px]">
          {tool === 'triangle' && (
            <svg viewBox="0 0 320 220" className="w-full max-w-md">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="320" height="220" fill="url(#grid)" rx="12" />
              {(() => {
                const bw = Math.min(240, Math.max(80, triBase * 11));
                const bh = Math.min(150, Math.max(50, triHeight * 9));
                const x1 = 160 - bw / 2;
                const x2 = 160 + bw / 2;
                const yBottom = 185;
                const yTop = yBottom - bh;
                return (
                  <>
                    <polygon
                      points={`${x1},${yBottom} ${x2},${yBottom} 160,${yTop}`}
                      fill="rgba(37, 99, 235, 0.16)"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                    />
                    <line
                      x1="160"
                      y1={yTop}
                      x2="160"
                      y2={yBottom}
                      stroke="#D97706"
                      strokeWidth="2"
                      strokeDasharray="5 4"
                    />
                    <text x="160" y={yBottom + 18} textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="600">
                      base = {triBase} cm
                    </text>
                    <text x="168" y={(yTop + yBottom) / 2} fill="#D97706" fontSize="12" fontWeight="600">
                      h = {triHeight} cm
                    </text>
                  </>
                );
              })()}
            </svg>
          )}

          {tool === 'square' && (
            <svg viewBox="0 0 320 220" className="w-full max-w-md">
              {(() => {
                const s = Math.min(160, Math.max(60, sqSide * 9));
                const x = 160 - s / 2;
                const y = 110 - s / 2;
                return (
                  <>
                    <rect
                      x={x}
                      y={y}
                      width={s}
                      height={s}
                      fill="rgba(79, 70, 229, 0.15)"
                      stroke="#4F46E5"
                      strokeWidth="2.5"
                      rx="2"
                    />
                    <line
                      x1={x}
                      y1={y + s}
                      x2={x + s}
                      y2={y}
                      stroke="#059669"
                      strokeWidth="2"
                      strokeDasharray="5 4"
                    />
                    <text x="160" y={y + s + 18} textAnchor="middle" fill="#4F46E5" fontSize="12" fontWeight="600">
                      side = {sqSide} cm
                    </text>
                  </>
                );
              })()}
            </svg>
          )}

          {tool === 'rectangle' && (
            <svg viewBox="0 0 320 220" className="w-full max-w-md">
              {(() => {
                const w = Math.min(240, Math.max(80, rectL * 10));
                const h = Math.min(150, Math.max(50, rectW * 8));
                const x = 160 - w / 2;
                const y = 110 - h / 2;
                return (
                  <>
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill="rgba(5, 150, 105, 0.15)"
                      stroke="#059669"
                      strokeWidth="2.5"
                    />
                    <line
                      x1={x}
                      y1={y + h}
                      x2={x + w}
                      y2={y}
                      stroke="#D97706"
                      strokeWidth="2"
                      strokeDasharray="5 4"
                    />
                    <text x="160" y={y + h + 18} textAnchor="middle" fill="#059669" fontSize="12" fontWeight="600">
                      length = {rectL} cm
                    </text>
                    <text x={x - 10} y="114" textAnchor="end" fill="#059669" fontSize="12" fontWeight="600">
                      w={rectW}
                    </text>
                  </>
                );
              })()}
            </svg>
          )}

          {tool === 'circle' && (
            <svg viewBox="0 0 320 220" className="w-full max-w-md">
              {(() => {
                const rPx = Math.min(92, Math.max(28, circleR * 5.2));
                return (
                  <>
                    <circle
                      cx="160"
                      cy="110"
                      r={rPx}
                      fill="rgba(13, 148, 136, 0.14)"
                      stroke="#0D9488"
                      strokeWidth="2.5"
                    />
                    <line x1="160" y1="110" x2={160 + rPx} y2="110" stroke="#2563EB" strokeWidth="2.5" />
                    <circle cx="160" cy="110" r="3.5" fill="#2563EB" />
                    <text x={160 + rPx / 2} y="102" textAnchor="middle" fill="#2563EB" fontSize="12" fontWeight="700">
                      r = {circleR} cm
                    </text>
                  </>
                );
              })()}
            </svg>
          )}

          {tool === 'angles' && (
            <svg viewBox="0 0 320 220" className="w-full max-w-md">
              {(() => {
                const cx = 160;
                const cy = 130;
                const len = 85;
                const rad = (-angleDeg * Math.PI) / 180;
                const x2 = cx + len * Math.cos(rad);
                const y2 = cy + len * Math.sin(rad);
                const arcR = 36;
                const ax = cx + arcR * Math.cos(rad);
                const ay = cy + arcR * Math.sin(rad);
                const largeArc = angleDeg > 180 ? 1 : 0;
                return (
                  <>
                    <circle cx={cx} cy={cy} r={len} fill="none" stroke="rgba(148,163,184,0.2)" strokeDasharray="3 3" />
                    <path
                      d={`M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${largeArc} 0 ${ax} ${ay} L ${cx} ${cy} Z`}
                      fill="rgba(37, 99, 235, 0.2)"
                    />
                    <line x1={cx} y1={cy} x2={cx + len} y2={cy} stroke="#64748B" strokeWidth="2.5" />
                    <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#2563EB" strokeWidth="3" />
                    <circle cx={cx} cy={cy} r="4" fill="#1E293B" />
                    <text x={cx} y="25" textAnchor="middle" fill="#2563EB" fontSize="15" fontWeight="700">
                      {angleDeg}°
                    </text>
                  </>
                );
              })()}
            </svg>
          )}

          {tool === 'volume' && (
            <svg viewBox="0 0 320 230" className="w-full max-w-md">
              {solid === 'cube' && (
                <g>
                  <polygon points="160,35 230,75 160,115 90,75" fill="#93C5FD" stroke="#1D4ED8" strokeWidth="2" />
                  <polygon points="90,75 160,115 160,190 90,150" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="2" />
                  <polygon points="230,75 230,150 160,190 160,115" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
                  <text x="160" y="215" textAnchor="middle" fill="#64748B" fontSize="12">
                    Cube · s = {dimA} cm
                  </text>
                </g>
              )}
              {solid === 'cuboid' && (
                <g>
                  <polygon points="160,45 250,82 160,120 70,82" fill="#A5B4FC" stroke="#4338CA" strokeWidth="2" />
                  <polygon points="70,82 160,120 160,185 70,147" fill="#818CF8" stroke="#4338CA" strokeWidth="2" />
                  <polygon points="250,82 250,147 160,185 160,120" fill="#4F46E5" stroke="#4338CA" strokeWidth="2" />
                  <text x="160" y="212" textAnchor="middle" fill="#64748B" fontSize="12">
                    Cuboid · {dimA} × {dimB} × {dimC} cm
                  </text>
                </g>
              )}
              {solid === 'cylinder' && (
                <g>
                  <path d="M105 65 v105 a55 20 0 0 0 110 0 v-105 z" fill="#10B981" stroke="#047857" strokeWidth="2" />
                  <ellipse cx="160" cy="65" rx="55" ry="20" fill="#34D399" stroke="#047857" strokeWidth="2" />
                  <line x1="160" y1="65" x2="215" y2="65" stroke="#064E3B" strokeWidth="2" />
                  <text x="160" y="212" textAnchor="middle" fill="#64748B" fontSize="12">
                    Cylinder · r = {dimA} cm, h = {dimB} cm
                  </text>
                </g>
              )}
              {solid === 'cone' && (
                <g>
                  <ellipse cx="160" cy="175" rx="60" ry="20" fill="#D97706" stroke="#92400E" strokeWidth="2" />
                  <polygon points="160,35 220,175 100,175" fill="#FBBF24" stroke="#92400E" strokeWidth="2" opacity="0.9" />
                  <line x1="160" y1="35" x2="160" y2="175" stroke="#78350F" strokeDasharray="4 3" strokeWidth="1.5" />
                  <text x="160" y="215" textAnchor="middle" fill="#64748B" fontSize="12">
                    Cone · r = {dimA} cm, h = {dimB} cm
                  </text>
                </g>
              )}
              {solid === 'sphere' && (
                <g>
                  <defs>
                    <radialGradient id="sphereGrad" cx="35%" cy="30%" r="65%">
                      <stop offset="0%" stopColor="#99F6E4" />
                      <stop offset="55%" stopColor="#14B8A6" />
                      <stop offset="100%" stopColor="#115E59" />
                    </radialGradient>
                  </defs>
                  <circle cx="160" cy="110" r="72" fill="url(#sphereGrad)" />
                  <ellipse cx="160" cy="110" rx="72" ry="20" fill="none" stroke="rgba(255,255,255,0.45)" strokeDasharray="4 4" />
                  <text x="160" y="210" textAnchor="middle" fill="#64748B" fontSize="12">
                    Sphere · r = {dimA} cm
                  </text>
                </g>
              )}
            </svg>
          )}
        </div>

        {/* Controls & Live Formulas (Right / Bottom) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
          {tool === 'triangle' && (
            <>
              <h2 className="text-lg font-bold">{isUr ? 'مثلث کے خواص' : 'Triangle Properties'}</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Base (b)</span>
                    <span className="font-mono tabular-nums">{triBase} cm</span>
                  </div>
                  <input type="range" min="4" max="24" value={triBase} onChange={(e) => setTriBase(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Height (h)</span>
                    <span className="font-mono tabular-nums">{triHeight} cm</span>
                  </div>
                  <input type="range" min="4" max="20" value={triHeight} onChange={(e) => setTriHeight(Number(e.target.value))} className="w-full" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-sm tabular-nums">
                <div>Area = ½ × {triBase} × {triHeight} = <strong className="font-mono text-blue-600">{0.5 * triBase * triHeight} cm²</strong></div>
                <div>Interior Angle Sum = <strong className="font-mono">180°</strong></div>
              </div>
            </>
          )}

          {tool === 'square' && (
            <>
              <h2 className="text-lg font-bold">{isUr ? 'مربع کے خواص' : 'Square Properties'}</h2>
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Side Length (s)</span>
                  <span className="font-mono tabular-nums">{sqSide} cm</span>
                </div>
                <input type="range" min="3" max="20" value={sqSide} onChange={(e) => setSqSide(Number(e.target.value))} className="w-full" />
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-sm font-mono tabular-nums">
                <div>Perimeter = 4s = <strong>{4 * sqSide} cm</strong></div>
                <div>Area = s² = <strong>{sqSide * sqSide} cm²</strong></div>
                <div>Diagonal = s√2 ≈ <strong>{(sqSide * Math.SQRT2).toFixed(2)} cm</strong></div>
              </div>
            </>
          )}

          {tool === 'rectangle' && (
            <>
              <h2 className="text-lg font-bold">{isUr ? 'مستطیل کے خواص' : 'Rectangle Properties'}</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Length (l)</span>
                    <span className="font-mono tabular-nums">{rectL} cm</span>
                  </div>
                  <input type="range" min="5" max="24" value={rectL} onChange={(e) => setRectL(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Width (w)</span>
                    <span className="font-mono tabular-nums">{rectW} cm</span>
                  </div>
                  <input type="range" min="3" max="18" value={rectW} onChange={(e) => setRectW(Number(e.target.value))} className="w-full" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-sm font-mono tabular-nums">
                <div>Perimeter = 2(l + w) = <strong>{2 * (rectL + rectW)} cm</strong></div>
                <div>Area = l × w = <strong>{rectL * rectW} cm²</strong></div>
                <div>Diagonal = √(l² + w²) ≈ <strong>{Math.hypot(rectL, rectW).toFixed(2)} cm</strong></div>
              </div>
            </>
          )}

          {tool === 'circle' && (
            <>
              <h2 className="text-lg font-bold">{isUr ? 'دائرے کے خواص' : 'Circle Properties'}</h2>
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Radius (r)</span>
                  <span className="font-mono tabular-nums">{circleR} cm</span>
                </div>
                <input type="range" min="2" max="21" value={circleR} onChange={(e) => setCircleR(Number(e.target.value))} className="w-full" />
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-sm font-mono tabular-nums">
                <div>Diameter = 2r = <strong>{2 * circleR} cm</strong></div>
                <div>Circumference = 2πr ≈ <strong>{(2 * Math.PI * circleR).toFixed(2)} cm</strong></div>
                <div>Area = πr² ≈ <strong>{(Math.PI * circleR * circleR).toFixed(2)} cm²</strong></div>
              </div>
            </>
          )}

          {tool === 'angles' && (
            <>
              <h2 className="text-lg font-bold">{isUr ? 'زاویوں کی اقسام' : 'Angle Explorer'}</h2>
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Angle (θ)</span>
                  <span className="font-mono tabular-nums">{angleDeg}°</span>
                </div>
                <input type="range" min="0" max="360" step="5" value={angleDeg} onChange={(e) => setAngleDeg(Number(e.target.value))} className="w-full" />
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-sm tabular-nums">
                <div>Type: <strong className="text-blue-600 dark:text-blue-400">{classifyAngle(angleDeg)}</strong></div>
                {angleDeg <= 90 && <div>Complement (90° − θ) = <strong className="font-mono">{90 - angleDeg}°</strong></div>}
                {angleDeg <= 180 && <div>Supplement (180° − θ) = <strong className="font-mono">{180 - angleDeg}°</strong></div>}
              </div>
            </>
          )}

          {tool === 'volume' && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {(['cube', 'cuboid', 'cylinder', 'cone', 'sphere'] as Solid3D[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSolid(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer ${
                      solid === s
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>{solid === 'cube' ? 'Side (s)' : solid === 'cuboid' ? 'Length (l)' : 'Radius (r)'}</span>
                    <span className="font-mono tabular-nums">{dimA} cm</span>
                  </div>
                  <input type="range" min="2" max="15" value={dimA} onChange={(e) => setDimA(Number(e.target.value))} className="w-full" />
                </div>
                {(solid === 'cuboid' || solid === 'cylinder' || solid === 'cone') && (
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>{solid === 'cuboid' ? 'Width (w)' : 'Height (h)'}</span>
                      <span className="font-mono tabular-nums">{dimB} cm</span>
                    </div>
                    <input type="range" min="2" max="20" value={dimB} onChange={(e) => setDimB(Number(e.target.value))} className="w-full" />
                  </div>
                )}
                {solid === 'cuboid' && (
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Height (h)</span>
                      <span className="font-mono tabular-nums">{dimC} cm</span>
                    </div>
                    <input type="range" min="2" max="16" value={dimC} onChange={(e) => setDimC(Number(e.target.value))} className="w-full" />
                  </div>
                )}
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-sm font-mono tabular-nums">
                <div>{solidStats.formulaV} → <strong>{solidStats.volume} cm³</strong></div>
                <div>{solidStats.formulaSA} → <strong>{solidStats.surfaceArea} cm²</strong></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
