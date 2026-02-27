'use client';

import { useMemo } from 'react';
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
  const { strategy, layout, updateStrategy, setStep } = useLandingBuilderStore(
    (s) => ({
      strategy: s.strategy,
      layout: s.layout,
      updateStrategy: s.updateStrategy,
      setStep: s.setStep,
    })
  );

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
        <div className="pt-2">
          <button
            type="button"
            onClick={handleNext}
            className={cn(
              'flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition',
              'bg-cyan-400 text-black shadow-[0_0_30px_rgba(34,211,238,0.7)] hover:bg-cyan-300',
              !isValid && 'opacity-80'
            )}
          >
            Tiếp tục → Chọn layout
          </button>
          {!isValid && (
            <p className="mt-2 text-xs text-red-400/80">
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

