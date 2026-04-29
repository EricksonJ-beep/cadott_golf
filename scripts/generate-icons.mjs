import sharp from 'sharp'
import { mkdir, copyFile } from 'node:fs/promises'
import { join } from 'node:path'

const SRC = 'public/logo/Cadott Golf Logo 2.png'
const ICONS_DIR = 'public/icons'
const LOGO_DIR = 'public/logo'

async function makeIcon(size, outPath, { padRatio = 0.7, bg = '#FFFFFF' } = {}) {
  const inner = Math.round(size * padRatio)
  const resized = await sharp(SRC)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: resized, gravity: 'center' }])
    .png()
    .toFile(outPath)

  console.log(`✓ ${outPath} (${size}x${size})`)
}

await mkdir(ICONS_DIR, { recursive: true })

await makeIcon(192, join(ICONS_DIR, 'icon-192.png'))
await makeIcon(512, join(ICONS_DIR, 'icon-512.png'))
await makeIcon(180, join(ICONS_DIR, 'apple-touch-icon.png'))
await makeIcon(32,  join(ICONS_DIR, 'favicon-32.png'),  { padRatio: 0.85 })
await makeIcon(16,  join(ICONS_DIR, 'favicon-16.png'),  { padRatio: 0.85 })

await copyFile(SRC, join(LOGO_DIR, 'hornet.png'))
console.log(`✓ ${join(LOGO_DIR, 'hornet.png')} (transparent original)`)
