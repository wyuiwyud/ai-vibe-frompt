'use client';

import { useMemo, useState } from 'react';
import { useLandingBuilderStore } from '@/store/landingBuilderStore';
import { cn } from '@/lib/utils';
import { VisualPlaceholder } from '../components/VisualPlaceholder';
import { track } from '@/lib/analytics';

const COLOR_SWATCHES = ['#00f5ff', '#ff00cc', '#7b2fff', '#3b82f6', '#0f172a'];

const PRODUCT_TYPES = [
  'SaaS',
  'Giáo dục',
  'Ecommerce',
  'Portfolio',
  'Landing bán khóa học',
  'Blog cá nhân',
  'Startup pitch',
];

const GOALS = [
  'Lead generation',
  'Bán sản phẩm',
  'Thu thập email',
  'Giới thiệu lớp học',
  'Xây dựng thương hiệu',
];

const AUDIENCES = [
  'GenZ 18-24',
  'Sinh viên',
  'Doanh nhân trẻ',
  'Giáo viên',
  'Marketer',
  'Người Việt Nam',
];

const STYLES = [
  'Minimal',
  'Cyberpunk',
  'Neumorphic',
  'Holographic',
  'Retro-futuristic',
  'Clean Corporate',
  'Playful',
];

export function StrategyStep() {
  const strategy = useLandingBuilderStore((s) => s.strategy);
  const layout = useLandingBuilderStore((s) => s.layout);
  const updateStrategy = useLandingBuilderStore((s) => s.updateStrategy);
  const setStep = useLandingBuilderStore((s) => s.setStep);
  const resetStore = useLandingBuilderStore((s) => s.reset);

  const [brandIdea, setBrandIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiSuggest = async () => {
    if (!brandIdea || brandIdea.length < 3) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandIdea }),
      });
      const data = await res.json();
      if (res.ok && data) {
        updateStrategy(data);
        track('lpb_ai_strategy_generated', { brandIdea });
      } else {
        throw new Error(data.error || 'Failed');
      }
    } catch (e) {
      window.dispatchEvent(
        new CustomEvent('vibe:toast', {
          detail: { type: 'error', message: 'Lỗi khi AI gợi ý strategy.' },
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const isValid = useMemo(() => {
    return (
      strategy.brandName.trim().length > 0 &&
      strategy.productType.trim().length > 0 &&
      strategy.goals.length > 0
    );
  }, [strategy]);

  const toggleArrayValue = (field: 'goals' | 'targetAudience', value: string) => {
    const current = strategy[field];
    const exists = current.includes(value);
    updateStrategy({
      [field]: exists ? current.filter((v) => v !== value) : [...current, value],
    } as any);
  };

  const handleNext = () => {
    if (!isValid) {
      window.dispatchEvent(
        new CustomEvent('vibe:toast', {
          detail: {
            type: 'error',
            message:
              'Điền ít nhất Brand, Loại sản phẩm và 1 Mục tiêu trước khi tiếp tục nhé.',
          },
        })
      );
      return;
    }
    track('lpb_step1_completed', {
      productType: strategy.productType,
      goalsCount: strategy.goals.length,
    });
    setStep(2);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
      {/* Form side */}
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
            Bước 1 · Strategy Layer
          </p>
          <p className="text-sm text-white/60">
            Xác định brand, mục tiêu và vibe để AI hiểu đúng ý và đề xuất layout
            chuẩn ngay từ đầu.
          </p>
        </div>

        {/* AI Suggestion */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-cyan-400">
            ✨ AI Suggestion (Tự động hóa)
          </label>
          <div className="flex gap-2">
            <input
              placeholder="Bạn định bán gì? (ví dụ: Mỹ phẩm sạch, App học tập...)"
              value={brandIdea}
              onChange={(e) => setBrandIdea(e.target.value)}
              disabled={isGenerating}
              className="h-10 flex-1 rounded-lg border border-white/15 bg-black/20 px-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
            <button
              onClick={handleAiSuggest}
              disabled={isGenerating || brandIdea.length < 3}
              className={cn(
                'rounded-lg px-4 text-xs font-bold transition',
                isGenerating ? 'bg-white/10 text-white/30' : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              )}
            >
              {isGenerating ? 'Generating...' : 'Gợi ý'}
            </button>
          </div>
          <p className="mt-2 text-[10px] text-white/40">AI sẽ tự động điền các mục bên dưới dựa trên ý tưởng của bạn.</p>
        </div>

        {/* Brand */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm text-white/90">
            <span>Tên brand / dự án *</span>
            <span className="text-[11px] text-white/40">Tối đa 30 ký tự</span>
          </label>
          <input
            maxLength={30}
            placeholder="VD: VIBE Frompt"
            value={strategy.brandName}
            onChange={(e) => updateStrategy({ brandName: e.target.value })}
            className="h-10 w-full rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/35 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        {/* Color + style */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Color */}
          <div className="space-y-2">
            <label className="text-sm text-white/90">Màu chủ đạo *</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={strategy.primaryColor}
                onChange={(e) => updateStrategy({ primaryColor: e.target.value })}
                className="h-9 w-9 cursor-pointer rounded-full border border-white/20 bg-transparent p-0"
              />
              <div className="flex flex-wrap gap-2">
                {COLOR_SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateStrategy({ primaryColor: c })}
                    className={cn(
                      'h-6 w-6 rounded-full border border-white/10 transition',
                      strategy.primaryColor === c && 'ring-2 ring-cyan-400'
                    )}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Style */}
          <div className="space-y-2">
            <label className="text-sm text-white/90">Phong cách mong muốn</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((style) => {
                const active = strategy.style === style;
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => updateStrategy({ style })}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition',
                      active
                        ? 'border-cyan-400/70 bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.7)]'
                        : 'border-white/20 bg-transparent text-white/70 hover:border-cyan-400/60 hover:text-cyan-200'
                    )}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product type */}
        <div className="space-y-2">
          <label className="text-sm text-white/90">
            Loại sản phẩm / trải nghiệm *
          </label>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_TYPES.map((type) => {
              const active = strategy.productType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateStrategy({ productType: type })}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition',
                    active
                      ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.5)]'
                      : 'border border-white/20 bg-white/5 text-white/70 hover:border-cyan-400/60 hover:text-cyan-200'
                  )}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Goals */}
        <div className="space-y-2">
          <label className="text-sm text-white/90">Mục tiêu chính *</label>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => {
              const active = strategy.goals.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleArrayValue('goals', g)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition',
                    active
                      ? 'bg-cyan-400/90 text-black shadow-[0_0_18px_rgba(34,211,238,0.8)]'
                      : 'border border-white/20 bg-white/5 text-white/70 hover:border-cyan-400/60 hover:text-cyan-200'
                  )}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audience */}
        <div className="space-y-2">
          <label className="text-sm text-white/90">Đối tượng mục tiêu</label>
          <div className="flex flex-wrap gap-2">
            {AUDIENCES.map((a) => {
              const active = strategy.targetAudience.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleArrayValue('targetAudience', a)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition',
                    active
                      ? 'bg-fuchsia-500/90 text-white shadow-[0_0_18px_rgba(236,72,153,0.8)]'
                      : 'border border-white/20 bg-white/5 text-white/70 hover:border-fuchsia-400/70 hover:text-fuchsia-100'
                  )}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="grid grid-cols-[1fr_auto] gap-3 pt-2">
          <button
            type="button"
            onClick={handleNext}
            className={cn(
              'flex items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition',
              'bg-cyan-400 text-black shadow-[0_0_30px_rgba(34,211,238,0.7)] hover:bg-cyan-300',
              !isValid && 'opacity-80'
            )}
          >
            Tiếp tục → Chọn layout
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('Bạn có chắc muốn xóa hết để làm lại từ đầu?')) resetStore();
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 hover:bg-red-500/10 hover:text-red-400 transition"
            title="Reset"
          >
            🔄
          </button>
          {!isValid && (
            <p className="col-span-2 mt-2 text-xs text-red-400/80">
              * Cần ít nhất Tên brand, Loại sản phẩm và 1 Mục tiêu để tiếp tục.
            </p>
          )}
        </div>
      </div>

      {/* Visual preview side */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
          Live Preview · Structure Layer
        </p>
        <VisualPlaceholder
          primaryColor={strategy.primaryColor}
          layoutType={layout.layoutType}
          layout={layout}
        />
        <p className="text-[11px] text-white/45">
          Strategy Layer (Input Parser) sẽ chuẩn hóa các biến brand, màu, mục
          tiêu và đối tượng để chọn pattern layout tối ưu ở bước tiếp theo.
        </p>
      </div>
    </div>
  );
}

