import type { Metadata } from 'next';
import { TasksView } from './TasksView';

export const metadata: Metadata = {
  title: 'Quản Lý Nhiệm Vụ & Mục Tiêu',
  description:
    'Lập danh sách việc cần làm (To-Do List), ước tính số quả cà chua Pomodoro và theo dõi tiến độ hoàn thành công việc mỗi ngày.',
  alternates: {
    canonical: '/tasks/',
  },
  openGraph: {
    title: 'Quản Lý Nhiệm Vụ & To-Do List | PomoPet',
    description:
      'Chia nhỏ công việc thành các phiên Pomodoro dễ đạt được. Tăng tốc độ giải quyết to-do list gấp 2 lần.',
    url: 'https://pomopet.app/tasks/',
  },
};

export default function TasksPage() {
  return <TasksView />;
}
