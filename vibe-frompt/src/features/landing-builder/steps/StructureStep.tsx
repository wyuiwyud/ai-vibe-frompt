'use client';

import { motion } from 'framer-motion';
import { useLandingBuilderStore, type LayoutType } from '@/store/landingBuilderStore';
import { VisualPlaceholder } from '../components/VisualPlaceholder';
import { cn } from '@/lib/utils';
import { Sparkles, Trophy, BookOpen } from 'lucide-react';

const LAYOUT_ARCHETYPES = [
    {
        id: 'actionFirst' as LayoutType,
        name: 'Action-First',
        description:
            'Tập trung tối đa vào chuyển đổi ngay lập tức với CTA nổi bật và thông điệp trực diện.',
        pros: 'Tỷ lệ chuyển đổi cao cho các sản phẩm đã có thương hiệu hoặc ưu đãi giới hạn.',
        icon: <Sparkles className="h-5 w-5" />,
        color: 'from-cyan-400 to-blue-500',
    },
    {
        id: 'benefitFirst' as LayoutType,
        name: 'Benefit-First',
        description:
            'Lấy lợi ích của khách hàng làm trọng tâm, giải thích tại sao họ nên chọn bạn.',
        pros: 'Phù hợp nhất cho SaaS, ứng dụng mobile hoặc các dịch vụ cần giải thích giá trị.',
        icon: <Trophy className="h-5 w-5" />,
        color: 'from-fuchsia-400 to-purple-600',
    },
    {
        id: 'storyFirst' as LayoutType,
        name: 'Story-First',
        description:
            'Dẫn dắt khách hàng qua một câu chuyện cảm xúc trước khi đi đến lời kêu gọi hành động.',
        pros: 'Tăng sự tin tưởng và kết nối thương hiệu cho các sản phẩm giáo dục, khóa học.',
        icon: <BookOpen className="h-5 w-5" />,
        color: 'from-emerald-400 to-teal-600',
    },
];

export function StructureStep() {
    const layout = useLandingBuilderStore((s) => s.layout);
    const strategy = useLandingBuilderStore((s) => s.strategy);
    const updateLayout = useLandingBuilderStore((s) => s.updateLayout);
    const setStep = useLandingBuilderStore((s) => s.setStep);

    const handleSelect = (id: LayoutType) => {
        let defaultSections: any[] = [];

        // Define default sections based on archetype
        if (id === 'actionFirst') {
            defaultSections = [
                { id: 'hero-1', type: 'hero', settings: {} },
                {
                    id: 'features-1',
                    type: 'features',
                    settings: { title: 'Tính năng chính' },
                },
                { id: 'testimonials-1', type: 'testimonials', settings: {} },
                { id: 'cta-1', type: 'ctaFinal', settings: {} },
            ];
        } else if (id === 'benefitFirst') {
            defaultSections = [
                { id: 'hero-1', type: 'hero', settings: {} },
                {
                    id: 'benefits-1',
                    type: 'benefits',
                    settings: { title: 'Lợi ích nhận được' },
                },
                { id: 'features-1', type: 'features', settings: {} },
                { id: 'testimonials-1', type: 'testimonials', settings: {} },
                { id: 'cta-1', type: 'ctaFinal', settings: {} },
            ];
        } else if (id === 'storyFirst') {
            defaultSections = [
                { id: 'hero-1', type: 'hero', settings: {} },
                {
                    id: 'benefits-1',
                    type: 'benefits',
                    settings: { title: 'Giá trị cốt lõi' },
                },
                {
                    id: 'features-1',
                    type: 'features',
                    settings: { title: 'Giải pháp của chúng tôi' },
                },
                { id: 'testimonials-1', type: 'testimonials', settings: {} },
                { id: 'cta-1', type: 'ctaFinal', settings: {} },
            ];
        }

        updateLayout({
            layoutType: id,
            sections: defaultSections,
        });
    };

    const handleNext = () => {
        if (layout.layoutType) {
            setStep(3);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
                    Bước 2 · Structure Layer
                </p>
                <h3 className="text-xl font-bold">Chọn cấu trúc bố cục gợi ý</h3>
                <p className="text-sm text-white/60">
                    AI đã phân tích mục tiêu{' '}
                    <span className="text-cyan-300 font-medium">
                        &quot;{strategy.goals[0] || 'Phát triển'}&quot;
                    </span>{' '}
                    của bạn và đề xuất 3 archetype layout tối ưu nhất.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {LAYOUT_ARCHETYPES.map((arch) => {
                    const isActive = layout.layoutType === arch.id;
                    return (
                        <motion.div
                            key={arch.id}
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(arch.id)}
                            className={cn(
                                'group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border transition-all duration-300',
                                isActive
                                    ? 'border-cyan-400/50 bg-cyan-400/5 ring-1 ring-cyan-400/50'
                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                            )}
                        >
                            {/* Card visual preview */}
                            <div className="relative aspect-[4/3] w-full overflow-hidden p-3 bg-void/50">
                                <div className="scale-[0.7] origin-top h-[142%]">
                                    <VisualPlaceholder
                                        primaryColor={strategy.primaryColor}
                                        layoutType={arch.id}
                                        layout={layout}
                                    />
                                </div>
                                {isActive && (
                                    <div className="absolute inset-0 bg-cyan-400/10 backdrop-blur-[1px]" />
                                )}
                            </div>

                            {/* Card content */}
                            <div className="flex flex-1 flex-col p-5">
                                <div className="mb-3 flex items-center justify-between">
                                    <div
                                        className={cn(
                                            'flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br transition-shadow group-hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]',
                                            arch.color
                                        )}
                                    >
                                        {arch.icon}
                                    </div>
                                    {isActive && (
                                        <Badge className="bg-cyan-400 text-black">Đã chọn</Badge>
                                    )}
                                </div>

                                <h4 className="mb-2 text-lg font-bold text-white">
                                    {arch.name}
                                </h4>
                                <p className="mb-4 text-xs leading-relaxed text-white/50">
                                    {arch.description}
                                </p>

                                <div className="mt-auto rounded-lg bg-white/5 p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300/80 mb-1">
                                        Điểm mạnh:
                                    </p>
                                    <p className="text-[10px] text-white/70 italic leading-snug">
                                        &quot;{arch.pros}&quot;
                                    </p>
                                </div>
                            </div>

                            {/* Selection indicator */}
                            <div
                                className={cn(
                                    'absolute top-3 right-3 h-5 w-5 rounded-full border-2 border-white/20 transition-all',
                                    isActive
                                        ? 'bg-cyan-400 border-cyan-400 scale-110'
                                        : 'bg-transparent group-hover:border-white/40'
                                )}
                            >
                                {isActive && (
                                    <svg
                                        className="h-4 w-4 text-black"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/5 pt-6">
                <button
                    type="button"
                    onClick={handleBack}
                    className="text-xs font-medium text-white/60 transition hover:text-white"
                >
                    &larr; Quay lại
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={!layout.layoutType}
                    className={cn(
                        'rounded-full px-8 py-2.5 text-sm font-bold transition-all duration-300',
                        layout.layoutType
                            ? 'bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                            : 'bg-white/10 text-white/20'
                    )}
                >
                    Tiếp tục: Điều chỉnh chi tiết &rarr;
                </button>
            </div>
        </div>
    );
}


function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            className
        )}>
            {children}
        </span>
    );
}
