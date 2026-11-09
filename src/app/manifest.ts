import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TreeMaker | Xây dựng cây gia phả trực tuyến',
    short_name: 'TreeMaker',
    description:
      'TreeMaker là không gian dành cho gia phả và câu chuyện gia đình, nơi trân trọng cội nguồn và gắn kết thế hệ qua thời gian.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f5ee',
    theme_color: '#8c1f2a',
    lang: 'vi',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
