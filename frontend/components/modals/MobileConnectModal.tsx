'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { X, Smartphone, Wifi, ExternalLink, Copy } from 'lucide-react';

interface MobileConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileConnectModal({ isOpen, onClose }: MobileConnectModalProps) {
  const { mobileInfo, showNotification } = useApp();

  if (!isOpen) return null;

  const mobileUrl = mobileInfo?.mobile_url || 'http://localhost:8080';

  const handleCopy = () => {
    navigator.clipboard.writeText(mobileUrl);
    showNotification('Đã sao chép liên kết mở trên điện thoại!');
  };

  // Google Chart API QR Generator for crystal-clear QR rendering
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    mobileUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 text-2xl">
          <Smartphone className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-800">Mở Trên Điện Thoại</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Đảm bảo điện thoại và máy tính cùng kết nối chung một mạng Wi-Fi
        </p>

        {/* QR Code Container */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-inner">
          <img
            src={qrUrl}
            alt="Mã QR mở PomoPet trên Smartphone"
            className="w-40 h-40 object-contain rounded-lg"
          />
        </div>

        {/* Direct Link & Copy */}
        <div className="mt-4 flex items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200 text-xs">
          <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-mono text-slate-700 truncate font-medium flex-1 text-left">
            {mobileUrl}
          </span>
          <button
            onClick={handleCopy}
            title="Sao chép liên kết"
            className="p-1.5 bg-white rounded-lg hover:bg-slate-50 text-slate-600 shadow-2xs transition-colors shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-[11px] text-amber-800 text-left">
          💡 <strong>Mẹo PWA:</strong> Mở link trên Safari (iPhone) hoặc Chrome (Android), chọn{' '}
          <strong>&ldquo;Thêm vào Màn hình chính&rdquo;</strong> để biến thành ứng dụng Native mượt mà!
        </div>
      </div>
    </div>
  );
}
