// Draws the app icon as PNG with no image library: flat rectangles only.
// The mark is a shirt edge and a fly edge lined up through a brass buckle (a gig line) on a scarlet field. It is original and uses no service emblem.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync, crc32 } from 'node:zlib';

const SCARLET = [166, 25, 46], GOLD = [200, 161, 43], PAPER = [255, 255, 255];
// [x0, y0, x1, y1, color] in 0..1 units; kept inside the middle 60% so a maskable crop never cuts it.
const SHAPES = [
  [0, 0, 1, 1, SCARLET],
  [0.45, 0.16, 0.55, 0.34, PAPER],
  [0.34, 0.34, 0.66, 0.66, GOLD],
  [0.41, 0.41, 0.59, 0.59, SCARLET],
  [0.45, 0.66, 0.55, 0.84, PAPER],
];

function png(size) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let c = SCARLET;
      for (const [x0, y0, x1, y1, col] of SHAPES) if (x >= x0 * size && x < x1 * size && y >= y0 * size && y < y1 * size) c = col;
      raw.set(c, y * (size * 3 + 1) + 1 + x * 3);
    }
  }
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const out = Buffer.alloc(body.length + 8);
    out.writeUInt32BE(data.length, 0);
    body.copy(out, 4);
    out.writeUInt32BE(crc32(body), body.length + 4);
    return out;
  };
  const head = Buffer.alloc(13);
  head.writeUInt32BE(size, 0);
  head.writeUInt32BE(size, 4);
  head.set([8, 2, 0, 0, 0], 8); // 8-bit RGB
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

mkdirSync('public/icons', { recursive: true });
for (const [name, size] of [['icon-192', 192], ['icon-512', 512], ['apple-touch-icon', 180]]) writeFileSync(`public/icons/${name}.png`, png(size));
console.log('Wrote public/icons');
