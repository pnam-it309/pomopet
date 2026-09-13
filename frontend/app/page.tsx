import React from 'react';
import { PetCard } from '@/components/pet/PetCard';
import { PomodoroTimer } from '@/components/timer/PomodoroTimer';
import { QuickTasksCard } from '@/components/home/QuickTasksCard';
import { StatsOverview } from '@/components/home/StatsOverview';
import { Sparkles, Brain, Clock, ShieldCheck, HelpCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Welcome & Headline (SEO H1) */}
      <div className="text-center sm:text-left sm:flex sm:items-center sm:justify-between pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Tập Trung Học Tập & Nuôi Thú Cưng Ảo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Kỹ thuật Pomodoro khoa học kết hợp thú cưng đồng hành giúp tăng 200% năng suất mỗi ngày.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-rose-100 shadow-2xs text-xs font-semibold text-rose-600">
          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
          <span>Phiên bản v2.0 Next.js Tối Ưu SEO</span>
        </div>
      </div>

      {/* Main 2-Column Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Virtual Pet Companion (5 cols on lg) */}
        <section
          aria-label="Thú cưng đồng hành"
          className="lg:col-span-5 flex flex-col gap-4"
        >
          <PetCard />
          <StatsOverview />
        </section>

        {/* Right Column: Pomodoro Timer & Tasks (7 cols on lg) */}
        <section
          aria-label="Đồng hồ Pomodoro"
          className="lg:col-span-7 flex flex-col gap-4"
        >
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-xl shadow-rose-900/5 flex flex-col items-center justify-center">
            <PomodoroTimer />
          </div>

          <QuickTasksCard />
        </section>
      </div>

      {/* Semantic SEO & Informative Section for Crawlers and Users */}
      <section
        aria-label="Giới thiệu phương pháp Pomodoro và nuôi thú cưng PomoPet"
        className="mt-12 bg-white/70 backdrop-blur-xs rounded-3xl p-6 sm:p-8 border border-slate-200/80 space-y-6"
      >
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Khoa Học Về Sự Tập Trung
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">
            Tại Sao PomoPet Giúp Bạn Đánh Bại Trì Hoãn?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kết hợp giữa phương pháp chia nhỏ chu kỳ làm việc Pomodoro và tâm lý học trò chơi hóa
            (Gamification).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <article className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">Phương Pháp 25/5 Khoa Học</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              25 phút tập trung cao độ giúp não bộ không bị kiệt sức, 5 phút nghỉ ngắn tái tạo năng
              lượng để tiếp tục phiên tiếp theo mà không uể oải.
            </p>
          </article>

          <article className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">Cơ Chế Thưởng Gamification</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Mỗi quả cà chua Pomodoro hoàn thành sẽ thưởng Xu và EXP để thú cưng thăng cấp, mở khóa
              phụ kiện, thúc đẩy động lực hoàn thành to-do list.
            </p>
          </article>

          <article className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">Bảo Mật & Tiện Lợi Đa Nền Tảng</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Dữ liệu được lưu trữ an toàn bằng Golang Backend & MySQL. Bạn có thể mở trực tiếp trên
              máy tính hoặc quét mã QR dùng trên điện thoại iPhone/Android.
            </p>
          </article>
        </div>

        {/* FAQs Accordion / List for SEO Snippets */}
        <div className="border-t border-slate-200/80 pt-6">
          <h3 className="font-bold text-base text-slate-800 mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-rose-500" />
            <span>Câu Hỏi Thường Gặp (FAQ)</span>
          </h3>
          <div className="space-y-3 text-xs">
            <details className="p-3 bg-white rounded-xl border border-slate-200/60 cursor-pointer">
              <summary className="font-semibold text-slate-700">
                Làm thế nào để thú cưng của tôi lớn lên và tiến hóa?
              </summary>
              <p className="mt-2 text-slate-500 leading-relaxed">
                Thú cưng sẽ nhận EXP sau mỗi phiên Pomodoro hoàn thành hoặc khi bạn hoàn thành nhiệm vụ
                hằng ngày. Khi đạt mốc cấp độ, thú cưng sẽ phát triển từ Giai đoạn Bé (Baby) lên
                Trưởng thành (Adult).
              </p>
            </details>
            <details className="p-3 bg-white rounded-xl border border-slate-200/60 cursor-pointer">
              <summary className="font-semibold text-slate-700">
                Tôi có thể sử dụng PomoPet trên điện thoại di động không?
              </summary>
              <p className="mt-2 text-slate-500 leading-relaxed">
                Hoàn toàn được! Bạn chỉ cần nhấn vào biểu tượng Điện Thoại trên thanh điều hướng để lấy
                mã QR, mở camera điện thoại quét và trải nghiệm ngay trên trình duyệt di động mà không
                cần tải từ App Store.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
