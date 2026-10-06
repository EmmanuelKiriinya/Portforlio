/**
 * The banded pattern system — see DESIGN.md.
 *
 * Drawn from the reference artwork: parallel bands of saturated colour, each
 * carrying one repeated motif, every shape outlined in black, bands divided by
 * thin gold rules. The motif vocabulary is taken directly from that image —
 * rolled spirals, angular meanders, sawtooth rows, dot rows, concentric rings,
 * zigzags, diamond lattices, scallops and stripe bundles.
 *
 * Compositions are generated from a seeded PRNG, so the server and client
 * render identical markup and a given seed always yields the same cloth.
 *
 * Colours come from the --pat-* tokens, which are pigments rather than
 * interface colours and are identical in both themes.
 */

const PIGMENTS = [
  "var(--pat-gold)",
  "var(--pat-amber)",
  "var(--pat-orange)",
  "var(--pat-red)",
  "var(--pat-green)",
  "var(--pat-cyan)",
  "var(--pat-royal)",
  "var(--pat-purple)",
] as const;

const INK = "var(--pat-ink)";
const GOLD = "var(--pat-gold)";

/** mulberry32 — small, fast, deterministic across environments. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type MotifKind =
  | "spiral" | "meander" | "sawtooth" | "dots" | "rings"
  | "zigzag" | "lattice" | "scallop" | "stripes" | "crosses" | "plain";

/* Weighted so the two most characteristic motifs — the rolled spiral and the
   angular meander — appear often enough to read as the signature. */
const MOTIF_WEIGHTS: [MotifKind, number][] = [
  ["spiral", 15], ["meander", 13], ["sawtooth", 14], ["dots", 10],
  ["rings", 8], ["zigzag", 12], ["lattice", 9], ["scallop", 7],
  ["stripes", 8], ["crosses", 6], ["plain", 6],
];

function pickMotif(r: number): MotifKind {
  const total = MOTIF_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let acc = r * total;
  for (const [kind, w] of MOTIF_WEIGHTS) {
    acc -= w;
    if (acc <= 0) return kind;
  }
  return "sawtooth";
}

/* ------------------------------------------------------------------ motifs */
/* Each returns the artwork for one segment of a band: a `w` wide, `h` tall box
   at y-offset 0, to be positioned by the caller. `fg` is the motif colour. */

function Spiral({ w, h, fg }: { w: number; h: number; fg: string }) {
  // A rolled scroll built from three half-arcs of decreasing radius —
  // the curl that repeats all through the reference artwork.
  const size = Math.min(w * 0.78, h * 0.9);
  const r1 = size / 2;
  const r2 = r1 * 0.62;
  const r3 = r2 * 0.6;
  const cx = w / 2;
  const cy = h / 2;
  const d =
    `M ${cx - r1} ${cy}` +
    ` a ${r1} ${r1} 0 0 1 ${r1 * 2} 0` +
    ` a ${r2} ${r2} 0 0 1 ${-r2 * 2} 0` +
    ` a ${r3} ${r3} 0 0 1 ${r3 * 2} 0`;
  return (
    <path d={d} fill="none" stroke={fg} strokeWidth={Math.max(1.4, size * 0.16)} strokeLinecap="round" />
  );
}

function Meander({ w, h, fg }: { w: number; h: number; fg: string }) {
  // Angular labyrinth key, as in the green sections of the artwork.
  const p = Math.min(w, h) * 0.16;
  const d =
    `M ${p} ${h - p}` +
    ` L ${p} ${p}` +
    ` L ${w - p} ${p}` +
    ` L ${w - p} ${h - p * 2.2}` +
    ` L ${p * 2.8} ${h - p * 2.2}` +
    ` L ${p * 2.8} ${p * 2.8}` +
    ` L ${w - p * 2.8} ${p * 2.8}`;
  return (
    <path d={d} fill="none" stroke={fg} strokeWidth={Math.max(1.4, p * 0.62)} strokeLinejoin="miter" />
  );
}

function Sawtooth({ w, h, fg, flip }: { w: number; h: number; fg: string; flip: boolean }) {
  const teeth = Math.max(2, Math.round(w / 11));
  const tw = w / teeth;
  const points: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const x = i * tw;
    points.push(
      flip
        ? `${x},0 ${x + tw / 2},${h} ${x + tw},0`
        : `${x},${h} ${x + tw / 2},0 ${x + tw},${h}`,
    );
  }
  return (
    <g fill={fg} stroke={INK} strokeWidth={0.9}>
      {points.map((pts, i) => <polygon key={i} points={pts} />)}
    </g>
  );
}

function Dots({ w, h, fg }: { w: number; h: number; fg: string }) {
  const cols = Math.max(2, Math.round(w / 13));
  const rows = Math.max(1, Math.round(h / 13));
  const cw = w / cols;
  const ch = h / rows;
  const r = Math.min(cw, ch) * 0.26;
  const out = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      out.push(<circle key={`${i}-${j}`} cx={cw * (i + 0.5)} cy={ch * (j + 0.5)} r={r} />);
    }
  }
  return <g fill={fg} stroke={INK} strokeWidth={0.7}>{out}</g>;
}

function Rings({ w, h, fg, alt }: { w: number; h: number; fg: string; alt: string }) {
  const r = Math.min(w, h) * 0.38;
  const cx = w / 2;
  const cy = h / 2;
  return (
    <g stroke={INK} strokeWidth={0.9}>
      <circle cx={cx} cy={cy} r={r} fill={fg} />
      <circle cx={cx} cy={cy} r={r * 0.58} fill={alt} />
      <circle cx={cx} cy={cy} r={r * 0.22} fill={INK} stroke="none" />
    </g>
  );
}

function Zigzag({ w, h, fg }: { w: number; h: number; fg: string }) {
  const steps = Math.max(2, Math.round(w / 10));
  const sw = w / steps;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    pts.push(`${i * sw},${i % 2 === 0 ? h * 0.82 : h * 0.18}`);
  }
  return (
    <polyline
      points={pts.join(" ")}
      fill="none"
      stroke={fg}
      strokeWidth={Math.max(1.5, h * 0.16)}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
}

function Lattice({ w, h, fg }: { w: number; h: number; fg: string }) {
  const step = Math.max(7, Math.min(w, h) / 3);
  const lines = [];
  for (let x = -h; x < w + h; x += step) {
    lines.push(<line key={`a${x}`} x1={x} y1={0} x2={x + h} y2={h} />);
    lines.push(<line key={`b${x}`} x1={x} y1={h} x2={x + h} y2={0} />);
  }
  return <g stroke={fg} strokeWidth={1.3}>{lines}</g>;
}

function Scallop({ w, h, fg }: { w: number; h: number; fg: string }) {
  const arcs = Math.max(2, Math.round(w / 12));
  const aw = w / arcs;
  const out = [];
  for (let i = 0; i < arcs; i++) {
    const x = i * aw;
    out.push(
      <path
        key={i}
        d={`M ${x} ${h * 0.85} a ${aw / 2} ${h * 0.5} 0 0 1 ${aw} 0`}
        fill="none"
        stroke={fg}
        strokeWidth={Math.max(1.3, h * 0.13)}
      />,
    );
  }
  return <g>{out}</g>;
}

function Stripes({ w, h, fg, alt }: { w: number; h: number; fg: string; alt: string }) {
  const bars = Math.max(2, Math.round(h / 6));
  const bh = h / bars;
  return (
    <g>
      {Array.from({ length: bars }, (_, i) => (
        <rect
          key={i}
          x={0}
          y={i * bh}
          width={w}
          height={bh * 0.55}
          fill={i % 2 === 0 ? fg : alt}
        />
      ))}
    </g>
  );
}

function Crosses({ w, h, fg }: { w: number; h: number; fg: string }) {
  const cols = Math.max(1, Math.round(w / 15));
  const cw = w / cols;
  const t = Math.max(1.4, cw * 0.12);
  const out = [];
  for (let i = 0; i < cols; i++) {
    const cx = cw * (i + 0.5);
    const cy = h / 2;
    const a = Math.min(cw, h) * 0.3;
    out.push(
      <g key={i} stroke={fg} strokeWidth={t} strokeLinecap="round">
        <line x1={cx - a} y1={cy - a} x2={cx + a} y2={cy + a} />
        <line x1={cx - a} y1={cy + a} x2={cx + a} y2={cy - a} />
      </g>,
    );
  }
  return <g>{out}</g>;
}

function Motif({
  kind, w, h, fg, alt, flip,
}: { kind: MotifKind; w: number; h: number; fg: string; alt: string; flip: boolean }) {
  switch (kind) {
    case "spiral": return <Spiral w={w} h={h} fg={fg} />;
    case "meander": return <Meander w={w} h={h} fg={fg} />;
    case "sawtooth": return <Sawtooth w={w} h={h} fg={fg} flip={flip} />;
    case "dots": return <Dots w={w} h={h} fg={fg} />;
    case "rings": return <Rings w={w} h={h} fg={fg} alt={alt} />;
    case "zigzag": return <Zigzag w={w} h={h} fg={fg} />;
    case "lattice": return <Lattice w={w} h={h} fg={fg} />;
    case "scallop": return <Scallop w={w} h={h} fg={fg} />;
    case "stripes": return <Stripes w={w} h={h} fg={fg} alt={alt} />;
    case "crosses": return <Crosses w={w} h={h} fg={fg} />;
    default: return null;
  }
}

/* ------------------------------------------------------------------ bands */

interface Segment {
  y: number;
  height: number;
  ground: string;
  motif: MotifKind;
  fg: string;
  alt: string;
  flip: boolean;
}

interface Band {
  x: number;
  width: number;
  segments: Segment[];
}

function buildBands(seed: number, bandCount: number, height: number): Band[] {
  const rand = seeded(seed);
  const bands: Band[] = [];
  let x = 0;

  for (let i = 0; i < bandCount; i++) {
    const width = 30 + Math.floor(rand() * 20);
    const segments: Segment[] = [];
    let y = 0;

    while (y < height - 6) {
      const motif = pickMotif(rand());
      // Segment height follows the motif: spirals and rings want a squarer
      // box, stripes and sawtooth read better in a shallow one.
      const base =
        motif === "spiral" || motif === "rings" ? width * 0.95
        : motif === "meander" ? width * 0.85
        : motif === "sawtooth" || motif === "zigzag" ? width * 0.45
        : width * 0.7;
      const segHeight = Math.min(
        Math.round(base * (0.85 + rand() * 0.5)),
        height - y,
      );
      if (segHeight < 8) break;

      const groundIndex = Math.floor(rand() * PIGMENTS.length);
      let fgIndex = Math.floor(rand() * PIGMENTS.length);
      // Keep the motif legible against its own ground.
      if (fgIndex === groundIndex) fgIndex = (fgIndex + 3) % PIGMENTS.length;

      segments.push({
        y,
        height: segHeight,
        ground: PIGMENTS[groundIndex],
        motif,
        fg: PIGMENTS[fgIndex],
        alt: PIGMENTS[(fgIndex + 4) % PIGMENTS.length],
        flip: rand() > 0.5,
      });
      y += segHeight;
    }

    bands.push({ x, width, segments });
    x += width + 3; // the gold rule between bands sits in this gap
  }

  return bands;
}

interface WeaveProps {
  /** Same seed, same cloth. */
  seed?: number;
  bandCount?: number;
  height?: number;
  /** Stagger the bands in on first paint (hero only — §56). */
  animate?: boolean;
  className?: string;
}

export function Weave({
  seed = 7, bandCount = 9, height = 560, animate = false, className,
}: WeaveProps) {
  const bands = buildBands(seed, bandCount, height);
  const width = bands.reduce((sum, b) => sum + b.width + 3, 0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      {/* Black ground: every shape in the artwork sits on and is outlined by it. */}
      <rect x={0} y={0} width={width} height={height} fill={INK} />

      <g className={animate ? "band-reveal" : undefined}>
        {bands.map((band, i) => (
          // Two nested groups on purpose: the outer carries the x offset as an
          // SVG attribute, the inner carries the reveal animation. A CSS
          // transform would override the attribute and stack every band at x=0.
          <g key={i} transform={`translate(${band.x} 0)`}>
            <g
              className={animate ? "band-piece" : undefined}
              style={animate ? { animationDelay: `${i * 60}ms` } : undefined}
            >
              {band.segments.map((seg, j) => (
                <g key={j} transform={`translate(0 ${seg.y})`}>
                  <rect
                    x={0}
                    y={0}
                    width={band.width}
                    height={seg.height}
                    fill={seg.ground}
                    stroke={INK}
                    strokeWidth={1.2}
                  />
                  <svg
                    x={0}
                    y={0}
                    width={band.width}
                    height={seg.height}
                    viewBox={`0 0 ${band.width} ${seg.height}`}
                    overflow="hidden"
                  >
                    <Motif
                      kind={seg.motif}
                      w={band.width}
                      h={seg.height}
                      fg={seg.fg}
                      alt={seg.alt}
                      flip={seg.flip}
                    />
                  </svg>
                </g>
              ))}
              {/* Gold rule down the edge of each band, as in the artwork. */}
              <rect x={band.width} y={0} width={1.6} height={height} fill={GOLD} />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}

/* --------------------------------------------------------- strips & marks */

/**
 * A horizontal banded strip: the same cloth read across rather than down.
 * Used for section rules (thin) and the footer / blog header band (taller).
 */
export function WeaveStrip({
  seed = 3, height = 10, cells = 26, cellWidth = 24, stretch = false, className = "",
}: {
  seed?: number;
  height?: number;
  cells?: number;
  cellWidth?: number;
  /** Stretch cells to fill the width. Off by default: squashing the motifs
   *  turns them to noise at small sizes. */
  stretch?: boolean;
  className?: string;
}) {
  const rand = seeded(seed);
  const cellW = cellWidth;
  const width = cells * cellW;

  const segments = Array.from({ length: cells }, (_, i) => {
    const motif = pickMotif(rand());
    const groundIndex = Math.floor(rand() * PIGMENTS.length);
    let fgIndex = Math.floor(rand() * PIGMENTS.length);
    if (fgIndex === groundIndex) fgIndex = (fgIndex + 3) % PIGMENTS.length;
    return {
      x: i * cellW,
      ground: PIGMENTS[groundIndex],
      fg: PIGMENTS[fgIndex],
      alt: PIGMENTS[(fgIndex + 4) % PIGMENTS.length],
      // Below ~14px tall the fine motifs turn to mud, so a thin rule uses
      // only the shapes that still read at that size.
      motif: height < 16
        ? (["sawtooth", "dots", "stripes", "zigzag", "plain", "plain"] as MotifKind[])[
            Math.floor(rand() * 6)
          ]
        : motif,
      flip: rand() > 0.5,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      // "slice" keeps each cell's proportions and clips the overflow, so the
      // motifs stay legible however wide the container is.
      preserveAspectRatio={stretch ? "none" : "xMinYMid slice"}
      className={className}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <rect x={0} y={0} width={width} height={height} fill={INK} />
      {segments.map((seg, i) => (
        <g key={i} transform={`translate(${seg.x} 0)`}>
          <rect x={0} y={0} width={cellW} height={height} fill={seg.ground} />
          <svg
            x={0}
            y={0}
            width={cellW}
            height={height}
            viewBox={`0 0 ${cellW} ${height}`}
            overflow="hidden"
          >
            <Motif
              kind={seg.motif}
              w={cellW}
              h={height}
              fg={seg.fg}
              alt={seg.alt}
              flip={seg.flip}
            />
          </svg>
          <rect x={cellW - 1.1} y={0} width={1.1} height={height} fill={INK} />
        </g>
      ))}
    </svg>
  );
}

/** Section rule — a thin banded strip in place of a plain border. */
export function WeaveRule({ seed = 5, className = "" }: { seed?: number; className?: string }) {
  return (
    <WeaveStrip
      seed={seed}
      height={13}
      cellWidth={30}
      cells={44}
      className={`h-[13px] w-full ${className}`}
    />
  );
}

/**
 * The monogram mark: a lozenge carrying a rolled spiral, outlined in black.
 * Used in the logo, the featured badge and the testimonial quote.
 */
export function WeaveMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <polygon points="16,1 31,16 16,31 1,16" fill="var(--pat-gold)" stroke={INK} strokeWidth="1.6" />
      <polygon points="16,6 26,16 16,26 6,16" fill="var(--pat-red)" stroke={INK} strokeWidth="1.2" />
      <path
        d="M 11 16 a 5 5 0 0 1 10 0 a 3.1 3.1 0 0 1 -6.2 0 a 1.9 1.9 0 0 1 3.8 0"
        fill="none"
        stroke="var(--pat-gold)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
