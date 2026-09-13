'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Play, Pause, RotateCcw, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { sound } from '@/lib/sound';

export function PomodoroTimer() {
  const {
    timerSettings,
    activeTask,
    completePomodoro,
    showNotification,
    isAuthenticated,
  } = useApp();

  type Mode = 'work' | 'short_break' | 'long_break';
  const [mode, setMode] = useState<Mode>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [completedCycles, setCompletedCycles] = useState(0);

  // Update timer whenever settings or mode change
  useEffect(() => {
    let minutes = 25;
    if (mode === 'work') minutes = timerSettings?.work_duration || 25;
    else if (mode === 'short_break') minutes = timerSettings?.short_break || 5;
    else if (mode === 'long_break') minutes = timerSettings?.long_break || 15;

    const seconds = minutes * 60;
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setIsRunning(false);
  }, [mode, timerSettings]);

  // Main countdown interval
  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleFinish = async () => {
    setIsRunning(false);
    const durationMinutes = Math.round(totalTime / 60);

    if (mode === 'work') {
      const coins = durationMinutes * 2;
      const exp = durationMinutes * 3;
      setCompletedCycles((c) => c + 1);
      if (isAuthenticated) {
        await completePomodoro(durationMinutes, coins, exp);
      } else {
        sound.playTimerAlarm();
        showNotification(`Hoàn thành phiên tập trung ${durationMinutes} phút! 🍅`);
      }
      setMode('short_break');
    } else {
      sound.playTimerAlarm();
      showNotification('Hết giờ nghỉ giải lao! Sẵn sàng vào phiên học mới nhé! 🚀');
      setMode('work');
    }
  };

  const toggleStartPause = () => {
    sound.triggerHaptic();
    sound.playClick();
    setIsRunning((r) => !r);
  };

  const handleReset = () => {
    sound.triggerHaptic();
    sound.playClick();
    setIsRunning(false);
    setTimeLeft(totalTime);
  };

  const handleManualComplete = async () => {
    if (!confirm('Bạn có muốn hoàn thành sớm phiên này để nhận thưởng không?')) return;
    const spentSeconds = totalTime - timeLeft;
    const actualMinutes = Math.max(1, Math.round(spentSeconds / 60));
    await handleFinish();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG circular arc progress
  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 mb-6 text-xs font-semibold shadow-inner">
        <button
          onClick={() => {
            setMode('work');
            setIsRunning(false);
          }}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            mode === 'work'
              ? 'bg-white text-rose-600 shadow-xs scale-100 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🍅 Tập trung ({timerSettings?.work_duration || 25}m)
        </button>
        <button
          onClick={() => {
            setMode('short_break');
            setIsRunning(false);
          }}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            mode === 'short_break'
              ? 'bg-white text-emerald-600 shadow-xs scale-100 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ☕ Nghỉ ngắn ({timerSettings?.short_break || 5}m)
        </button>
        <button
          onClick={() => {
            setMode('long_break');
            setIsRunning(false);
          }}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            mode === 'long_break'
              ? 'bg-white text-indigo-600 shadow-xs scale-100 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🌴 Nghỉ dài ({timerSettings?.long_break || 15}m)
        </button>
      </div>

      {/* Active Task Tag */}
      {activeTask && (
        <div className="mb-4 inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1 rounded-full text-xs font-medium">
          <span>🎯 Đang làm:</span>
          <strong className="truncate max-w-[200px]">{activeTask.title}</strong>
        </div>
      )}

      {/* Circular Progress Gauge */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
          {/* Background circle */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            strokeWidth="12"
            className="stroke-slate-100 fill-transparent"
          />
          {/* Animated progress circle */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`fill-transparent transition-all duration-700 ease-linear ${
              mode === 'work'
                ? 'stroke-rose-500'
                : mode === 'short_break'
                ? 'stroke-emerald-500'
                : 'stroke-indigo-500'
            }`}
          />
        </svg>

        {/* Center Time & Status */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-800 font-mono">
            {timeFormatted}
          </span>
          <span className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
            {isRunning ? 'Đang đếm giờ' : 'Tạm dừng'}
          </span>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-rose-500">
            <span>🍅 Phiên: #{completedCycles + 1}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={handleReset}
          title="Đặt lại"
          className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-xs active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={toggleStartPause}
          className={`px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
              : mode === 'work'
              ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25'
              : mode === 'short_break'
              ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
              : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/25'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-white" />
              <span>TẠM DỪNG</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white ml-0.5" />
              <span>BẮT ĐẦU</span>
            </>
          )}
        </button>

        {isRunning && (
          <button
            onClick={handleManualComplete}
            title="Hoàn thành sớm phiên"
            className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-all shadow-xs active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
