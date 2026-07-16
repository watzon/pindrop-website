import satori from 'satori';
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

function satoriOptions() {
  const { regular, bold, italic, mono } = loadFonts();
  return {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Sentient', data: regular.buffer, weight: 400 as const, style: 'normal' as const },
      { name: 'Sentient', data: bold.buffer,    weight: 700 as const, style: 'normal' as const },
      { name: 'Sentient', data: italic.buffer,  weight: 400 as const, style: 'italic' as const },
      { name: 'Mono',     data: mono.buffer,    weight: 400 as const, style: 'normal' as const },
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
function el(tag: string, style: StyleObj, ...children: any[]) {
  const c = children.length === 0
    ? undefined
    : children.length === 1
    ? children[0]
    : children;
  return { type: tag, props: c !== undefined ? { style, children: c } : { style } };
}
function flex(style: StyleObj, ...children: any[]) {
  return el('div', { display: 'flex', ...style }, ...children);
}
function col(style: StyleObj, ...children: any[]) {
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

function pageBase(...children: any[]) {
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

// ─── Blog post OG ─────────────────────────────────────────────

function blogPostElement(opts: {
  title: string;
  description: string;
  date: Date;
  version?: string;
}) {
  const { title, description, date, version } = opts;
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
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
function svgToPng(svg: string): Uint8Array {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return resvg.render().asPng();
}

// ─── Public API ───────────────────────────────────────────────

export async function generateHomeOG(): Promise<Uint8Array> {
  const svg = await satori(homeElement() as any, satoriOptions());
  return svgToPng(svg);
}

export async function generateBlogPostOG(opts: {
  title: string;
  description: string;
  date: Date;
  version?: string;
}): Promise<Uint8Array> {
  const svg = await satori(blogPostElement(opts) as any, satoriOptions());
  return svgToPng(svg);
}
