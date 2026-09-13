import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Header } from '@/components/navigation/Header';
import { BottomNav, DesktopTabBar } from '@/components/navigation/BottomNav';
import { JsonLd } from '@/components/seo/JsonLd';
import { NotificationToast } from '@/components/common/NotificationToast';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#F43F5E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://pomopet.app'),
  title: {
    default: 'PomoPet - Đồng Hồ Pomodoro & Nuôi Thú Ảo Năng Suất',
    template: '%s | PomoPet',
  },
  description:
    'Nâng cao khả năng tập trung làm việc và học tập với PomoPet. Ứng dụng Pomodoro kết hợp nuôi thú cưng ảo (Mèo, Rồng, Mầm cây, Cánh cụt) giúp bạn xây dựng chuỗi ngày làm việc năng suất.',
  keywords: [
    'pomodoro',
    'nuôi thú ảo',
    'quản lý thời gian',
    'tập trung học tập',
    'đồng hồ cà chua',
    'gamification',
    'to-do list',
    'năng suất',
    'pomopet',
  ],
  authors: [{ name: 'PomoPet' }],
  creator: 'PomoPet Team',
  publisher: 'PomoPet',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PomoPet - Pomodoro & Virtual Pet Productivity Companion',
    description:
      'Quản lý thời gian Pomodoro khoa học kết hợp nuôi thú ảo sinh động. Tăng sự tập trung, ghi nhận công việc và nhận thưởng mỗi ngày!',
    url: 'https://pomopet.app',
    siteName: 'PomoPet',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PomoPet - Pomodoro & Nuôi Thú Cưng Ảo',
    description:
      'Ứng dụng học tập và làm việc Pomodoro kết hợp thú cưng đồng hành giúp bạn không còn trì hoãn.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <head>
        <JsonLd />
      </head>
      <body className="min-h-screen bg-linear-to-b from-rose-50/40 via-amber-50/30 to-slate-100 text-slate-800 antialiased font-sans pb-20 sm:pb-8">
        <AppProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <DesktopTabBar />
            <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 sm:py-6">
              {children}
            </main>
            <BottomNav />
            <NotificationToast />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
