import type { Metadata } from 'next';
import { ProfileView } from './ProfileView';

export const metadata: Metadata = {
  title: 'Hồ Sơ Cá Nhân & Thống Kê Năng Suất',
  description:
    'Theo dõi tiến trình chuỗi ngày học tập (Streak), lịch sử các phiên Pomodoro, hoàn thành nhiệm vụ ngày nhận thưởng và nhận nuôi thú cưng mới.',
  alternates: {
    canonical: '/profile/',
  },
  openGraph: {
    title: 'Hồ Sơ Cá Nhân & Thống Kê | PomoPet',
    description: 'Xem chuỗi ngày học tập, lịch sử tập trung và nhiệm vụ ngày nhận thưởng.',
    url: 'https://pomopet.app/profile/',
  },
};

export default function ProfilePage() {
  return <ProfileView />;
}
