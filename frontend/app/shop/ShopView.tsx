'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, Coins, Gem, Apple, Sparkles, Check, Heart, Zap } from 'lucide-react';
import { ShopItem } from '@/lib/api';

export function ShopView() {
  const { shopCatalog, profile, buyItem, isAuthenticated } = useApp();
  const [category, setCategory] = useState<'all' | 'food' | 'hat' | 'theme'>('all');
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const filteredItems = shopCatalog.filter((item) => {
    if (category === 'all') return true;
    return item.category === category;
  });

  const handleBuy = async (item: ShopItem) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để mua sắm vật phẩm!');
      return;
    }
    if ((profile?.coins || 0) < item.price) {
      alert('Bạn không đủ Xu để mua món này! Hãy hoàn thành thêm phiên Pomodoro nhé!');
      return;
    }

    setBuyingId(item.id);
    try {
      await buyItem(item.id);
    } finally {
      setBuyingId(null);
    }
  };

  const isUnlocked = (itemId: string) => {
    return profile?.unlocked_items?.includes(itemId);
  };

  const getInventoryQuantity = (itemId: string) => {
    const inv = profile?.inventory?.find((i) => i.item_id === itemId);
    return inv ? inv.quantity : 0;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cửa Hàng Vật Phẩm</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Dùng Xu tích lũy từ sự chăm chỉ để nâng cấp cuộc sống cho thú cưng!
          </p>
        </div>

        {/* Currency Pill */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs text-sm font-bold self-start sm:self-auto">
          <div className="flex items-center gap-1.5 text-amber-600">
            <Coins className="w-5 h-5" />
            <span>{profile?.coins || 0} Xu</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5 text-indigo-600">
            <Gem className="w-5 h-5" />
            <span>{profile?.gems || 0} Ngọc</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Tất cả vật phẩm', emoji: '✨' },
          { id: 'food', label: 'Thức ăn', emoji: '🍎' },
          { id: 'hat', label: 'Mũ & Phụ kiện', emoji: '🎩' },
          { id: 'theme', label: 'Phòng học & Chủ đề', emoji: '🛋️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategory(tab.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
              category === tab.id
                ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20 scale-100'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="mr-1">{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Item Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const unlocked = isUnlocked(item.id);
          const quantity = getInventoryQuantity(item.id);
          const canAfford = (profile?.coins || 0) >= item.price;
          const isHatOrTheme = item.category === 'hat' || item.category === 'theme';

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Item Icon */}
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner border border-amber-100/60">
                  {item.icon || (item.category === 'food' ? '🍎' : '🎩')}
                </div>

                {/* Title & Category */}
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {item.category === 'food'
                      ? 'Thức ăn'
                      : item.category === 'hat'
                      ? 'Mũ đội đầu'
                      : 'Chủ đề phòng'}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm mt-0.5">{item.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Stat Buffs */}
                <div className="flex items-center justify-center gap-2 mt-3 text-[11px] font-semibold text-slate-600">
                  {item.buff_hunger ? (
                    <span className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-0.5 rounded-lg">
                      <Apple className="w-3 h-3" /> +{item.buff_hunger} No
                    </span>
                  ) : null}
                  {item.buff_energy ? (
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg">
                      <Zap className="w-3 h-3" /> +{item.buff_energy} NL
                    </span>
                  ) : null}
                  {item.buff_mood ? (
                    <span className="flex items-center gap-1 bg-pink-50 text-pink-600 px-2 py-0.5 rounded-lg">
                      <Heart className="w-3 h-3" /> +{item.buff_mood} Tâm trạng
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Bottom Price & Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-600 font-extrabold text-sm">
                  <Coins className="w-4 h-4" />
                  <span>{item.price}</span>
                </div>

                {isHatOrTheme && unlocked ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã sở hữu</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={buyingId === item.id || !canAfford}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 shadow-xs ${
                      canAfford
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {buyingId === item.id ? (
                      'Đang mua...'
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Mua ngay {quantity > 0 ? `(Có ${quantity})` : ''}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
