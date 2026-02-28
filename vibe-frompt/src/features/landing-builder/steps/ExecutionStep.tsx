'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLandingBuilderStore } from '@/store/landingBuilderStore';
import { cn, copyToClipboard } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { track } from '@/lib/analytics';

export function ExecutionStep() {
  const strategy = useLandingBuilderStore((s) => s.strategy);
  const layout = useLandingBuilderStore((s) => s.layout);
  const finalPrompt = useLandingBuilderStore((s) => s.finalPrompt);
  const isGenerating = useLandingBuilderStore((s) => s.isGenerating);
  const setFinalPrompt = useLandingBuilderStore((s) => s.setFinalPrompt);
  const setIsGenerating = useLandingBuilderStore((s) => s.setIsGenerating);

  const [refinement, setRefinement] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const hasPrompt = Boolean(finalPrompt);

  const fireToast = (type: 'error' | 'success', message: string) => {
    window.dispatchEvent(
      new CustomEvent('vibe:toast', {
        detail: { type, message },
      })
    );
  };

  const callApi = async (opts?: { regenerate?: boolean }) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setFinalPrompt(null); // Clear immediately so loading state is visible
    try {
      const res = await fetch('/api/generate-readdy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy,
          layout,
          refinement: refinement.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'API error');
      }
      const data: { prompt: string; length: number; conversionScore: number } =
        await res.json();
      setFinalPrompt(data.prompt);
      track('lpb_prompt_generated', {
        length: data.length,
        conversionScore: data.conversionScore,
      });
      fireToast(
        'success',
        opts?.regenerate ? 'Prompt Readdy đã được sinh lại.' : 'Đã sinh prompt Readdy.'
      );
    } catch (e) {
      console.error(e);
      fireToast(
        'error',
        'API AI đang bận hoặc lỗi. Thử lại sau hoặc dùng template tạm nhé.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!finalPrompt) return;
    try {
      await copyToClipboard(finalPrompt);
      fireToast('success', 'Prompt copied! Paste vào Readdy ngay đi bro.');
      track('lpb_prompt_copied');
    } catch {
      fireToast('error', 'Không copy được vào clipboard, thử lại nhé.');
    }
  };

  const handleDownload = () => {
    if (!finalPrompt) return;
    const blob = new Blob([finalPrompt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vibe-prompt-readdy.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleSaveProject = async () => {
    if (!supabase) {
      fireToast(
        'error',
        'Supabase chưa được cấu hình. Thêm NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY nhé.'
      );
      return;
    }
    if (!finalPrompt) {
      fireToast('error', 'Chưa có prompt để lưu. Hãy sinh prompt trước đã.');
      return;
    }
    setIsSaving(true);
    try {
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();
      if (authError || !session?.user) {
        fireToast(
          'error',
          'Bạn cần đăng nhập Supabase (Google/Email) trước khi lưu dự án.'
        );
        return;
      }

      const userId = session.user.id;
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          title: strategy.brandName || 'Dự án mới',
          brand_name: strategy.brandName,
          main_color: strategy.primaryColor,
          product_type: strategy.productType,
          goal: strategy.goals.join(', '),
          target_audience: strategy.targetAudience,
          style: strategy.style,
          layout_type: layout.layoutType,
          layout_json: layout,
          final_prompt: finalPrompt,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      fireToast(
        'success',
        'Dự án đã được lưu! Mở lại trong dashboard khi bạn build xong.'
      );
      // eslint-disable-next-line no-console
      console.log('Saved project', data);
      track('project_saved');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      fireToast(
        'error',
        'Không lưu được dự án. Kiểm tra lại cấu hình Supabase hoặc thử lại sau.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-start">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
            Bước 5 · Execution Layer
          </p>
          <h3 className="text-lg font-semibold">
            Prompt Readdy cuối cùng cho{' '}
            <span className="text-gradient">
              {strategy.brandName || 'dự án của bạn'}
            </span>
          </h3>
          <ul className="mt-2 text-xs text-white/60 space-y-1">
            <li>
              <span className="text-cyan-300">Brand:</span>{' '}
              {strategy.brandName || '—'}
            </li>
            <li>
              <span className="text-cyan-300">Loại sản phẩm:</span>{' '}
              {strategy.productType || '—'}
            </li>
            <li>
              <span className="text-cyan-300">Mục tiêu:</span>{' '}
              {strategy.goals.join(', ') || '—'}
            </li>
            <li>
              <span className="text-cyan-300">Đối tượng:</span>{' '}
              {strategy.targetAudience.join(', ') || '—'}
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-[11px] text-white/70">
          <p className="mb-1 font-semibold text-cyan-300">
            Conversion Layer snapshot
          </p>
          <p>
            Layout:{' '}
            <span className="text-white">
              {layout.layoutType || 'chưa chọn (default Action-first)'}
            </span>
          </p>
          <p>
            Sections:{' '}
            <span className="text-white">
              {layout.sections.length || 0} blocks
            </span>
          </p>
          <p>
            Font:{' '}
            <span className="text-white">{layout.typography.font}</span> ·
            spacing base {layout.typography.spacingBase}px
          </p>
          <p className="mt-1 text-[10px] text-white/50">
            Prompt sẽ được đóng gói theo RTCE+I, giới hạn 2000 ký tự và ưu tiên
            các yếu tố Clarity × Trust × Emotional Trigger.
          </p>
        </div>
      </div>

      {/* Prompt output card */}
      <motion.div
        layout
        className="rounded-2xl border border-white/10 bg-black/70 p-4 md:p-5"
      >
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
              Prompt Readdy ≤ 2000 ký tự
            </p>
            <p className="text-xs text-white/50">
              Copy và paste thẳng vào Readdy để build landing page MVP.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => callApi({ regenerate: !hasPrompt })}
              disabled={isGenerating}
              className={cn(
                'rounded-full px-3 py-1 font-semibold transition',
                'bg-cyan-400 text-black hover:bg-cyan-300',
                isGenerating && 'opacity-60'
              )}
            >
              {isGenerating
                ? 'AI đang làm phép màu...'
                : hasPrompt
                  ? 'Regenerate prompt'
                  : 'Sinh prompt ngay'}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!hasPrompt}
              className={cn(
                'rounded-full border border-white/20 bg-white/5 px-3 py-1 font-medium text-white/80 transition hover:border-cyan-400/60 hover:text-cyan-200',
                !hasPrompt && 'opacity-40'
              )}
            >
              Copy
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!hasPrompt}
              className={cn(
                'rounded-full border border-white/20 bg-white/5 px-3 py-1 font-medium text-white/80 transition hover:border-cyan-400/60 hover:text-cyan-200',
                !hasPrompt && 'opacity-40'
              )}
            >
              Download .txt
            </button>
            <button
              type="button"
              onClick={handleSaveProject}
              disabled={!hasPrompt || isSaving}
              className={cn(
                'rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 font-medium text-emerald-200 transition hover:border-emerald-300 hover:bg-emerald-500/20',
                (!hasPrompt || isSaving) && 'opacity-40'
              )}
            >
              {isSaving ? 'Đang lưu...' : 'Lưu dự án (Supabase)'}
            </button>
          </div>
        </div>

        <div className="mb-3 h-56 rounded-xl border border-white/10 bg-black/60 p-3 text-xs font-mono text-white/80 overflow-y-auto">
          {isGenerating ? (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="h-8 w-8 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-cyan-300 font-semibold text-sm">AI đang tạo prompt...</p>
                <p className="text-white/30 text-[10px]">Đang phân tích {layout.sections.length || 0} sections + strategy + design system</p>
              </div>
            </div>
          ) : hasPrompt ? (
            <pre className="whitespace-pre-wrap break-words">
              {finalPrompt}
            </pre>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <span className="text-3xl">✨</span>
              <p className="text-white/40 text-xs">
                Nhấn &quot;Sinh prompt ngay&quot; để AI đóng gói toàn bộ<br />
                Strategy + Layout + Design thành prompt Readdy hoàn chỉnh
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/70">
            Refine (tùy chọn) – muốn AI chỉnh thêm điều gì?
          </label>
          <textarea
            rows={3}
            value={refinement}
            onChange={(e) => setRefinement(e.target.value)}
            placeholder="VD: Thêm social proof mạnh hơn, đổi vibe sang tối giản hơn, nhấn mạnh CTA đăng ký..."
            className="w-full rounded-xl border border-white/15 bg-black/60 p-2.5 text-xs text-white placeholder:text-white/35 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>
      </motion.div>
    </div>
  );
}

