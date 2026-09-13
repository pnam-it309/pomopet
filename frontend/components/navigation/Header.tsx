'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Flame,
  Coins,
  Gem,
  Volume2,
  VolumeX,
  CloudRain,
  Smartphone,
  User as UserIcon,
  LogOut,
  LogIn,
  Sparkles,
} from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { MobileConnectModal } from '@/components/modals/MobileConnectModal';

export function Header() {
  const {
    user,
    isAuthenticated,
    logout,
    profile,
    ambientPlaying,
    toggleAmbient,
    soundEnabled,
    toggleSound,
    pet,
  } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-rose-100 shadow-xs transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🍅</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-800 tracking-tight">PomoPet</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">
                  Lv.{pet?.level || 1}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Tập trung & Thú ảo</p>
            </div>
          </Link>

          {/* User Currencies & Streak */}
          {isAuthenticated && profile && (
            <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/80 text-xs font-semibold">
              <div className="flex items-center gap-1 text-amber-600">
                <Coins className="w-4 h-4" />
                <span>{profile.coins}</span>
              </div>
              <div className="w-px h-3 bg-slate-200" />
              <div className="flex items-center gap-1 text-indigo-600">
                <Gem className="w-4 h-4" />
                <span>{profile.gems}</span>
              </div>
              <div className="w-px h-3 bg-slate-200" />
              <div className="flex items-center gap-1 text-rose-500">
                <Flame className="w-4 h-4 fill-rose-500 animate-pulse" />
                <span>{profile.streak} ngày</span>
              </div>
            </div>
          )}

          {/* Quick Actions (Audio, Mobile Wi-Fi, Auth) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Ambient Rain Sound */}
            <button
              onClick={toggleAmbient}
              title={ambientPlaying ? 'Tắt tiếng mưa' : 'Bật tiếng mưa tập trung'}
              className={`p-2 rounded-xl transition-colors border ${
                ambientPlaying
                  ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <CloudRain className={`w-4 h-4 ${ambientPlaying ? 'animate-bounce' : ''}`} />
            </button>

            {/* Sound FX Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Mobile Wi-Fi Connect */}
            <button
              onClick={() => setMobileModalOpen(true)}
              title="Kết nối điện thoại qua Wi-Fi"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* Auth Dropdown / Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-1 sm:pl-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 py-1 px-2.5 rounded-xl hover:bg-slate-100 transition-colors text-xs font-medium text-slate-700"
                >
                  <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                    {user?.display_name ? user.display_name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline font-semibold">{user?.display_name || user?.username}</span>
                </Link>
                <button
                  onClick={logout}
                  title="Đăng xuất"
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <MobileConnectModal isOpen={mobileModalOpen} onClose={() => setMobileModalOpen(false)} />
    </>
  );
}
