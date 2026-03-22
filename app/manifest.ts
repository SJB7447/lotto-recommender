import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '행운의 로또 번호 추천 (LottoStat)',
    short_name: '행운로또',
    description: '과거를 분석해 새로운 희망을 그려보세요. 아버지를 위한 스마트 로또 도우미!',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFBF0',
    theme_color: '#FF6B35',
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/logo.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/logo.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      }
    ],
  }
}
