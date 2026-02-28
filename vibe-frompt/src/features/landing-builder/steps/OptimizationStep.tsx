'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useLandingBuilderStore,
    type SectionType,
} from '@/store/landingBuilderStore';
import { VisualPlaceholder } from '../components/VisualPlaceholder';
import { cn } from '@/lib/utils';
// import {
//     DragDropContext,
//     Droppable,
//     Draggable,
//     type DropResult,
// } from '@hello-pangea/dnd';
import {
    GripVertical,
    Trash2,
    Plus,
    Layout,
    Type,
    Sparkles,
    Settings2,
    Monitor,
    Tablet,
    Smartphone,
} from 'lucide-react';

const SECTION_LABELS: Record<SectionType, string> = {
    hero: '🦸 Hero',
    benefits: '✅ Benefits',
    features: '⚡ Features',
    testimonials: '🌟 Testimonials',
    pricing: '💰 Pricing',
    faq: '❓ FAQ',
    ctaFinal: '🚀 CTA Final',
};

const ADDABLE_SECTIONS: SectionType[] = ['benefits', 'features', 'testimonials', 'pricing', 'faq', 'ctaFinal'];

const FONTS = ['Inter', 'Poppins', 'Space Grotesk', 'Manrope'] as const;
const BUTTON_SHAPES = [
    { value: 'rounded', label: 'Rounded' },
    { value: 'full', label: 'Full' },
    { value: 'pill', label: 'Pill' },
] as const;
const HOVER_EFFECTS = [
    { value: 'tilt3d', label: '3D Tilt' },
    { value: 'scale', label: 'Scale' },
    { value: 'glow', label: 'Glow' },
    { value: 'lift', label: 'Lift' },
] as const;

export function OptimizationStep() {
    const layout = useLandingBuilderStore((s) => s.layout);
    const strategy = useLandingBuilderStore((s) => s.strategy);
    const updateLayout = useLandingBuilderStore((s) => s.updateLayout);
    const setStep = useLandingBuilderStore((s) => s.setStep);

    const [activeTab, setActiveTab] = useState<'hero' | 'sections' | 'design' | 'ai'>('sections');
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [aiTips, setAiTips] = useState<string[]>([]);
    const [aiApplied, setAiApplied] = useState(false);

    const handleAiOptimize = async () => {
        setIsOptimizing(true);
        setAiApplied(false);
        try {
            const res = await fetch('/api/generate/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ strategy, layout }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Lỗi API');

            // Apply AI recommendations to store
            if (data.headline) updateLayout({ hero: { ...layout.hero, headline: data.headline } });
            if (data.subheadline) updateLayout({ hero: { ...layout.hero, subheadline: data.subheadline } });
            if (data.ctaText) updateLayout({ hero: { ...layout.hero, ctaText: data.ctaText } });
            if (data.sectionOrder?.length) {
                const reordered = data.sectionOrder
                    .map((type: string) => layout.sections.find((s) => s.type === type))
                    .filter(Boolean);
                if (reordered.length > 0) updateLayout({ sections: reordered });
            }
            if (data.tips?.length) setAiTips(data.tips);
            setAiApplied(true);
        } catch (e) {
            setAiTips(['Không thể kết nối AI lúc này. Thử lại sau.']);
        } finally {
            setIsOptimizing(false);
        }
    };

    // Drag-drop functionality removed - use simple reordering buttons if needed
    // const onDragEnd = (result: DropResult) => {
    //     if (!result.destination) return;
    //     const items = Array.from(layout.sections);
    //     const [moved] = items.splice(result.source.index, 1);
    //     items.splice(result.destination.index, 0, moved);
    //     updateLayout({ sections: items });
    // };

    const removeSection = (id: string) => {
        updateLayout({ sections: layout.sections.filter((s) => s.id !== id) });
    };

    const addSection = (type: SectionType) => {
        updateLayout({
            sections: [...layout.sections, { id: `${type}-${Date.now()}`, type, settings: {} }],
        });
        setShowAddMenu(false);
    };

    const TABS = [
        { id: 'hero', icon: <Layout className="h-4 w-4" />, label: 'Hero' },
        { id: 'sections', icon: <Settings2 className="h-4 w-4" />, label: 'Bố cục' },
        { id: 'design', icon: <Type className="h-4 w-4" />, label: 'Thiết kế' },
        { id: 'ai', icon: <Sparkles className="h-4 w-4" />, label: 'AI' },
    ];

    return (
        <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Bước 3 · Optimization Layer</p>
            <p className="text-sm text-white/50 mb-4">Tinh chỉnh nội dung, bố cục và thiết kế chi tiết.</p>

            <div className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-white/8 bg-black/40 lg:h-[520px] lg:flex-row">
                {/* ── Left Sidebar ── */}
                <div className="flex w-full flex-col lg:w-[340px] lg:border-r lg:border-white/5">
                    {/* Tab Bar */}
                    <div className="flex shrink-0 border-b border-white/5 px-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    'flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition',
                                    activeTab === tab.id ? 'text-cyan-400' : 'text-white/30 hover:text-white/60'
                                )}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div layoutId="tabLine" className="h-0.5 w-5 rounded-full bg-cyan-400" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content — scrollable */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <AnimatePresence mode="wait">
                            {/* ── HERO TAB ── */}
                            {activeTab === 'hero' && (
                                <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Headline</label>
                                        <textarea
                                            rows={3}
                                            value={layout.hero.headline}
                                            onChange={(e) => updateLayout({ hero: { ...layout.hero, headline: e.target.value } })}
                                            placeholder="VD: Tăng gấp 3 lần doanh thu với AI..."
                                            className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Subheadline</label>
                                        <textarea
                                            rows={2}
                                            value={layout.hero.subheadline}
                                            onChange={(e) => updateLayout({ hero: { ...layout.hero, subheadline: e.target.value } })}
                                            placeholder="Mô tả ngắn về giá trị..."
                                            className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none resize-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">CTA Text</label>
                                            <input
                                                value={layout.hero.ctaText}
                                                onChange={(e) => updateLayout({ hero: { ...layout.hero, ctaText: e.target.value } })}
                                                placeholder="Thử ngay miễn phí"
                                                className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">CTA Color</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={layout.hero.ctaColor}
                                                    onChange={(e) => updateLayout({ hero: { ...layout.hero, ctaColor: e.target.value } })}
                                                    className="h-8 w-8 cursor-pointer rounded border border-white/20 bg-transparent"
                                                />
                                                <span className="text-[10px] text-white/40">{layout.hero.ctaColor}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Background Style</label>
                                        <div className="flex gap-2">
                                            {(['gradient', 'blurOrbs', 'particles'] as const).map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => updateLayout({ hero: { ...layout.hero, backgroundStyle: s } })}
                                                    className={cn('flex-1 rounded-lg border py-1.5 text-[10px] font-medium transition capitalize',
                                                        layout.hero.backgroundStyle === s
                                                            ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                                                            : 'border-white/10 bg-white/5 text-white/40 hover:border-white/20'
                                                    )}
                                                >{s}</button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── SECTIONS TAB ── */}
                            {activeTab === 'sections' && (
                                <motion.div key="sections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Cấu trúc trang</p>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowAddMenu(!showAddMenu)}
                                                className="flex items-center gap-1 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-400/20"
                                            >
                                                <Plus className="h-3 w-3" /> Thêm section
                                            </button>
                                            {showAddMenu && (
                                                <div className="absolute right-0 top-8 z-10 w-36 rounded-xl border border-white/10 bg-black/90 p-2 shadow-xl backdrop-blur-xl">
                                                    {ADDABLE_SECTIONS.map((t) => (
                                                        <button
                                                            key={t}
                                                            onClick={() => addSection(t)}
                                                            className="w-full rounded-lg px-2 py-1.5 text-left text-[11px] text-white/70 hover:bg-white/5"
                                                        >
                                                            {SECTION_LABELS[t]}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {layout.sections.length === 0 && (
                                        <p className="py-6 text-center text-[11px] text-white/20">Chưa có section nào. Thêm section để bắt đầu.</p>
                                    )}

                                    <div className="space-y-2">
                                        {layout.sections.map((section, index) => (
                                            <div
                                                key={section.id}
                                                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 hover:border-white/10 transition"
                                            >
                                                <p className="flex-1 text-xs font-medium text-white/80">
                                                    {SECTION_LABELS[section.type] ?? section.type}
                                                </p>
                                                <button onClick={() => removeSection(section.id)} className="text-white/20 hover:text-red-400 transition">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* ── DESIGN TAB ── */}
                            {activeTab === 'design' && (
                                <motion.div key="design" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                                    {/* Font */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Font chữ</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {FONTS.map((f) => (
                                                <button
                                                    key={f}
                                                    onClick={() => updateLayout({ typography: { ...layout.typography, font: f } })}
                                                    className={cn('rounded-lg border py-2 text-[11px] font-medium transition',
                                                        layout.typography.font === f
                                                            ? 'border-fuchsia-400 bg-fuchsia-400/10 text-fuchsia-300'
                                                            : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
                                                    )}
                                                    style={{ fontFamily: f }}
                                                >{f}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Headline size */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                                            Headline Size — {layout.typography.headlineSizePx}px
                                        </label>
                                        <input
                                            type="range" min={32} max={96} step={4}
                                            value={layout.typography.headlineSizePx}
                                            onChange={(e) => updateLayout({ typography: { ...layout.typography, headlineSizePx: +e.target.value } })}
                                            className="w-full accent-cyan-400"
                                        />
                                    </div>

                                    {/* Button Shape */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Button Shape</label>
                                        <div className="flex gap-2">
                                            {BUTTON_SHAPES.map((s) => (
                                                <button
                                                    key={s.value}
                                                    onClick={() => updateLayout({ typography: { ...layout.typography, buttonShape: s.value } })}
                                                    className={cn('flex-1 rounded-lg border py-1.5 text-[10px] font-medium transition',
                                                        layout.typography.buttonShape === s.value
                                                            ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                                                            : 'border-white/10 bg-white/5 text-white/40 hover:border-white/20'
                                                    )}
                                                >{s.label}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Hover Effect */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Hover Effect</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {HOVER_EFFECTS.map((h) => (
                                                <button
                                                    key={h.value}
                                                    onClick={() => updateLayout({ visuals: { ...layout.visuals, hoverEffect: h.value } })}
                                                    className={cn('rounded-lg border py-1.5 text-[10px] font-medium transition',
                                                        layout.visuals.hoverEffect === h.value
                                                            ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                                                            : 'border-white/10 bg-white/5 text-white/40 hover:border-white/20'
                                                    )}
                                                >{h.label}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Toggles */}
                                    <div className="space-y-3 rounded-xl border border-white/8 bg-white/3 p-3">
                                        {[
                                            { label: 'Micro-animations', key: 'microAnimations', val: layout.visuals.microAnimations },
                                            { label: 'Blur Orbs Background', key: 'blurOrbs', val: layout.visuals.blurOrbs },
                                        ].map((t) => (
                                            <div key={t.key} className="flex items-center justify-between">
                                                <span className="text-xs text-white/60">{t.label}</span>
                                                <button
                                                    onClick={() => updateLayout({ visuals: { ...layout.visuals, [t.key]: !t.val } })}
                                                    className={cn('h-5 w-9 rounded-full transition-colors', t.val ? 'bg-cyan-400' : 'bg-white/10')}
                                                >
                                                    <span className={cn('block h-4 w-4 rounded-full bg-white shadow transition-transform mx-0.5', t.val ? 'translate-x-4' : 'translate-x-0')} />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-white/60">Particles Intensity</span>
                                                <span className="text-[10px] text-white/40">{layout.visuals.particlesIntensity}%</span>
                                            </div>
                                            <input
                                                type="range" min={0} max={100}
                                                value={layout.visuals.particlesIntensity}
                                                onChange={(e) => updateLayout({ visuals: { ...layout.visuals, particlesIntensity: +e.target.value } })}
                                                className="w-full accent-fuchsia-400"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── AI TAB ── */}
                            {activeTab === 'ai' && (
                                <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                    <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-cyan-300" />
                                            <p className="text-xs font-bold text-cyan-200">AI Optimize</p>
                                            {aiApplied && <span className="ml-auto rounded-full bg-green-400/20 px-2 py-0.5 text-[9px] font-bold text-green-300">✓ Đã áp dụng</span>}
                                        </div>
                                        <p className="text-[10px] leading-relaxed text-white/50">
                                            AI sẽ tự động tối ưu Headline, CTA và thứ tự sections để tăng tỷ lệ chuyển đổi dựa trên mục tiêu: <span className="text-cyan-300 font-medium">{strategy.goals[0] || 'Lead generation'}</span>.
                                        </p>
                                        <button
                                            onClick={handleAiOptimize}
                                            disabled={isOptimizing}
                                            className="mt-3 w-full rounded-lg bg-cyan-400 py-2 text-[11px] font-bold text-black shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:bg-cyan-300 transition disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
                                        >
                                            {isOptimizing ? (
                                                <><span className="h-3 w-3 rounded-full border-2 border-black/20 border-t-black animate-spin" />AI đang phân tích...</>
                                            ) : '✨ Apply AI Recommendations'}
                                        </button>
                                    </div>
                                    {aiTips.length > 0 && (
                                        <div className="rounded-xl border border-white/5 bg-white/3 p-3 space-y-2">
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">AI Tips</p>
                                            {aiTips.map((tip, i) => (
                                                <div key={i} className="flex items-start gap-2 text-[11px] text-white/60">
                                                    <span className="mt-0.5 text-cyan-400 shrink-0">›</span> {tip}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {aiTips.length === 0 && (
                                        <div className="rounded-xl border border-white/5 bg-white/3 p-3 space-y-2">
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Điều AI sẽ làm</p>
                                            {['Viết Headline theo formula AIDA', 'Tối ưu CTA text tăng click-rate', 'Sắp xếp lại sections theo best practice'].map((tip) => (
                                                <div key={tip} className="flex items-start gap-2 text-[11px] text-white/40">
                                                    <span className="mt-0.5 text-white/20 shrink-0">›</span> {tip}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── Navigation Buttons — always visible ── */}
                    <div className="shrink-0 border-t border-white/5 p-4 flex gap-2">
                        <button
                            onClick={() => setStep(2)}
                            className="flex-1 rounded-full border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/10 transition"
                        >
                            ← Quay lại
                        </button>
                        <button
                            onClick={() => setStep(4)}
                            className="flex-[2] rounded-full bg-cyan-400 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:bg-cyan-300 transition"
                        >
                            Tiếp: Review →
                        </button>
                    </div>
                </div>

                {/* ── Right: Live Preview ── */}
                <div className="relative flex flex-1 flex-col p-4">
                    <div className="mb-3 flex items-center justify-between shrink-0">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-white/70">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                            Live Preview
                        </h4>
                        <div className="flex gap-1 rounded-lg bg-black/40 p-1">
                            {[
                                { mode: 'desktop', icon: <Monitor className="h-3.5 w-3.5" /> },
                                { mode: 'tablet', icon: <Tablet className="h-3.5 w-3.5" /> },
                                { mode: 'mobile', icon: <Smartphone className="h-3.5 w-3.5" /> },
                            ].map((d) => (
                                <button
                                    key={d.mode}
                                    onClick={() => updateLayout({ deviceMode: d.mode as any })}
                                    className={cn('rounded p-1.5 transition', layout.deviceMode === d.mode ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50')}
                                >
                                    {d.icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden rounded-xl border border-white/5 bg-black/40">
                        <div className={cn(
                            'h-full overflow-y-auto p-4 transition-all duration-300',
                            layout.deviceMode === 'mobile' ? 'max-w-[360px] mx-auto' :
                                layout.deviceMode === 'tablet' ? 'max-w-[600px] mx-auto' : 'w-full'
                        )}>
                            <VisualPlaceholder
                                primaryColor={strategy.primaryColor}
                                layoutType={layout.layoutType}
                                layout={layout}
                            />
                        </div>
                    </div>

                    <p className="mt-2 text-center text-[10px] text-white/20 shrink-0">
                        ✨ Preview realtime · 🚀 Step này giúp tăng 40% conversion
                    </p>
                </div>
            </div>
        </div>
    );
}
