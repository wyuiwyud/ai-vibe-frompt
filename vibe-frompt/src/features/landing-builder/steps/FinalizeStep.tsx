'use client';

import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLandingBuilderStore } from '@/store/landingBuilderStore';
import { VisualPlaceholder } from '../components/VisualPlaceholder';
import { cn } from '@/lib/utils';
import {
    CheckCircle2,
    AlertCircle,
    Target,
    TrendingUp,
    MousePointer2,
    FileText
} from 'lucide-react';

export function FinalizeStep() {
    const layout = useLandingBuilderStore((s) => s.layout);
    const strategy = useLandingBuilderStore((s) => s.strategy);
    const setStep = useLandingBuilderStore((s) => s.setStep);
    const updateLayout = useLandingBuilderStore((s) => s.updateLayout);

    const { score, checklist } = useMemo(() => {
        let s = 0;
        const items = [
            {
                label: 'Tên thương hiệu rõ ràng',
                status: strategy.brandName.length > 2,
                points: 10,
                tip: 'Tên thương hiệu giúp định danh và tạo sự tin tưởng.'
            },
            {
                label: 'Headline mạnh mẽ và trực diện',
                status: layout.hero.headline.length > 20,
                points: 25,
                tip: 'Headline nên chứa từ khóa giá trị và giải quyết vấn đề của khách hàng.'
            },
            {
                label: 'Kêu gọi hành động (CTA) rõ ràng',
                status: layout.hero.ctaText.length > 0,
                points: 25,
                tip: 'CTA nút bấm là yếu tố quan trọng nhất để dẫn đến chuyển đổi.'
            },
            {
                label: 'Đủ số lượng Section tối thiểu (3+)',
                status: layout.sections.length >= 3,
                points: 20,
                tip: 'Một landing page cần đủ không gian để thuyết phục người dùng.'
            },
            {
                label: 'Sử dụng Testimonials (Bằng chứng xã hội)',
                status: layout.sections.some(sec => sec.type === 'testimonials'),
                points: 20,
                tip: 'Social proof giúp tăng tỷ lệ tin tưởng lên đến 34%.'
            }
        ];

        items.forEach(item => {
            if (item.status) s += item.points;
        });

        return { score: s, checklist: items };
    }, [layout, strategy]);

    // Update score in store to be used by API
    useEffect(() => {
        if (layout.conversionScore !== score) {
            updateLayout({ conversionScore: score });
        }
    }, [score, updateLayout, layout.conversionScore]);

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            <div className="space-y-6">
                <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
                        Bước 4 · Finalize Layer
                    </p>
                    <h3 className="text-xl font-bold">Kiểm tra & Đánh giá Conversion</h3>
                    <p className="text-sm text-white/60">
                        Review lại bản thiết kế dựa trên các tiêu chí tối ưu chuyển đổi (CRO) trước khi AI đóng gói Prompt.
                    </p>
                </div>

                {/* Score Card */}
                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-cyan-300">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Conversion Score</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white">{score}</span>
                            <span className="text-xl text-white/30">/100</span>
                        </div>
                        <p className="text-xs text-white/50 italic">
                            {score >= 80 ? 'Landing page của bạn đã rất sẵn sàng để "nổ" đơn!' :
                                score >= 50 ? 'Khá ổn, nhưng hãy thêm một chút gia vị để tối ưu hơn nhé.' :
                                    'Cần tinh chỉnh thêm để đạt hiệu quả chuyển đổi tốt nhất.'}
                        </p>
                    </div>

                    <div className="relative h-24 w-24">
                        <svg className="h-full w-full" viewBox="0 0 100 100">
                            <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                            <motion.circle
                                className="text-cyan-400"
                                strokeWidth="8"
                                strokeDasharray="264"
                                initial={{ strokeDashoffset: 264 }}
                                animate={{ strokeDashoffset: 264 - (264 * score / 100) }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="42"
                                cx="50"
                                cy="50"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Target className="h-8 w-8 text-white/20" />
                        </div>
                    </div>
                </div>

                {/* Checklist */}
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Deep Review Checklist</p>
                    <div className="grid gap-3 md:grid-cols-2">
                        {checklist.map((item, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex gap-3 rounded-xl border p-4 transition-all",
                                    item.status ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-white/5"
                                )}
                            >
                                <div className="mt-0.5">
                                    {item.status ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-white/20" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <p className={cn("text-sm font-semibold", item.status ? "text-emerald-200" : "text-white/60")}>
                                        {item.label}
                                    </p>
                                    <p className="text-[10px] leading-relaxed text-white/30 italic">
                                        {item.tip}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right summary side */}
            <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-4">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Hồ sơ dự án</p>

                    <SummarItem icon={<TrendingUp />} label="Goal" value={strategy.goals[0] || '—'} />
                    <SummarItem icon={<Target />} label="Archetype" value={layout.layoutType || '—'} />
                    <SummarItem icon={<FileText />} label="Sections" value={`${layout.sections.length} blocks`} />
                    <SummarItem icon={<MousePointer2 />} label="CTA" value={layout.hero.ctaText || 'Chưa đặt'} />

                    <div className="pt-2">
                        <div className="rounded-xl overflow-hidden grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition duration-500 bg-void">
                            <div className="scale-[0.5] origin-top h-[150px]">
                                <VisualPlaceholder
                                    primaryColor={strategy.primaryColor}
                                    layoutType={layout.layoutType}
                                    layout={layout}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto space-y-3">
                    <button
                        onClick={() => setStep(3)}
                        className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/10"
                    >
                        Quay lại tinh chỉnh
                    </button>
                    <button
                        onClick={() => setStep(5)}
                        className="w-full rounded-full bg-cyan-400 py-3 text-sm font-bold text-black shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:bg-cyan-300"
                    >
                        Proceed to Generate AI Prompt &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
}

function SummarItem({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="text-cyan-400/60">{icon && <div className="*:h-4 *:w-4">{icon}</div>}</div>
            <div className="flex-1">
                <p className="text-[10px] text-white/30 leading-none mb-1">{label}</p>
                <p className="text-xs font-bold text-white leading-none capitalize truncate">{value}</p>
            </div>
        </div>
    );
}
