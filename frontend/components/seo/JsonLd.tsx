import React from 'react';

export function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PomoPet',
    alternateName: 'PomoPet Pomodoro & Virtual Pet',
    url: 'https://pomopet.app',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Any, Web Browser, iOS, Android, Windows, macOS',
    description:
      'PomoPet là ứng dụng quản lý thời gian theo phương pháp Pomodoro kết hợp nuôi thú ảo thông minh (Tamagotchi), giúp tăng cường sự tập trung, theo dõi nhiệm vụ và nuôi dưỡng thói quen làm việc năng suất.',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '2.0.0',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'VND',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      'Đồng hồ Pomodoro vòng tròn chuẩn khoa học với chu kỳ 25/5/15',
      'Nuôi thú ảo sinh động 2D (Mèo, Rồng con, Bé mầm, Chim cánh cụt) với biểu cảm và phụ kiện',
      'Quản lý công việc (To-Do List) gắn liền với số quả cà chua Pomodoro',
      'Hệ thống Gamification: Kiếm xu, tăng cấp, mua thức ăn và trang phục thú cưng',
      'Âm thanh mưa êm dịu (Brown noise ambient generator) hỗ trợ tập trung sâu',
      'Hỗ trợ cài đặt như ứng dụng native trên di động (Progressive Web App)',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
