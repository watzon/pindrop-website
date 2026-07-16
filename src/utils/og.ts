import satori, { type SatoriOptions } from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// ─── Palette — the quiet room, lit by the orb (Pindrop theme) ───────────────
const C = {
  night:  '#0A0A0F',
  soot:   '#12121A',
  ink:    '#F0E9E1',
  ink2:   '#C0B3A6',
  ink3:   '#948779',
  ember:  '#C48A1E',
  emberBright: '#F2B54A',
  russet: '#713413',
} as const;

// ─── Local fonts ─────────────────────────────────────────────
// process.cwd() is the project root during Astro's static build.
// Satori supports OTF, TTF, and WOFF (not WOFF2).
let _fonts: { regular: Buffer; bold: Buffer; italic: Buffer; mono: Buffer } | null = null;

function loadFonts() {
  if (!_fonts) {
    _fonts = {
      regular: readFileSync(join(process.cwd(), 'src/assets/fonts/Sentient-Regular.otf')),
      bold:    readFileSync(join(process.cwd(), 'src/assets/fonts/Sentient-Bold.otf')),
      italic:  readFileSync(join(process.cwd(), 'src/assets/fonts/Sentient-Italic.otf')),
      mono:    readFileSync(join(process.cwd(), 'src/assets/fonts/ServerMono-Regular.otf')),
    };
  }
  return _fonts;
}

function satoriOptions(): SatoriOptions {
  const { regular, bold, italic, mono } = loadFonts();
  return {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Sentient', data: regular, weight: 400, style: 'normal' },
      { name: 'Sentient', data: bold,    weight: 700, style: 'normal' },
      { name: 'Sentient', data: italic,  weight: 400, style: 'italic' },
      { name: 'Mono',     data: mono,    weight: 400, style: 'normal' },
    ],
  };
}

// ─── Helpers ─────────────────────────────────────────────────
function trunc(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

// Minimal element factory — satori needs explicit display on every multi-child div.
// IMPORTANT: never pass `children: []` — an empty array is truthy, which triggers satori's
// "must have display: flex" guard even when there are zero children.
type StyleObj = Record<string, string | number>;
type SatoriElement = Parameters<typeof satori>[0];
interface SectionOGOptions {
  label: string;
  title: string;
  accent: string;
  description: string;
  path: string;
}

function el(tag: string, style: StyleObj, ...children: SatoriElement[]): SatoriElement {
  let child: SatoriElement | SatoriElement[] | undefined;
  if (children.length === 1) {
    child = children[0];
  } else if (children.length > 1) {
    child = children;
  }

  const node = {
    type: tag,
    props: child !== undefined ? { style, children: child } : { style }
  };
  // Satori consumes React-compatible object nodes without requiring React at runtime.
  return node as unknown as SatoriElement;
}
function flex(style: StyleObj, ...children: SatoriElement[]) {
  return el('div', { display: 'flex', ...style }, ...children);
}
function col(style: StyleObj, ...children: SatoriElement[]) {
  return flex({ flexDirection: 'column', ...style }, ...children);
}
function text(content: string, style: StyleObj) {
  return el('span', style, content);
}

// ─── Shared pieces ───────────────────────────────────────────

/** The orb: amber→russet jewel with its own emitted light, drawn as nested gradients. */
function orb(size: number, x: number, y: number) {
  const glow = size * 2.2;
  return el('div', {
    position: 'absolute',
    left: x - glow / 2,
    top: y - glow / 2,
    width: glow,
    height: glow,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(242,181,74,0.26) 0%, rgba(242,181,74,0.09) 45%, rgba(242,181,74,0) 70%)`,
  },
    el('div', {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundImage: `radial-gradient(circle at 36% 32%, #FFE9BC 0%, #FCD07E 34%, ${C.emberBright} 58%, #B06A24 82%, ${C.russet} 100%)`,
    })
  );
}

function pageBase(...children: SatoriElement[]) {
  return col({
    width: 1200,
    height: 630,
    backgroundColor: C.night,
    backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(242,181,74,0.08) 0%, rgba(242,181,74,0) 60%)',
    fontFamily: 'Sentient',
    position: 'relative',
    paddingTop: 64,
    paddingRight: 80,
    paddingBottom: 56,
    paddingLeft: 80,
  }, ...children);
}

// ─── Home OG ─────────────────────────────────────────────────

function homeElement() {
  return pageBase(
    orb(190, 985, 315),

    col({ flex: 1 },
      text('Pindrop', { fontSize: 26, color: C.ink, fontWeight: 700, letterSpacing: '-0.01em' }),

      col({ flex: 1, justifyContent: 'center' },
        flex({ alignItems: 'baseline' },
          text('You talk. It', {
            fontSize: 84,
            fontWeight: 700,
            color: C.ink,
            letterSpacing: '-0.02em',
            marginRight: 22,
          }),
          text('types.', {
            fontSize: 84,
            fontStyle: 'italic',
            color: C.emberBright,
            letterSpacing: '-0.02em',
          })
        ),
        el('div', { height: 26 }),
        text('Open-source dictation that runs entirely on your Mac.', {
          fontSize: 26,
          color: C.ink2,
          maxWidth: 760,
        })
      ),

      flex({ alignItems: 'center', justifyContent: 'space-between' },
        text('pindrop.dev', { fontFamily: 'Mono', fontSize: 18, color: C.ink3 }),
        text('macOS 14+ · on-device · MIT', { fontFamily: 'Mono', fontSize: 18, color: C.ink3 })
      )
    )
  );
}

// ─── Section OG ───────────────────────────────────────────────

function sectionElement(opts: SectionOGOptions) {
  const { label, title, accent, description, path } = opts;

  return pageBase(
    orb(160, 995, 315),

    col({ flex: 1 },
      flex({ alignItems: 'center', gap: 18 },
        text('Pindrop', { fontSize: 26, color: C.ink, fontWeight: 700 }),
        text(label.toUpperCase(), {
          fontFamily: 'Mono',
          fontSize: 16,
          color: C.emberBright,
          letterSpacing: '0.08em',
        })
      ),

      col({ flex: 1, justifyContent: 'center', maxWidth: 800 },
        text(title, {
          fontSize: 72,
          fontWeight: 700,
          color: C.ink,
          letterSpacing: '-0.02em',
          lineHeight: 1.05,
        }),
        text(accent, {
          fontSize: 72,
          fontStyle: 'italic',
          color: C.emberBright,
          letterSpacing: '-0.02em',
          lineHeight: 1.05,
          marginBottom: 24,
        }),
        text(description, {
          fontSize: 24,
          color: C.ink2,
          lineHeight: 1.4,
          maxWidth: 720,
        })
      ),

      flex({ alignItems: 'center', justifyContent: 'space-between' },
        text(`pindrop.dev${path}`, { fontFamily: 'Mono', fontSize: 18, color: C.ink3 }),
        text('macOS 14+ · on-device · MIT', { fontFamily: 'Mono', fontSize: 18, color: C.ink3 })
      )
    )
  );
}

// ─── Blog post OG ─────────────────────────────────────────────

function blogPostElement(opts: {
  title: string;
  description: string;
  date: Date;
  version?: string;
}) {
  const { title, description, date, version } = opts;
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  return pageBase(
    orb(72, 1075, 96),

    col({ flex: 1 },
      flex({ alignItems: 'center', gap: 16 },
        text('Pindrop Blog', { fontSize: 22, color: C.ink, fontWeight: 700 }),
        version
          ? text(`v${version}`, { fontFamily: 'Mono', fontSize: 18, color: C.emberBright })
          : text('', { fontSize: 1 })
      ),

      col({ flex: 1, justifyContent: 'center' },
        el('div', {
          fontSize: 58,
          fontWeight: 700,
          color: C.ink,
          letterSpacing: '-0.015em',
          lineHeight: 1.12,
          marginBottom: 24,
          maxWidth: 920,
        }, trunc(title, 80)),

        el('div', {
          fontSize: 24,
          fontStyle: 'italic',
          color: C.ink3,
          lineHeight: 1.45,
          maxWidth: 760,
        }, trunc(description, 130))
      ),

      flex({ alignItems: 'center', justifyContent: 'space-between' },
        text(dateStr, { fontFamily: 'Mono', fontSize: 18, color: C.ink3 }),
        text('pindrop.dev', { fontFamily: 'Mono', fontSize: 18, color: C.ink3 })
      )
    )
  );
}

// ─── SVG → PNG ───────────────────────────────────────────────
function svgToPng(svg: string): ArrayBuffer {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return Uint8Array.from(resvg.render().asPng()).buffer;
}

// ─── Public API ───────────────────────────────────────────────

export async function generateHomeOG(): Promise<ArrayBuffer> {
  const svg = await satori(homeElement(), satoriOptions());
  return svgToPng(svg);
}

export async function generateSectionOG(opts: SectionOGOptions): Promise<ArrayBuffer> {
  const svg = await satori(sectionElement(opts), satoriOptions());
  return svgToPng(svg);
}

export async function generateBlogPostOG(opts: {
  title: string;
  description: string;
  date: Date;
  version?: string;
}): Promise<ArrayBuffer> {
  const svg = await satori(blogPostElement(opts), satoriOptions());
  return svgToPng(svg);
}
