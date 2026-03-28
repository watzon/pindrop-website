import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// ─── Palette ────────────────────────────────────────────────
const C = {
  cream:   '#F9F8F6',
  surface: '#EDEAE4',
  border:  '#D8D3CA',
  dark:    '#111110',
  mid:     '#5C5850',
  muted:   '#9C9690',
  accent:  '#C84B2B',
  accentBg:'#F6EAE5',
  white:   '#FFFFFF',
} as const;

// ─── Local fonts ─────────────────────────────────────────────
// process.cwd() is the project root during Astro's static build.
// Satori supports OTF, TTF, and WOFF (not WOFF2).
let _regular: Buffer | null = null;
let _bold: Buffer | null = null;

function loadFonts() {
  if (!_regular) _regular = readFileSync(join(process.cwd(), 'src/assets/fonts/SpaceGrotesk-Regular.otf'));
  if (!_bold)    _bold    = readFileSync(join(process.cwd(), 'src/assets/fonts/SpaceGrotesk-Bold.otf'));
  return { regular: _regular, bold: _bold };
}

function satoriOptions() {
  const { regular, bold } = loadFonts();
  return {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'SG', data: regular.buffer, weight: 400 as const, style: 'normal' as const },
      { name: 'SG', data: bold.buffer,    weight: 700 as const, style: 'normal' as const },
    ],
  };
}

// ─── Helpers ─────────────────────────────────────────────────
function trunc(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

// Shorthand for a single-child element used as a visual separator / spacer
function spacer(height: number) {
  return el('div', { height: `${height}px` });
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

// ─── Shared layout elements ───────────────────────────────────

function accentStrip() {
  return el('div', {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 6,
    height: 630,
    backgroundColor: C.accent,
  });
}

function logoRow(right: any) {
  return flex({ alignItems: 'center', justifyContent: 'space-between' },
    flex({ alignItems: 'center', gap: 10 },
      el('div', {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: C.accent,
      }),
      text('Pindrop', {
        fontFamily: 'SG',
        fontWeight: 700,
        fontSize: 22,
        color: C.dark,
        letterSpacing: '-0.03em',
      })
    ),
    right
  );
}

function dividerBar() {
  return el('div', {
    width: '100%',
    height: 1,
    backgroundColor: C.border,
  });
}

// ─── Home OG ─────────────────────────────────────────────────

function homeElement() {
  return col({
    width: 1200,
    height: 630,
    backgroundColor: C.cream,
    fontFamily: 'SG',
    position: 'relative',
    paddingTop: 56,
    paddingRight: 72,
    paddingBottom: 56,
    paddingLeft: 80,
  },
    // Absolute accent strip — positioned as a sibling, but satori handles absolute siblings fine
    // We place it first so it renders behind everything
    accentStrip(),

    // Vertical flex column for content (takes remaining space)
    col({ flex: 1 },
      // Top row
      logoRow(
        text('pindrop.dev', { fontSize: 16, color: C.muted, fontFamily: 'SG' })
      ),

      spacer(52),

      // Headline block
      col({ flex: 1, justifyContent: 'center' },
        el('div', {
          fontFamily: 'SG',
          fontWeight: 700,
          fontSize: 76,
          color: C.dark,
          letterSpacing: '-0.04em',
          lineHeight: 1.06,
          marginBottom: 28,
          whiteSpace: 'pre-wrap',
        }, 'Dictation that\nrespects you.'),

        text('Mac-native · On-device AI · MIT License', {
          fontFamily: 'SG',
          fontSize: 22,
          color: C.mid,
          letterSpacing: '-0.01em',
        })
      ),

      spacer(40),
      dividerBar(),
      spacer(24),

      // Bottom row
      flex({ alignItems: 'center', justifyContent: 'space-between' },
        text('macOS 14 Sonoma or later', { fontSize: 15, color: C.muted, fontFamily: 'SG' }),
        flex({
          alignItems: 'center',
          backgroundColor: C.accent,
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 20,
          paddingRight: 20,
          borderRadius: 100,
        },
          text('Free forever', {
            fontFamily: 'SG',
            fontSize: 14,
            fontWeight: 700,
            color: C.white,
            letterSpacing: '-0.01em',
          })
        )
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

  const versionBadge = version
    ? flex({
        alignItems: 'center',
        backgroundColor: C.accentBg,
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 100,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'rgba(200,75,43,0.25)',
      },
        text(`v${version}`, {
          fontFamily: 'SG',
          fontSize: 14,
          fontWeight: 700,
          color: C.accent,
          letterSpacing: '0.01em',
        })
      )
    : text('', { fontSize: 1 }); // invisible placeholder

  return col({
    width: 1200,
    height: 630,
    backgroundColor: C.cream,
    fontFamily: 'SG',
    position: 'relative',
    paddingTop: 56,
    paddingRight: 72,
    paddingBottom: 56,
    paddingLeft: 80,
  },
    accentStrip(),

    col({ flex: 1 },
      // Top row: blog label + version
      flex({ alignItems: 'center', justifyContent: 'space-between' },
        flex({ alignItems: 'center', gap: 10 },
          el('div', {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: C.accent,
          }),
          text('Pindrop Blog', {
            fontFamily: 'SG',
            fontSize: 14,
            fontWeight: 700,
            color: C.mid,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          })
        ),
        versionBadge
      ),

      spacer(44),

      // Title + description block
      col({ flex: 1, justifyContent: 'center' },
        el('div', {
          fontFamily: 'SG',
          fontWeight: 700,
          fontSize: 58,
          color: C.dark,
          letterSpacing: '-0.035em',
          lineHeight: 1.1,
          marginBottom: 20,
          maxWidth: 800,
        }, trunc(title, 80)),

        el('div', {
          fontFamily: 'SG',
          fontSize: 20,
          color: C.mid,
          lineHeight: 1.5,
          maxWidth: 680,
        }, trunc(description, 120))
      ),

      spacer(36),
      dividerBar(),
      spacer(24),

      // Bottom row: date + domain
      flex({ alignItems: 'center', justifyContent: 'space-between' },
        text(dateStr, { fontFamily: 'SG', fontSize: 15, color: C.muted }),
        text('pindrop.dev', { fontFamily: 'SG', fontSize: 15, color: C.muted })
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
