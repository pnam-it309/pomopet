import type { Metadata } from 'next';
import { ShopView } from './ShopView';

export const metadata: Metadata = {
  title: 'Cửa Hàng Vật Phẩm & Phụ Kiện Thú Cưng',
  description:
    'Sử dụng xu kiếm được từ các phiên Pomodoro để mua thức ăn ngon, mũ phù thủy, vương miện và phòng học chủ đề cho thú ảo của bạn.',
  alternates: {
    canonical: '/shop/',
  },
  openGraph: {
    title: 'Cửa Hàng Phụ Kiện & Thức Ăn | PomoPet',
    description: 'Mua sắm thức ăn và trang phục đáng yêu cho thú cưng với xu tích lũy.',
    url: 'https://pomopet.app/shop/',
  },
};

export default function ShopPage() {
  return <ShopView />;
}
