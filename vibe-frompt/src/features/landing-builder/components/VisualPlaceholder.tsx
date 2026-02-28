'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { LayoutState, LayoutType } from '@/store/landingBuilderStore';

interface VisualPlaceholderProps {
  primaryColor: string;
  layoutType: LayoutType;
  layout: LayoutState;
}

interface FloatingBlock {
  left: number;
  top: number;
  width: number;
}

// Seed-based pseudo-random number generator for consistent results
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function VisualPlaceholder({
  primaryColor,
  layoutType,
  layout,
}: VisualPlaceholderProps) {
  const color = primaryColor || '#00f5ff';

  // Giá trị mặc định cố định cho SSR + lần render đầu client
  const [blocks, setBlocks] = useState<FloatingBlock[]>([
    { left: 10, top: 10, width: 40 },
    { left: 40, top: 30, width: 32 },
    { left: 25, top: 55, width: 28 },
  ]);
  const [isMounted, setIsMounted] = useState(false);

  // Chỉ random sau khi component đã mount trên client
  useEffect(() => {
    const next: FloatingBlock[] = Array.from({ length: 3 }).map((_, i) => ({
      left: 10 + i * 20 + seededRandom(i * 1.5) * 10,
      top: 10 + i * 15 + seededRandom(i * 2.7) * 8,
      width: 28 + seededRandom(i * 3.3) * 18,
    }));
    setBlocks(next);
    setIsMounted(true);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl">
      {/* Fake browser chrome */}
      <div className="mb-3 flex items-center gap-2 opacity-70">
        <div className="h-2 w-2 rounded-full bg-red-500/70" />
        <div className="h-2 w-2 rounded-full bg-yellow-400/70" />
        <div className="h-2 w-2 rounded-full bg-emerald-400/70" />
        <div className="ml-3 h-4 flex-1 rounded-md bg-white/5" />
      </div>

      {/* Decorative floating blocks – random hóa chỉ sau khi mount để tránh hydration mismatch */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        {isMounted && blocks.map((b, idx) => (
          <div
            key={idx}
            className="absolute h-1 rounded-full bg-cyan-400/70"
            style={{
              left: `${b.left}%`,
              top: `${b.top}%`,
              width: `${b.width}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        layout
        className="space-y-3"
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      >
        {/* Hero */}
        <motion.div
          layout
          className="rounded-xl bg-white/5 p-4"
          style={{
            boxShadow: `0 0 0 1px ${color}20, 0 18px 40px rgba(0,0,0,0.6)`,
          }}
        >
          <div
            className="mb-2 h-3 w-24 rounded-full"
            style={{ background: color }}
          />
          <div className="mb-2 h-6 w-3/4 rounded-full bg-white/25" />
          <div className="mb-4 h-3 w-2/3 rounded-full bg-white/10" />
          <div className="flex gap-2">
            <div
              className="flex h-8 w-28 items-center justify-center rounded-full text-xs font-semibold text-black"
              style={{
                background: `linear-gradient(135deg, ${color}, #ffffff)`,
              }}
            >
              CTA
            </div>
            <div className="h-8 w-24 rounded-full bg-white/5" />
          </div>
        </motion.div>

        {/* Middle sections – emphasize chosen layout type */}
        <motion.div layout className="grid grid-cols-3 gap-2 text-[10px]">
          <div className="space-y-2">
            <div className="h-3 w-16 rounded-full bg-white/15" />
            <div className="h-16 rounded-lg bg-white/4" />
          </div>
          <div className="space-y-2">
            <div
              className="h-3 w-16 rounded-full"
              style={{
                background:
                  layoutType === 'benefitFirst' ? color : 'rgba(255,255,255,0.2)',
              }}
            />
            <div className="h-16 rounded-lg bg-white/4" />
          </div>
          <div className="space-y-2">
            <div
              className="h-3 w-20 rounded-full"
              style={{
                background:
                  layoutType === 'storyFirst' ? color : 'rgba(255,255,255,0.2)',
              }}
            />
            <div className="h-16 rounded-lg bg-white/4" />
          </div>
        </motion.div>

        {/* Footer / final CTA */}
        <motion.div
          layout
          className="mt-3 flex items-center justify-between rounded-lg bg-black/70 px-3 py-2"
        >
          <div className="h-3 w-20 rounded-full bg-white/10" />
          <div
            className="flex h-7 w-24 items-center justify-center rounded-full text-[10px] font-semibold text-black"
            style={{ background: color }}
          >
            CTA cuối
          </div>
        </motion.div>
      </motion.div>

      {/* Tiny hint of sections count from layout state */}
      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-white/35">
        <span className="h-1 w-1 rounded-full bg-cyan-400/70" />
        <span>{layout.sections.length || 3} sections</span>
      </div>
    </div>
  );
}


