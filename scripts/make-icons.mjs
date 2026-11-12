// Draws the app icon as PNG with no image library: flat rectangles only.
// The mark is an index card on a scarlet field. It is original and uses no service emblem.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync, crc32 } from 'node:zlib';

const SCARLET = [158, 27, 42], GOLD = [200, 161, 43], PAPER = [251, 249, 243], INK = [29, 27, 23];
// [x0, y0, x1, y1, color] in 0..1 units; kept inside the middle 60% so a maskable crop never cuts it.
const SHAPES = [
  [0, 0, 1, 1, SCARLET],
  [0.22, 0.24, 0.78, 0.76, PAPER],
  [0.22, 0.24, 0.78, 0.34, GOLD],
  [0.3, 0.44, 0.7, 0.48, INK],
  [0.3, 0.54, 0.7, 0.58, INK],
  [0.3, 0.64, 0.56, 0.68, INK],
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
