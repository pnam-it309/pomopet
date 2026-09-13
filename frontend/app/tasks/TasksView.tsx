'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Target,
  AlertCircle,
  Filter,
  Check,
} from 'lucide-react';
import { TaskItem } from '@/lib/api';

export function TasksView() {
  const {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    activeTask,
    setActiveTask,
    isAuthenticated,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [estimated, setEstimated] = useState(1);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addTask(title.trim(), priority, estimated);
    setTitle('');
    setEstimated(1);
    setIsModalOpen(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.is_completed;
    if (filter === 'completed') return t.is_completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Danh Sách Nhiệm Vụ</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ước tính số cà chua 🍅 và tập trung hoàn thành từng mục tiêu.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-md shadow-rose-600/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Nhiệm Vụ</span>
        </button>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
          <span>Tiến độ hoàn thành</span>
          <span className="text-rose-600 font-bold">
            {completedCount}/{tasks.length} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-linear-to-r from-amber-400 to-rose-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold shadow-inner">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-800 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tất cả ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'pending'
                ? 'bg-white text-rose-600 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Đang làm ({tasks.filter((t) => !t.is_completed).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'completed'
                ? 'bg-white text-emerald-600 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Đã xong ({completedCount})
          </button>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white/60 rounded-3xl border border-dashed border-slate-200">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Không có nhiệm vụ nào trong mục này</p>
            <p className="text-xs text-slate-400 mt-1">
              Hãy thêm nhiệm vụ mới để bắt đầu phiên Pomodoro tập trung!
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isSelected = activeTask?.id === task.id;
            const priorityColors = {
              low: 'text-blue-600 bg-blue-50 border-blue-200',
              medium: 'text-amber-600 bg-amber-50 border-amber-200',
              high: 'text-rose-600 bg-rose-50 border-rose-200',
            };

            const priorityLabels = {
              low: 'Thấp',
              medium: 'Vừa',
              high: 'Gấp',
            };

            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-4 rounded-2xl bg-white border transition-all shadow-xs ${
                  isSelected
                    ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/40'
                    : task.is_completed
                    ? 'opacity-60 border-slate-200 bg-slate-50'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Left: Checkbox & Title */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTask(task)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                  >
                    {task.is_completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-sm font-semibold block truncate ${
                        task.is_completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                          priorityColors[task.priority || 'medium']
                        }`}
                      >
                        Ưu tiên: {priorityLabels[task.priority || 'medium']}
                      </span>
                      <span className="text-[11px] font-medium text-amber-600">
                        🍅 {task.completed_pomodoros}/{task.estimated_pomodoros} quả
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Select for Pomodoro & Delete */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {!task.is_completed && (
                    <button
                      onClick={() => setActiveTask(isSelected ? null : task)}
                      title={isSelected ? 'Hủy chọn' : 'Chọn nhiệm vụ này để tập trung'}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {isSelected ? 'Đang chọn' : 'Tập trung'}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => deleteTask(task.id)}
                    title="Xóa nhiệm vụ"
                    className="p-2 text-slate-300 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Thêm Nhiệm Vụ Mới</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên nhiệm vụ / Việc cần làm
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Đọc xong chương 3 sách kinh tế"
                  autoFocus
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-rose-400 focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Độ ưu tiên
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        priority === p
                          ? 'bg-rose-50 border-rose-400 text-rose-600 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p === 'low' ? 'Thấp' : p === 'medium' ? 'Vừa' : 'Gấp 🔥'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số quả cà chua dự kiến (1 quả = 25 phút)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={estimated}
                    onChange={(e) => setEstimated(Number(e.target.value))}
                    className="flex-1 accent-rose-500"
                  />
                  <span className="text-sm font-bold text-slate-800 w-12 text-right">
                    🍅 {estimated}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-rose-600/20 transition-all active:scale-95"
                >
                  Tạo Nhiệm Vụ
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-slate-500 hover:text-slate-800 text-sm font-medium rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
