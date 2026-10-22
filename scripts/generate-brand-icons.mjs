import fs from 'node:fs/promises';
import sharp from 'sharp';

// Preserve the supplied artwork's alpha, with the dashboard's slate ink.
const { data, info } = await sharp('public/invitation-art/cm-monogram.svg', { density: 384 })
  .resize(440, 440, { fit: 'inside' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  data[i] = 52;
  data[i + 1] = 79;
  data[i + 2] = 86;
}
const mark = await sharp(data, { raw: info }).png().toBuffer();
const master = await sharp({ create: { width: 512, height: 512, channels: 4, background: '#f4f7fa' } })
  .composite([{ input: mark, gravity: 'centre' }]).png().toBuffer();
await sharp(master).resize(180, 180).png().toFile('src/app/apple-icon.png');
await sharp(master).resize(192, 192).png().toFile('src/app/icon.png');

const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(size => sharp(master).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
images.forEach((buffer, i) => {
  const entry = 6 + i * 16;
  header[entry] = sizes[i];
  header[entry + 1] = sizes[i];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(buffer.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += buffer.length;
});
await fs.writeFile('src/app/favicon.ico', Buffer.concat([header, ...images]));
console.log('Generated C/M favicon (16, 32, 48px), app icon and Apple touch icon.');
