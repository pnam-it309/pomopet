import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PomoPet Mobile - Pomodoro & Nuôi Thú Ảo',
    short_name: 'PomoPet',
    description: 'Ứng dụng quản lý thời gian Pomodoro kết hợp nuôi thú ảo sinh động',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF7ED',
    theme_color: '#F43F5E',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
