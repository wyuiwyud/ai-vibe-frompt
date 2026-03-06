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
  const aiDirections = useLandingBuilderStore((s) => s.aiDirections);
  const selectedDirectionId = useLandingBuilderStore((s) => s.selectedDirectionId);
  const chatHistory = useLandingBuilderStore((s) => s.chatHistory);

  const setFinalPrompt = useLandingBuilderStore((s) => s.setFinalPrompt);
  const setIsGenerating = useLandingBuilderStore((s) => s.setIsGenerating);
  const setAIDirections = useLandingBuilderStore((s) => s.setAIDirections);
  const setSelectedDirection = useLandingBuilderStore((s) => s.setSelectedDirection);
  const addChatMessage = useLandingBuilderStore((s) => s.addChatMessage);
  const updateLayout = useLandingBuilderStore((s) => s.updateLayout);

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

  const getDirections = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setAIDirections(null);
    try {
      const res = await fetch('/api/generate-readdy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'get_directions', strategy, layout }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch directions');
      setAIDirections(data.directions);
    } catch (e) {
      fireToast('error', 'AI đang bận, không đưa ra gợi ý được. Thử lại sau nhé.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectDirection = (id: number) => {
    const dir = aiDirections?.find(d => d.id === id);
    if (!dir) return;
    setSelectedDirection(id);

    // Auto-update layout based on selection (simulating AI refinement)
    updateLayout({
      hero: { ...layout.hero, headline: dir.headline, subheadline: dir.subheadline },
      typography: { ...layout.typography, font: dir.font as any },
    });

    addChatMessage({ role: 'assistant', content: `Tuyệt vời! Bạn đã chọn hướng **${dir.title}**. Tôi đã cập nhật bộ font và headline tương ứng. Bạn có muốn điều chỉnh thêm gì không?` });
  };

  const handleSendMessage = async () => {
    if (!refinement.trim() || isGenerating) return;

    const userMsg = refinement.trim();
    setRefinement(''); // Clear input
    addChatMessage({ role: 'user', content: userMsg });

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-readdy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'refine_strategy',
          strategy,
          chatHistory: [...chatHistory, { role: 'user', content: userMsg }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Refine API failed');
      addChatMessage({ role: 'assistant', content: data.response });
    } catch (e) {
      fireToast('error', 'AI không phản hồi tin nhắn. Hãy thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const callApi = async (opts?: { regenerate?: boolean }) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setFinalPrompt(null);
    try {
      const res = await fetch('/api/generate-readdy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy,
          layout,
          refinement: chatHistory.map(m => m.content).join('\n') + `\n${refinement}`,
        }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setFinalPrompt(data.prompt);
      fireToast('success', 'Đã sinh prompt Readdy hoàn chỉnh!');
    } catch (e) {
      fireToast('error', 'Lỗi khi tạo prompt.');
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
      console.log('Saved project', data);
      track('project_saved');
    } catch (e) {
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
      {/* Phase 1: Not started or loading */}
      {!aiDirections && !isGenerating && !finalPrompt && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 text-4xl">🤖</div>
          <h3 className="mb-2 text-xl font-bold text-white">VIBE AI đã sẵn sàng</h3>
          <p className="mb-6 max-w-sm text-sm text-white/50">
            Hãy để AI phân tích toàn bộ Strategy của bạn và đưa ra các phương án layout tối ưu nhất.
          </p>
          <button
            onClick={getDirections}
            className="btn-magnetic bg-cyan-400 px-8 py-3 text-sm font-bold text-black"
          >
            Bắt đầu phân tích AI
          </button>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && !aiDirections && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="relative mb-6">
            <div className="h-16 w-16 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-xl">🧠</div>
          </div>
          <h3 className="text-lg font-bold text-cyan-300">AI đang phân tích chiến lược...</h3>
          <p className="text-xs text-white/40 mt-2">Dựa trên Brand: {strategy.brandName}</p>
        </div>
      )}

      {/* Selection Phase */}
      {aiDirections && !selectedDirectionId && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">2 Phương án Gợi ý từ AI ⚡</h3>
            <p className="text-xs text-white/50">Chọn hướng đi phù hợp nhất với mục tiêu của bạn.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {aiDirections.map((dir) => (
              <div
                key={dir.id}
                onClick={() => handleSelectDirection(dir.id)}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] p-6 transition-all hover:border-cyan-400/40 hover:bg-white/[0.05]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Direction 0{dir.id}
                  </span>
                  <span className="text-2xl transition-transform group-hover:scale-110">{dir.id === 1 ? '🔥' : '🌿'}</span>
                </div>
                <h4 className="mb-2 text-lg font-bold text-white group-hover:text-cyan-200">{dir.title}</h4>
                <p className="mb-4 text-xs leading-relaxed text-white/50">{dir.reasoning}</p>

                <div className="space-y-3 rounded-2xl bg-black/40 p-3 text-[11px]">
                  <div className="flex gap-2">
                    <span className="text-cyan-300/80">Font:</span>
                    <span className="text-white">{dir.font}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-cyan-300/80">Headline (60px):</span>
                    <span className="italic text-white">&quot;{dir.headline}&quot;</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dir.sections.slice(0, 4).map((s, i) => (
                      <span key={i} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] text-white/40 border border-white/10 uppercase font-mono">
                        {s.type}
                      </span>
                    ))}
                    <span className="text-[9px] text-white/20">...</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center rounded-xl bg-cyan-400/5 py-2.5 text-xs font-bold text-cyan-300 transition-colors group-hover:bg-cyan-400 group-hover:text-black">
                  Chọn phương án này
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chat & Refinement Phase */}
      {selectedDirectionId && !finalPrompt && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedDirection(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              >
                ←
              </button>
              <h3 className="text-lg font-bold text-white">Tinh chỉnh cùng VIBE AI</h3>
            </div>
            <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              STRATEGY MODE
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/40 overflow-hidden">
            <div className="max-h-[380px] overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}>
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    msg.role === 'user' ? "bg-white/10 text-white" : "bg-cyan-400 text-black"
                  )}>
                    {msg.role === 'user' ? 'ME' : 'AI'}
                  </div>
                  <div className={cn(
                    "rounded-2xl p-3 text-xs leading-relaxed",
                    msg.role === 'user' ? "bg-cyan-400/10 text-cyan-100 border border-cyan-400/20" : "bg-white/5 text-white/80"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex gap-3 mr-auto items-center animate-pulse">
                  <div className="flex h-8 w-8 bg-cyan-400 text-black rounded-full items-center justify-center text-[10px]">AI</div>
                  <div className="h-4 w-12 bg-white/5 rounded-full" />
                </div>
              )}
            </div>

            <div className="border-t border-white/5 bg-black/60 p-4 space-y-3">
              <div className="relative">
                <textarea
                  rows={3}
                  value={refinement}
                  onChange={(e) => setRefinement(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Nhập yêu cầu tinh chỉnh (VD: 'Thêm bảng giá', 'Đổi sang vibe luxury')..."
                  className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 pr-12 text-xs text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!refinement.trim() || isGenerating}
                  className="absolute bottom-4 right-4 h-8 w-8 flex items-center justify-center rounded-xl bg-cyan-400 text-black disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-white/30 italic">Nhấn Enter để gửi phản hồi cho AI</p>
                <button
                  onClick={() => callApi()}
                  disabled={isGenerating}
                  className="btn-magnetic bg-emerald-400 px-6 py-2.5 text-[11px] font-bold text-black flex items-center gap-2 group"
                >
                  <span>Xong, Tạo Prompt Readdy</span>
                  <span className="transition-transform group-hover:translate-x-1">🚀</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Final Prompt Phase */}
      {finalPrompt && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">✨ Prompt hoàn chỉnh</h3>
            <button
              onClick={() => setFinalPrompt(null)}
              className="text-[10px] uppercase tracking-wider text-white/30 hover:text-cyan-300"
            >
              Chỉnh sửa thêm
            </button>
          </div>
          <div className="relative group">
            <div className="max-h-80 overflow-y-auto rounded-3xl border border-white/10 bg-black/80 p-5 font-mono text-[11px] leading-relaxed text-cyan-100/90 scrollbar-hide">
              {finalPrompt}
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={handleCopy} className="rounded-full bg-white/10 p-2 text-white hover:bg-cyan-400 hover:text-black transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button onClick={handleDownload} className="text-xs text-white/40 hover:text-white underline">Tải xuống .txt</button>
            <button onClick={handleSaveProject} className="text-xs text-emerald-400 hover:text-emerald-300 font-bold">Lưu lên Supabase Cloud</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

