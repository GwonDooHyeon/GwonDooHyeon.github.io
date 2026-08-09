// 블로그 글 썸네일(heroImage) 생성기
//
//   npm run thumbnail -- "ai-agent"                 → preset/scripts/out/thumbnail.png
//   npm run thumbnail -- "ai-agent" my-post-slug     → src/content/blog/my-post-slug/thumbnail.png
//
// 글자를 넣지 않는다.
// 이 테마는 heroImage 를 목록 카드와 글 상단의 "배경 질감" 으로 깔고 그 위에 제목·설명을 얹는다.
// 이미지 안에 글자가 있으면 어디에 두든 본문 텍스트와 겹쳐 보인다.
//
// 대신 넘겨준 주제어로 색을 결정해서 글마다 다른 인상을 준다. 같은 주제어면 항상 같은 색이 나온다.
//
// sharp 의 SVG 렌더링을 쓴다. 별도 폰트나 브라우저가 필요 없다.

import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const WIDTH = 1200
const HEIGHT = 630

// 주제어를 색상환 위의 한 점으로 바꾼다 (같은 입력 → 같은 색)
function hueFrom(seed) {
  let hash = 0
  for (const ch of seed) hash = (hash * 31 + ch.codePointAt(0)) >>> 0
  return hash % 360
}

function buildSvg(seed) {
  const h = hueFrom(seed)
  const h2 = (h + 45) % 360
  const h3 = (h + 300) % 360

  // 배경이 너무 밝으면 그 위의 흰 글씨가 안 읽힌다. 채도·명도를 낮게 유지한다.
  const c1 = `hsl(${h} 60% 55%)`
  const c2 = `hsl(${h2} 55% 50%)`
  const c3 = `hsl(${h3} 50% 55%)`

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g1" cx="18%" cy="22%" r="62%">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="82%" cy="12%" r="55%">
      <stop offset="0%" stop-color="${c2}" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="${c2}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g3" cx="72%" cy="88%" r="60%">
      <stop offset="0%" stop-color="${c3}" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="${c3}" stop-opacity="0"/>
    </radialGradient>

    <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.6" fill="#FFFFFF" fill-opacity="0.06"/>
    </pattern>

    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0.35">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0E141B"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g1)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g2)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g3)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#dots)"/>

  <!-- 오른쪽 아래로 흐르는 얇은 호 — 질감만 더하고 시선을 끌지 않는다 -->
  <g stroke="url(#fade)" fill="none" stroke-width="1.5">
    <circle cx="${WIDTH * 0.78}" cy="${HEIGHT * 0.62}" r="210"/>
    <circle cx="${WIDTH * 0.78}" cy="${HEIGHT * 0.62}" r="330"/>
    <circle cx="${WIDTH * 0.78}" cy="${HEIGHT * 0.62}" r="450"/>
  </g>
</svg>`
}

const [seed, slug] = process.argv.slice(2)

if (!seed) {
  console.error('사용법: npm run thumbnail -- "<주제어>" [slug]')
  console.error('        주제어는 색을 정하는 데만 쓰이고 이미지에 글자로 나오지는 않습니다')
  process.exit(1)
}

const outPath = slug
  ? resolve(ROOT, 'src/content/blog', slug, 'thumbnail.png')
  : resolve(ROOT, 'preset/scripts/out/thumbnail.png')

mkdirSync(dirname(outPath), { recursive: true })

await sharp(Buffer.from(buildSvg(seed))).png().toFile(outPath)

console.log(`✅ ${outPath.replace(ROOT + '/', '')}  (hue ${hueFrom(seed)})`)
if (slug) {
  console.log(`
프론트매터에 추가하세요:

heroImage:
  src: ./thumbnail.png
  alt: ''
  color: '#0E141B'
`)
}
