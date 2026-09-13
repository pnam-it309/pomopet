'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  User,
  Flame,
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  Gift,
  Smartphone,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { PetCanvas } from '@/components/pet/PetCanvas';

export function ProfileView() {
  const {
    user,
    profile,
    pet,
    history,
    claimQuest,
    adoptPet,
    mobileInfo,
    showNotification,
    isAuthenticated,
  } = useApp();

  const [adopting, setAdopting] = useState(false);

  const speciesOptions = [
    { id: 'cat', name: 'Mèo Mochi', emoji: '🐱', desc: 'Dễ thương, tăng độ no nhanh' },
    { id: 'dragon', name: 'Rồng Con', emoji: '🐲', desc: 'Dũng mãnh, tăng EXP thêm 10%' },
    { id: 'sprout', name: 'Bé Mầm', emoji: '🌱', desc: 'Thân thiện, tiêu hao năng lượng chậm' },
    { id: 'penguin', name: 'Cánh Cụt Pingu', emoji: '🐧', desc: 'Bền bỉ, thích hợp phiên học dài' },
  ];

  const handleAdopt = async (spId: string) => {
    if (pet?.species === spId) return;
    if (confirm(`Bạn có muốn đổi thú cưng đồng hành sang ${spId.toUpperCase()} không?`)) {
      setAdopting(true);
      try {
        await adoptPet(spId);
      } finally {
        setAdopting(false);
      }
    }
  };

  const totalMinutes = profile?.total_focus_minutes || 0;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins} phút`;

  return (
    <div className="space-y-6">
      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-rose-500 to-amber-400 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-rose-500/20">
          {user?.display_name ? user.display_name[0].toUpperCase() : 'U'}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">
              {user?.display_name || user?.username || 'Người dùng Pomopet'}
            </h1>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full self-center sm:self-auto">
              @{user?.username || 'demo'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đồng hành cùng thú cưng từ:{' '}
            {user?.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'Hôm nay'}
          </p>

          {/* Quick Stats Grid */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4 text-xs font-semibold">
            <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-3 py-1 rounded-xl border border-rose-100">
              <Flame className="w-4 h-4 fill-rose-500" />
              <span>Chuỗi {profile?.streak || 1} ngày liên tục</span>
            </div>
            <div className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
              <Clock className="w-4 h-4" />
              <span>{timeFormatted} tập trung</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
              <span>{profile?.completed_pomodoros || 0} quả cà chua</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Quests Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Nhiệm Vụ Hàng Ngày</h2>
            <p className="text-xs text-slate-500">Hoàn thành để nhận thêm Xu và EXP cho thú cưng</p>
          </div>
        </div>

        <div className="space-y-3">
          {(profile?.daily_quests || []).length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              Chưa có nhiệm vụ ngày. Hãy bắt đầu một phiên Pomodoro để mở khóa!
            </div>
          ) : (
            (profile?.daily_quests || []).map((quest) => {
              const progress = Math.min(100, (quest.current_count / quest.target_count) * 100);

              return (
                <div
                  key={quest.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-800">{quest.title}</span>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.2 rounded-md">
                        +{quest.reward_coins} Xu / +{quest.reward_exp} EXP
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{quest.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {quest.current_count}/{quest.target_count}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {quest.is_claimed ? (
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl inline-block">
                        ✓ Đã nhận
                      </span>
                    ) : quest.is_completed ? (
                      <button
                        onClick={() => claimQuest(quest.id)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 animate-pulse"
                      >
                        🎁 Nhận Thưởng
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 px-3 py-1.5 inline-block">
                        Đang làm...
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Adopt / Switch Pet Species */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Chọn Bạn Đồng Hành</h2>
            <p className="text-xs text-slate-500">
              Đổi loài thú cưng đang chăm sóc (Cấp độ và EXP vẫn được giữ nguyên)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {speciesOptions.map((sp) => {
            const isCurrent = pet?.species === sp.id;

            return (
              <div
                key={sp.id}
                onClick={() => !isCurrent && handleAdopt(sp.id)}
                className={`p-4 rounded-2xl border transition-all text-center cursor-pointer select-none ${
                  isCurrent
                    ? 'border-rose-400 bg-rose-50/60 shadow-xs ring-2 ring-rose-200'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="text-3xl mb-1">{sp.emoji}</div>
                <h3 className="font-bold text-xs text-slate-800">{sp.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{sp.desc}</p>
                <div className="mt-3">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      isCurrent
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isCurrent ? '✓ Đang chọn' : 'Đổi sang bé này'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pomodoro History Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Lịch Sử Phiên Tập Trung</h2>
            <p className="text-xs text-slate-500">Các phiên Pomodoro gần nhất của bạn</p>
          </div>
        </div>

        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              Chưa có phiên Pomodoro nào. Hãy bắt đầu ngay tại trang chủ!
            </p>
          ) : (
            history.map((sess) => (
              <div
                key={sess.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">
                    {sess.mode === 'work' ? '🍅' : sess.mode === 'short_break' ? '☕' : '🌴'}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800 capitalize">
                      {sess.mode === 'work'
                        ? 'Tập trung học tập'
                        : sess.mode === 'short_break'
                        ? 'Nghỉ ngắn'
                        : 'Nghỉ dài'}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {sess.started_at ? new Date(sess.started_at).toLocaleTimeString('vi-VN') : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-semibold">
                  <span className="text-slate-600">{sess.actual_minutes} phút</span>
                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                    +{sess.coins_earned} Xu
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
