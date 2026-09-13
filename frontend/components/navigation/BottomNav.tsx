'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, CheckSquare, ShoppingBag, Backpack, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function BottomNav() {
  const pathname = usePathname();
  const { tasks } = useApp();
  const uncompletedTasksCount = tasks.filter((t) => !t.is_completed).length;

  const navItems = [
    { label: 'Tập trung', href: '/', icon: Clock },
    { label: 'Nhiệm vụ', href: '/tasks', icon: CheckSquare, badge: uncompletedTasksCount },
    { label: 'Cửa hàng', href: '/shop', icon: ShoppingBag },
    { label: 'Túi đồ', href: '/inventory', icon: Backpack },
    { label: 'Hồ sơ', href: '/profile', icon: User },
  ];

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe transition-all sm:hidden shadow-lg"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all select-none ${
                isActive
                  ? 'text-rose-600 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopTabBar() {
  const pathname = usePathname();
  const { tasks } = useApp();
  const uncompletedTasksCount = tasks.filter((t) => !t.is_completed).length;

  const navItems = [
    { label: 'Tập trung & Thú cưng', href: '/', icon: Clock },
    { label: 'Nhiệm vụ', href: '/tasks', icon: CheckSquare, badge: uncompletedTasksCount },
    { label: 'Cửa hàng', href: '/shop', icon: ShoppingBag },
    { label: 'Túi đồ & Trang bị', href: '/inventory', icon: Backpack },
    { label: 'Hồ sơ & Thống kê', href: '/profile', icon: User },
  ];

  return (
    <div className="hidden sm:flex items-center justify-center gap-1.5 py-3 bg-white/60 backdrop-blur-xs border-b border-slate-100">
      <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 shadow-inner">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white text-rose-600 shadow-xs scale-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-rose-500' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
