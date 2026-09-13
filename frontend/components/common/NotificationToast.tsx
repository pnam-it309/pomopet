'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Bell, Sparkles } from 'lucide-react';

export function NotificationToast() {
  const { notification } = useApp();

  if (!notification) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-auto animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-slate-900/90 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-slate-700/50 flex items-center gap-3 text-xs font-semibold">
        <div className="w-7 h-7 rounded-xl bg-rose-500/30 text-rose-300 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="leading-snug">{notification}</span>
      </div>
    </div>
  );
}
