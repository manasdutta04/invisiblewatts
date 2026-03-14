/**
 * create-icons.js
 * Generates icon16.png, icon48.png, icon128.png matching the InvisibleWatts
 * webapp logo.svg — dark navy bg, blue lightning bolt, green leaf, trailing dots.
 * Run: node create-icons.js
 */

const zlib = require("zlib")
const fs   = require("fs")
const path = require("path")

// ─── PNG primitives ───────────────────────────────────────────────────────────

function crc32(buf) {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? (0xEDB88320 ^ (c >>> 1)) : c >>> 1
    table[i] = c >>> 0
  }
  let crc = 0xFFFFFFFF
  for (const b of buf) crc = (table[(crc ^ b) & 0xFF] ^ (crc >>> 8)) >>> 0
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function makeChunk(type, data) {
  const t      = Buffer.from(type, "ascii")
  const d      = data || Buffer.alloc(0)
  const lenBuf = Buffer.alloc(4); lenBuf.writeUInt32BE(d.length)
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([t, d])))
  return Buffer.concat([lenBuf, t, d, crcBuf])
}

function encodePNG(size, pixels) {
  const sig  = Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 2  // 8-bit RGB
  const stride = 1 + size * 3
  const raw    = Buffer.alloc(size * stride)
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0  // filter: None
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 3
      const dst = y * stride + 1 + x * 3
      raw[dst] = pixels[src]; raw[dst+1] = pixels[src+1]; raw[dst+2] = pixels[src+2]
    }
  }
  return Buffer.concat([sig, makeChunk("IHDR", ihdr),
    makeChunk("IDAT", zlib.deflateSync(raw, { level: 9 })), makeChunk("IEND")])
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────

function blend(pixels, size, x, y, r, g, b, a) {
  x = Math.round(x); y = Math.round(y)
  if (x < 0 || y < 0 || x >= size || y >= size) return
  const i = (y * size + x) * 3
  pixels[i]   = Math.round(pixels[i]   * (1-a) + r * a)
  pixels[i+1] = Math.round(pixels[i+1] * (1-a) + g * a)
  pixels[i+2] = Math.round(pixels[i+2] * (1-a) + b * a)
}

/** Rounded-rect fill with vertical gradient between topRgb and botRgb */
function fillRoundRect(pixels, size, rx, ry, rw, rh, radius, topRgb, botRgb) {
  for (let y = ry; y < ry + rh; y++) {
    const t   = rh > 1 ? (y - ry) / (rh - 1) : 0
    const [r, g, b] = [0,1,2].map(i => Math.round(topRgb[i]*(1-t) + botRgb[i]*t))
    for (let x = rx; x < rx + rw; x++) {
      const outside = (
        (x < rx+radius      && y < ry+radius      && Math.hypot(x-(rx+radius),      y-(ry+radius))      > radius) ||
        (x > rx+rw-radius-1 && y < ry+radius      && Math.hypot(x-(rx+rw-radius-1), y-(ry+radius))      > radius) ||
        (x < rx+radius      && y > ry+rh-radius-1 && Math.hypot(x-(rx+radius),      y-(ry+rh-radius-1)) > radius) ||
        (x > rx+rw-radius-1 && y > ry+rh-radius-1 && Math.hypot(x-(rx+rw-radius-1),y-(ry+rh-radius-1)) > radius)
      )
      if (!outside && x>=0 && x<size && y>=0 && y<size) blend(pixels, size, x, y, r, g, b, 1)
    }
  }
}

/** Polygon scanline fill (optionally blended) */
function fillPolygon(pixels, size, verts, r, g, b, a = 1) {
  const n = verts.length
  for (let y = 0; y < size; y++) {
    const xs = []
    for (let i = 0; i < n; i++) {
      const p = verts[i], q = verts[(i+1) % n]
      if ((p.y <= y && q.y > y) || (q.y <= y && p.y > y)) {
        xs.push(p.x + (y - p.y) / (q.y - p.y) * (q.x - p.x))
      }
    }
    xs.sort((a, b) => a - b)
    for (let i = 0; i < xs.length - 1; i += 2) {
      for (let x = Math.max(0, Math.round(xs[i])); x <= Math.min(size-1, Math.round(xs[i+1])); x++) {
        blend(pixels, size, x, y, r, g, b, a)
      }
    }
  }
}

/** Filled circle (optionally blended) */
function fillCircle(pixels, size, cx, cy, radius, r, g, b, a = 1) {
  const x0 = Math.max(0, Math.floor(cx - radius))
  const x1 = Math.min(size-1, Math.ceil(cx + radius))
  const y0 = Math.max(0, Math.floor(cy - radius))
  const y1 = Math.min(size-1, Math.ceil(cy + radius))
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++)
      if (Math.hypot(x-cx, y-cy) <= radius) blend(pixels, size, x, y, r, g, b, a)
}

// ─── Icon renderer ────────────────────────────────────────────────────────────
// Mirrors logo.svg (viewBox 0 0 100 100).  S = size/100 scales every coord.

function renderIcon(size) {
  const pixels = new Uint8Array(size * size * 3).fill(0)
  const S = size / 100
  const pad = Math.round(0.06 * size)
  const rw  = size - pad * 2
  const rad = Math.round(0.22 * size)

  // ── 1. Background: navy gradient #1E3A5F → #0A1A2E ───────────────────────
  fillRoundRect(pixels, size, pad, pad, rw, rw, rad,
    [30, 58, 95],   // #1E3A5F
    [10, 26, 46])   // #0A1A2E

  // ── 2. Soft glow ellipse (cx=50,cy=49 rx=22,ry=34) #0EA5E9 @ 0.15 ────────
  if (size >= 32) {
    const gcx = 50*S, gcy = 49*S, grx = 22*S, gry = 34*S
    for (let y = Math.floor(gcy-gry); y <= Math.ceil(gcy+gry); y++)
      for (let x = Math.floor(gcx-grx); x <= Math.ceil(gcx+grx); x++)
        if (((x-gcx)/grx)**2 + ((y-gcy)/gry)**2 <= 1)
          blend(pixels, size, x, y, 14, 165, 233, 0.15)
  }

  // ── 3. Lightning bolt: M57 9 L24 53 H43 L35 91 L76 47 H57 Z ─────────────
  //    Vertices in logo.svg 100×100 coordinate space
  const boltPts = [
    { x:57, y:9  },
    { x:24, y:53 },
    { x:43, y:53 },
    { x:35, y:91 },
    { x:76, y:47 },
    { x:57, y:47 },
  ]
  const bolt = boltPts.map(v => ({ x: v.x*S, y: v.y*S }))

  // Bolt body: sky blue #38BDF8
  fillPolygon(pixels, size, bolt, 56, 189, 248)

  // Top-half highlight: lighten with #E0F2FE (224,242,254) @ 30%
  if (size >= 32) {
    const topHalf = [
      { x:57*S, y:9*S  },
      { x:24*S, y:53*S },
      { x:43*S, y:53*S },
      { x:57*S, y:47*S },
    ]
    fillPolygon(pixels, size, topHalf, 224, 242, 254, 0.30)
  }

  // ── 4. Trailing dots (only at ≥48px) ─────────────────────────────────────
  if (size >= 48) {
    fillCircle(pixels, size, 68*S, 76*S, 3.2*S, 56, 189, 248, 0.55)
    fillCircle(pixels, size, 75*S, 68*S, 2.2*S, 56, 189, 248, 0.30)
    fillCircle(pixels, size, 63*S, 83*S, 1.6*S, 56, 189, 248, 0.18)
  }

  // ── 5. Green leaf (≥32px): M28 78 Q38 66 46 73 Q38 82 28 78Z ─────────────
  //    Approximated with sampled quadratic bezier polygon
  if (size >= 32) {
    const leaf = [
      { x:28, y:78 }, { x:33, y:73 }, { x:38, y:71 },
      { x:42, y:71 }, { x:46, y:73 }, { x:42, y:77 },
      { x:38, y:79 }, { x:33, y:79 },
    ].map(v => ({ x: v.x*S, y: v.y*S }))
    fillPolygon(pixels, size, leaf, 52, 211, 153, 0.85)  // #34D399
  }

  return encodePNG(size, pixels)
}

// ─── Write files ──────────────────────────────────────────────────────────────

const outDir = __dirname

for (const size of [16, 48, 128]) {
  const outPath = path.join(outDir, `icon${size}.png`)
  fs.writeFileSync(outPath, renderIcon(size))
  console.log(`✓ Written: ${outPath}`)
}
console.log("\nDone! Icons written to:", outDir)
