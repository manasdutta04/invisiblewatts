/**
 * create-icons.js
 * Generates icon16.png, icon48.png, and icon128.png using only Node.js built-ins.
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
  const t  = Buffer.from(type, "ascii")
  const d  = data || Buffer.alloc(0)
  const lenBuf = Buffer.alloc(4); lenBuf.writeUInt32BE(d.length)
  const crcInput = Buffer.concat([t, d])
  const crcBuf   = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(crcInput))
  return Buffer.concat([lenBuf, t, d, crcBuf])
}

function encodePNG(width, height, pixels) {
  // pixels: flat array of [r, g, b] triples, row-major
  const sig  = Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width,  0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // RGB
  const raw = Buffer.alloc(height * (1 + width * 3))
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 3)] = 0 // filter: None
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 3
      const dst = y * (1 + width * 3) + 1 + x * 3
      raw[dst]   = pixels[src]
      raw[dst+1] = pixels[src+1]
      raw[dst+2] = pixels[src+2]
    }
  }
  const idat = makeChunk("IDAT", zlib.deflateSync(raw, { level: 9 }))
  return Buffer.concat([sig, makeChunk("IHDR", ihdr), idat, makeChunk("IEND")])
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────

function blendPixel(pixels, width, x, y, r, g, b, alpha) {
  if (x < 0 || x >= width || y < 0 || y >= Math.floor(pixels.length / (width * 3))) return
  const i = (y * width + x) * 3
  pixels[i]   = Math.round(pixels[i]   * (1 - alpha) + r * alpha)
  pixels[i+1] = Math.round(pixels[i+1] * (1 - alpha) + g * alpha)
  pixels[i+2] = Math.round(pixels[i+2] * (1 - alpha) + b * alpha)
}

/** Polygon scanline fill */
function fillPolygon(pixels, width, height, verts, r, g, b) {
  const n = verts.length
  for (let y = 0; y < height; y++) {
    const xs = []
    for (let i = 0; i < n; i++) {
      const a = verts[i], bv = verts[(i + 1) % n]
      if ((a.y <= y && bv.y > y) || (bv.y <= y && a.y > y)) {
        xs.push(a.x + (y - a.y) / (bv.y - a.y) * (bv.x - a.x))
      }
    }
    xs.sort((a, b) => a - b)
    for (let i = 0; i < xs.length - 1; i += 2) {
      const x0 = Math.max(0, Math.round(xs[i]))
      const x1 = Math.min(width - 1, Math.round(xs[i + 1]))
      for (let x = x0; x <= x1; x++) {
        const idx = (y * width + x) * 3
        pixels[idx] = r; pixels[idx+1] = g; pixels[idx+2] = b
      }
    }
  }
}

/** Filled rounded rectangle */
function fillRoundRect(pixels, width, height, rx, ry, rw, rh, radius, r, g, b) {
  for (let y = ry; y < ry + rh; y++) {
    for (let x = rx; x < rx + rw; x++) {
      // Corner check
      const inCorner = (
        (x < rx + radius && y < ry + radius && Math.hypot(x - (rx + radius), y - (ry + radius)) > radius) ||
        (x > rx + rw - radius - 1 && y < ry + radius && Math.hypot(x - (rx + rw - radius - 1), y - (ry + radius)) > radius) ||
        (x < rx + radius && y > ry + rh - radius - 1 && Math.hypot(x - (rx + radius), y - (ry + rh - radius - 1)) > radius) ||
        (x > rx + rw - radius - 1 && y > ry + rh - radius - 1 && Math.hypot(x - (rx + rw - radius - 1), y - (ry + rh - radius - 1)) > radius)
      )
      if (!inCorner && x >= 0 && x < width && y >= 0 && y < height) {
        const idx = (y * width + x) * 3
        pixels[idx] = r; pixels[idx+1] = g; pixels[idx+2] = b
      }
    }
  }
}

// ─── Icon rendering ───────────────────────────────────────────────────────────

/**
 * Renders the InvisibleWatts icon at a given size.
 * Design: dark rounded-square bg + green gradient fill + white lightning bolt
 */
function renderIcon(size) {
  const pixels = new Uint8Array(size * size * 3)
  // Fill with true-black base
  pixels.fill(0)

  const r  = Math.round(size * 0.22) // corner radius for background square
  const pad = Math.round(size * 0.06)

  // ── Background: dark rounded square ────────────────────────────────────────
  fillRoundRect(pixels, size, size, pad, pad, size - pad * 2, size - pad * 2, r,
    15, 15, 18)  // #0F0F12

  // ── Subtle green inner glow (concentric smaller rounded square) ────────────
  const innerPad = Math.round(size * 0.06)
  const glowR = r * 0.7
  for (let gy = pad + innerPad; gy < size - pad - innerPad; gy++) {
    for (let gx = pad + innerPad; gx < size - pad - innerPad; gx++) {
      // gentle green tint
      const idx = (gy * size + gx) * 3
      pixels[idx]   = 20
      pixels[idx+1] = 28
      pixels[idx+2] = 24
    }
  }

  // ── Lightning bolt (scaled from the SVG path "M13 2L3 14h9l-1 8 10-12h-9l1-8z")
  // SVG viewBox is 0 0 24 24 → normalise to 0-1 range
  const boltVerts24 = [
    { x: 13, y: 2 },
    { x: 3,  y: 14 },
    { x: 12, y: 14 },
    { x: 11, y: 22 },
    { x: 21, y: 10 },
    { x: 12, y: 10 },
  ]
  // Scale to icon size with padding
  const boltPad  = size * 0.15
  const boltScale = (size - boltPad * 2) / 24
  const boltVerts = boltVerts24.map(v => ({
    x: boltPad + v.x * boltScale,
    y: boltPad + v.y * boltScale,
  }))
  fillPolygon(pixels, size, size, boltVerts, 16, 185, 129)  // #10b981

  // ── Highlight: lighter green on top half of bolt ───────────────────────────
  const highlightVerts = boltVerts24.slice(0, 3).map(v => ({
    x: boltPad + v.x * boltScale,
    y: boltPad + v.y * boltScale,
  }))
  if (size >= 48) {
    fillPolygon(pixels, size, size, highlightVerts, 52, 211, 153)  // #34d399
  }

  return encodePNG(size, size, pixels)
}

// ─── Write files ───────────────────────────────────────────────────────────────
const outDir = __dirname

for (const size of [16, 48, 128]) {
  const outPath = path.join(outDir, `icon${size}.png`)
  fs.writeFileSync(outPath, renderIcon(size))
  console.log(`✓ Written: ${outPath}`)
}
console.log("\nDone! Icons created in:", outDir)
