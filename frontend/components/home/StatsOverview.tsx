'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Clock, CheckCircle2, Flame, Award } from 'lucide-react';

export function StatsOverview() {
  const { profile, pet } = useApp();

  const totalMinutes = profile?.total_focus_minutes || 0;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins} phút`;

  const completedPomos = profile?.completed_pomodoros || 0;
  const streak = profile?.streak || 1;

  const statItems = [
    {
      label: 'Tổng thời gian tập trung',
      value: timeFormatted,
      icon: Clock,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      label: 'Cà chua hoàn thành',
      value: `${completedPomos} quả`,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Chuỗi ngày liên tục',
      value: `${streak} ngày 🔥`,
      icon: Flame,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
    {
      label: 'Cấp độ thú cưng',
      value: `Cấp ${pet?.level || 1}`,
      icon: Award,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-slate-500 leading-tight">
                {item.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${item.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-800 tracking-tight">{item.value}</div>
          </div>
        );
      })}
    </div>
  );
}
