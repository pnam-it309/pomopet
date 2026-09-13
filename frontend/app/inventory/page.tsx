import type { Metadata } from 'next';
import { InventoryView } from './InventoryView';

export const metadata: Metadata = {
  title: 'Túi Đồ & Trang Bị Thú Cưng',
  description:
    'Quản lý thức ăn, trang phục mũ đội đầu và chủ đề phòng học đã sở hữu. Cho thú cưng ăn hoặc thay đổi diện mạo ngay lập tức.',
  alternates: {
    canonical: '/inventory/',
  },
  openGraph: {
    title: 'Túi Đồ & Trang Bị | PomoPet',
    description: 'Kho đồ cá nhân: Trang bị mũ phù thủy, cho ăn bánh kem và đổi phòng học.',
    url: 'https://pomopet.app/inventory/',
  },
};

export default function InventoryPage() {
  return <InventoryView />;
}
