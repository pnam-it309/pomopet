'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Sparkles, LogIn, UserPlus, Lock, User, Heart } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [species, setSpecies] = useState<'cat' | 'dragon' | 'sprout' | 'penguin'>('cat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        if (!username || !password || !displayName) {
          throw new Error('Vui lòng nhập đầy đủ thông tin');
        }
        await register(username, password, displayName, species);
      } else {
        if (!username || !password) {
          throw new Error('Vui lòng nhập tên đăng nhập và mật khẩu');
        }
        await login(username, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setIsRegister(false);
    setUsername('demo');
    setPassword('123456');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2 text-2xl shadow-inner">
            {isRegister ? '🐾' : '🍅'}
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            {isRegister ? 'Tạo Tài Khoản PomoPet' : 'Đăng Nhập PomoPet'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRegister
              ? 'Nhận thú cưng đầu tiên và bắt đầu học tập!'
              : 'Đồng bộ tiến độ học tập và thú cưng của bạn'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên đăng nhập</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="VD: mochi123"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-rose-400 focus:bg-white transition-all text-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-rose-400 focus:bg-white transition-all text-slate-800"
                required
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên hiển thị</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="VD: Bạn Mochi"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-rose-400 focus:bg-white transition-all text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Chọn bạn thú cưng khởi đầu
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'cat', label: 'Mèo', emoji: '🐱' },
                    { id: 'dragon', label: 'Rồng', emoji: '🐲' },
                    { id: 'sprout', label: 'Mầm', emoji: '🌱' },
                    { id: 'penguin', label: 'Cánh cụt', emoji: '🐧' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSpecies(item.id as any)}
                      className={`py-2 px-1 rounded-xl text-center border text-xs font-medium transition-all ${
                        species === item.id
                          ? 'border-rose-500 bg-rose-50 text-rose-600 font-bold scale-105'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xl mb-0.5">{item.emoji}</div>
                      <div>{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Đăng ký ngay</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
          >
            {isRegister
              ? 'Đã có tài khoản? Đăng nhập ngay'
              : 'Chưa có tài khoản? Tạo tài khoản mới'}
          </button>

          {!isRegister && (
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] text-slate-500 hover:text-slate-700 underline font-medium"
            >
              🚀 Nhấn để dùng thử tài khoản Demo có sẵn
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
