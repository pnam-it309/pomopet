'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { CheckSquare, Plus, ArrowRight, CheckCircle2, Circle, Target } from 'lucide-react';

export function QuickTasksCard() {
  const { tasks, toggleTask, activeTask, setActiveTask, addTask, isAuthenticated } = useApp();
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addTask(newTitle.trim(), 'medium', 1);
    setNewTitle('');
    setIsAdding(false);
  };

  const pendingTasks = tasks.filter((t) => !t.is_completed).slice(0, 4);

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-rose-100 shadow-xl shadow-rose-900/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Nhiệm Vụ Cần Làm</h3>
        </div>

        <Link
          href="/tasks"
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
        >
          <span>Xem tất cả ({tasks.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {pendingTasks.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400 font-medium">Chưa có nhiệm vụ nào!</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-2 text-xs text-rose-600 font-bold hover:underline"
            >
              + Thêm nhiệm vụ đầu tiên
            </button>
          </div>
        ) : (
          pendingTasks.map((task) => {
            const isSelected = activeTask?.id === task.id;
            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all text-xs ${
                  isSelected
                    ? 'bg-rose-50/80 border-rose-300 shadow-xs'
                    : 'bg-slate-50/80 border-slate-100 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTask(task)}
                    className="text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                  >
                    <Circle className="w-4 h-4" />
                  </button>
                  <span className="truncate font-medium text-slate-700">{task.title}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                    🍅 {task.completed_pomodoros}/{task.estimated_pomodoros}
                  </span>
                  <button
                    onClick={() => setActiveTask(isSelected ? null : task)}
                    title={isSelected ? 'Hủy gắn vào Timer' : 'Gắn vào Timer Pomodoro'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-500 hover:text-rose-600'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Add Form */}
      {isAdding ? (
        <form onSubmit={handleQuickAdd} className="mt-3 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nhập tên nhiệm vụ mới..."
            autoFocus
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-rose-400 focus:bg-white text-slate-800"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            Lưu
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-2.5 py-2 text-slate-400 hover:text-slate-600 text-xs font-medium"
          >
            Hủy
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full mt-3 py-2 border border-dashed border-slate-200 hover:border-rose-300 rounded-2xl text-xs font-semibold text-slate-500 hover:text-rose-600 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nhanh nhiệm vụ</span>
        </button>
      )}
    </div>
  );
}
