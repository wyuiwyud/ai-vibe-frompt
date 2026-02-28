'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLandingBuilderStore } from '@/store/landingBuilderStore';
import { StrategyStep } from './steps/StrategyStep';
import { StructureStep } from './steps/StructureStep';
import { OptimizationStep } from './steps/OptimizationStep';
import { FinalizeStep } from './steps/FinalizeStep';
import { ExecutionStep } from './steps/ExecutionStep';
import { ReverseSourceModal } from './ReverseSourceModal';
import { cn } from '@/lib/utils';

const STEPS = [
  { index: 1, label: 'Nền tảng', sub: 'Strategy' },
  { index: 2, label: 'Layout', sub: 'Structure' },
  { index: 3, label: 'Điều chỉnh', sub: 'Optimization' },
  { index: 4, label: 'Chốt', sub: 'Finalize' },
  { index: 5, label: 'Prompt', sub: 'Execution' },
] as const;

export function LandingBuilderWizard() {
  const currentStep = useLandingBuilderStore((s) => s.currentStep);
  const setStep = useLandingBuilderStore((s) => s.setStep);
  const [reverseOpen, setReverseOpen] = useState(false);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StrategyStep />;
      case 2:
        return <StructureStep />;
      case 3:
        return <OptimizationStep />;
      case 4:
        return <FinalizeStep />;
      case 5:
        return <ExecutionStep />;
      default:
        return <StrategyStep />;
    }
  };

  return (
    <section id="landing-builder" className="section pt-24">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header + progress */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1 text-xs font-semibold text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              AI Landing Page Builder · 5 bước
            </div>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">
              Từ ý tưởng thô →{' '}
              <span className="text-gradient">Landing page MVP</span>
            </h2>
          </div>
          <div className="flex w-full items-center gap-3 md:w-72">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-cyan-400"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs text-white/60">
              Bước {currentStep} / 5
            </span>
            <button
              type="button"
              onClick={() => setReverseOpen(true)}
              className="ml-2 hidden rounded-full border border-fuchsia-400/60 bg-fuchsia-500/10 px-3 py-1 text-[10px] font-semibold text-fuchsia-100 hover:bg-fuchsia-500/20 md:inline-flex"
            >
              Reverse từ website
            </button>
          </div>
        </div>

        {/* Step badges */}
        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs">
          {STEPS.map((s) => {
            const isActive = currentStep === s.index;
            const isDone = s.index < currentStep;
            const isClickable = s.index <= currentStep && !isActive;
            return (
              <button
                key={s.index}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && setStep(s.index)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1 transition-all duration-200',
                  isActive && 'border-cyan-400/70 bg-cyan-400/15 text-cyan-200',
                  isDone && 'border-green-400/50 bg-green-400/10 text-green-300 hover:bg-green-400/20 cursor-pointer',
                  !isActive && !isDone && 'border-white/10 bg-transparent text-white/30 cursor-not-allowed'
                )}
              >
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold',
                    isActive && 'bg-cyan-400 text-black',
                    isDone && 'bg-green-400 text-black',
                    !isActive && !isDone && 'bg-white/10 text-white/40'
                  )}
                >
                  {isDone ? '✓' : s.index}
                </div>
                <span className="font-medium">{s.label}</span>
                <span className="hidden text-[10px] opacity-60 sm:inline">
                  {s.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* Shared layout container */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              layoutId="landing-builder-card"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="rounded-3xl border border-white/8 bg-black/60 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-3xl md:p-6"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <ReverseSourceModal open={reverseOpen} onClose={() => setReverseOpen(false)} />
    </section>
  );
}

