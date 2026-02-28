'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLandingBuilderStore } from '@/store/landingBuilderStore';

interface ReverseSourceModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReverseSourceModal({ open, onClose }: ReverseSourceModalProps) {
  const updateStrategy = useLandingBuilderStore((s) => s.updateStrategy);
  const updateLayout = useLandingBuilderStore((s) => s.updateLayout);
  const setStep = useLandingBuilderStore((s) => s.setStep);

  const [mode, setMode] = useState<'url' | 'image'>('url');
  const [url, setUrl] = useState('');
  const [imageBase64] = useState('');
  const [loading, setLoading] = useState(false);

  const fireToast = (type: 'error' | 'success', message: string) => {
    window.dispatchEvent(
      new CustomEvent('vibe:toast', {
        detail: { type, message },
      })
    );
  };

  const handleApply = async () => {
    if (loading) return;
    if (mode === 'url' && !url.trim()) {
      fireToast('error', 'Dán link website bạn muốn reverse trước đã.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/reverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: mode === 'url' ? url.trim() : undefined,
          imageBase64: mode === 'image' ? imageBase64 : undefined,
        }),
      });
      if (!res.ok) {
        throw new Error('Reverse API error');
      }
      const data = await res.json();
      updateStrategy({
        brandName: data.inferredBrandName || '',
        primaryColor: data.primaryColor || '#00f5ff',
        productType: data.productType || '',
        goals: data.goals || [],
        targetAudience: data.targetAudience || [],
        style: data.style || 'Holographic',
      });
      updateLayout({
        layoutType: data.layoutTypeGuess || 'actionFirst',
      } as any);
      fireToast(
        'success',
        'Đã reverse xong khung layout. Kiểm tra lại ở bước Strategy & Structure nhé.'
      );
      setStep(1);
      onClose();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      fireToast(
        'error',
        'Reverse mode tạm thời lỗi hoặc chưa được bật. Thử lần nữa sau nhé.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            className="w-full max-w-lg rounded-3xl border border-white/15 bg-black/90 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.9)]"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
                  Reverse Mode · Beta
                </p>
                <h2 className="text-lg font-semibold">
                  Lấy cảm hứng từ website/hình có sẵn
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/20 bg-white/5 px-2 py-1 text-xs text-white/60 hover:bg-white/10"
              >
                Đóng
              </button>
            </div>

            <div className="mb-3 flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setMode('url')}
                className={`flex-1 rounded-full px-3 py-1 font-medium ${mode === 'url'
                    ? 'bg-cyan-400 text-black'
                    : 'border border-white/20 bg-white/5 text-white/70'
                  }`}
              >
                Từ website (URL)
              </button>
              <button
                type="button"
                onClick={() => setMode('image')}
                className={`flex-1 rounded-full px-3 py-1 font-medium ${mode === 'image'
                    ? 'bg-cyan-400 text-black'
                    : 'border border-white/20 bg-white/5 text-white/70'
                  }`}
              >
                Từ hình ảnh (soon)
              </button>
            </div>

            {mode === 'url' ? (
              <div className="space-y-2">
                <label className="text-xs text-white/80">
                  Dán link trang mà bạn muốn reverse cấu trúc landing page
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="VD: https://linear.app hoặc https://notion.so"
                  className="w-full rounded-xl border border-white/20 bg-black/60 p-2.5 text-xs text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            ) : (
              <p className="mt-2 text-xs text-white/55">
                Upload từ hình ảnh sẽ được bật sau khi kết nối model vision.
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white/70 hover:bg-white/10"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={loading}
                className="rounded-full bg-cyan-400 px-3 py-1 font-semibold text-black hover:bg-cyan-300 disabled:opacity-60"
              >
                {loading ? 'Đang phân tích...' : 'Reverse & áp dụng'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

