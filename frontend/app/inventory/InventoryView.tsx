'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Backpack, Apple, Sparkles, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function InventoryView() {
  const { profile, pet, feedPet, equipHat, setTheme, shopCatalog } = useApp();
  const [tab, setTab] = useState<'all' | 'food' | 'hat' | 'theme'>('all');

  // Find detailed catalog item by id
  const getItemDetails = (itemId: string) => {
    return shopCatalog.find((i) => i.id === itemId);
  };

  // Combine inventory food items and unlocked hat/theme items
  const foodItems = (profile?.inventory || []).filter((inv) => inv.quantity > 0);
  const unlockedItems = (profile?.unlocked_items || []).map((id) => getItemDetails(id)).filter(Boolean);

  const allItems = [
    ...foodItems.map((f) => ({
      id: f.item_id,
      quantity: f.quantity,
      details: getItemDetails(f.item_id),
      type: 'food' as const,
    })),
    ...unlockedItems.map((u: any) => ({
      id: u.id,
      quantity: 1,
      details: u,
      type: u.category as 'hat' | 'theme',
    })),
  ];

  const filteredItems = allItems.filter((item) => {
    if (tab === 'all') return true;
    return item.type === tab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Túi Đồ Của Bạn</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cho thú cưng ăn các món ngon hoặc thay đổi trang phục, phòng học.
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-rose-300 text-slate-700 text-xs font-semibold px-4 py-2 rounded-2xl shadow-2xs transition-all self-start sm:self-auto"
        >
          <span>Đến Cửa Hàng</span>
          <ArrowRight className="w-3.5 h-3.5 text-rose-500" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'food', label: '🍎 Thức ăn' },
          { id: 'hat', label: '🎩 Mũ & Nón' },
          { id: 'theme', label: '🛋️ Phòng học' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              tab === t.id
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Inventory Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white/60 rounded-3xl border border-dashed border-slate-200">
          <Backpack className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Túi đồ hiện đang trống</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Hãy ghé qua Cửa hàng để mua thức ăn và phụ kiện bằng số Xu bạn đã tích lũy!
          </p>
          <Link
            href="/shop"
            className="inline-block mt-4 px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-rose-700 transition-all"
          >
            Ghé Cửa Hàng Ngay 🛒
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {filteredItems.map((item) => {
            const details = item.details;
            if (!details) return null;

            const isEquippedHat = pet?.equipped_hat === item.id;
            const isAppliedTheme = pet?.theme === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-center relative"
              >
                {/* Quantity Badge */}
                {item.type === 'food' && (
                  <span className="absolute top-3 right-3 bg-rose-100 text-rose-600 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                    x{item.quantity}
                  </span>
                )}

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mx-auto mb-2 shadow-inner border border-amber-100/60">
                    {details.icon || (item.type === 'food' ? '🍎' : '🎩')}
                  </div>
                  <h3 className="font-bold text-xs text-slate-800 truncate">{details.name}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {details.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100">
                  {item.type === 'food' ? (
                    <button
                      onClick={() => feedPet(item.id)}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                    >
                      Cho ăn ngay
                    </button>
                  ) : item.type === 'hat' ? (
                    <button
                      onClick={() => equipHat(isEquippedHat ? '' : item.id)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 ${
                        isEquippedHat
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }`}
                    >
                      {isEquippedHat ? '✓ Đang đội' : 'Đội mũ này'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setTheme(isAppliedTheme ? 'default' : item.id)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 ${
                        isAppliedTheme
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isAppliedTheme ? '✓ Đang dùng' : 'Áp dụng phòng'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
