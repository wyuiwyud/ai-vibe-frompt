'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { copyToClipboard } from '@/lib/utils';

interface Stage5ReviewProps {
  prompt: string;
  metaReview: string;
  scores: { clarity: number; structure: number; creativity: number };
  onUpgrade: () => void;
  onReset: () => void;
}

interface MetaData {
  checks: Record<string, boolean>;
  frameworks: string[];
  suggestions: string[];
  summary: string;
}

const DEFAULT_META: MetaData = {
  checks: { role: true, task: true, context: true, example: true, instruction: true },
  frameworks: ['RTCE+I Framework', 'Chain-of-Thought instruction', 'Self-critique loop'],
  suggestions: [
    'Thêm "Few-shot examples" — cung cấp 1-2 bài mẫu ngắn để AI hiểu chuẩn output',
    'Áp dụng "Perspective flip" — yêu cầu AI viết 2 góc nhìn đối lập trước khi kết luận',
  ],
  summary: 'Prompt này mạnh ở cấu trúc RTCE+I hoàn chỉnh và self-critique loop. Có thể nâng cấp thêm với few-shot examples để tăng độ chính xác output.',
};

const COMPONENT_LABELS: Record<string, string> = {
  role: '🎭 Role',
  task: '🎯 Task',
  context: '📋 Context',
  example: '💡 Example',
  instruction: '📌 Instruction',
};

export default function Stage5Review({ prompt, metaReview, scores, onUpgrade, onReset }: Stage5ReviewProps) {
  const [meta, setMeta] = useState<MetaData>(DEFAULT_META);
  const [toast, setToast] = useState('');
  const [wantsUpgrade, setWantsUpgrade] = useState<boolean | null>(null);

  useEffect(() => {
    if (!metaReview) return;
    try {
      const cleaned = metaReview.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned) as MetaData;
      if (parsed.checks && parsed.summary) setMeta(parsed);
    } catch {
      // Use default if parse fails
    }
  }, [metaReview]);

  const handleCopy = async () => {
    await copyToClipboard(prompt);
    setToast('✨ Đã copy prompt vào clipboard!');
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Meta-review header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(123,47,255,0.08), rgba(0,245,255,0.04))',
        border: '1px solid rgba(123,47,255,0.25)', borderRadius: 16, padding: '20px 24px',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#7b2fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          🔬 GIAI ĐOẠN 5 — META-REVIEW · AI TỰ ĐÁNH GIÁ
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
          {meta.summary}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* RTCE+I Checklist */}
        <div style={{
          background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: '20px',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            📐 Phân Tích Cấu Trúc
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {Object.entries(meta.checks).map(([key, ok]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 9,
                  background: ok ? 'rgba(0,245,255,0.05)' : 'rgba(255,50,50,0.05)',
                  border: `1px solid ${ok ? 'rgba(0,245,255,0.15)' : 'rgba(255,50,50,0.15)'}`,
                }}
              >
                <span style={{
                  fontSize: 14, width: 20, textAlign: 'center',
                  color: ok ? '#00f5ff' : '#ff4444',
                }}>
                  {ok ? '✅' : '⚠️'}
                </span>
                <span style={{ fontSize: 13, color: ok ? 'rgba(255,255,255,0.7)' : 'rgba(255,100,100,0.8)', fontWeight: 600 }}>
                  {COMPONENT_LABELS[key] ?? key}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: ok ? '#00f5ff' : '#ff6666' }}>
                  {ok ? 'Đủ cụ thể' : 'Cần bổ sung'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Framework comparison */}
        <div style={{
          background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: '20px',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            🎯 Frameworks Đang Áp Dụng
          </div>
          <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
            {meta.frameworks.map((fw, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 9,
                background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.12)',
              }}>
                <span style={{ fontSize: 11, color: '#00f5ff' }}>→</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{fw}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#00f5ff', fontWeight: 700 }}>✅</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            📚 Nguồn tham chiếu
          </div>
          {['OpenAI Cookbook', 'Anthropic Docs', 'LearnPrompting.org', 'PromptingGuide.ai'].map((src, i) => (
            <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>• {src}</div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div style={{
        background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.15)',
        borderRadius: 16, padding: '20px 24px',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          💡 Quy Tắc Nên Cân Nhắc Thêm
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {meta.suggestions.map((sug, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10,
              background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.1)',
            }}>
              <span style={{ color: '#ffd700', fontWeight: 800, fontSize: 13 }}>→</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{sug}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade decision */}
      <div style={{
        background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '20px 24px',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>
          💬 Bạn có muốn AI áp dụng thêm quy tắc đề xuất không?
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setWantsUpgrade(true); onUpgrade(); }}
            style={{
              flex: 1, minWidth: 160, padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 800,
              cursor: 'pointer',
              background: wantsUpgrade === true ? 'linear-gradient(135deg, #7b2fff, #00f5ff)' : 'rgba(123,47,255,0.15)',
              color: wantsUpgrade === true ? '#fff' : '#7b2fff',
              border: '1px solid rgba(123,47,255,0.4)',
              boxShadow: wantsUpgrade === true ? '0 4px 24px rgba(123,47,255,0.4)' : 'none',
              transition: 'all 0.3s',
            }}
          >
            ✨ Có, nâng cấp ngay
          </motion.button>
          <button
            onClick={() => setWantsUpgrade(false)}
            style={{
              flex: 1, minWidth: 160, padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 700,
              cursor: 'pointer',
              border: `1px solid ${wantsUpgrade === false ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
              background: wantsUpgrade === false ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: wantsUpgrade === false ? '#fff' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s',
            }}
          >
            🔒 Không, giữ bản này
          </button>
        </div>
        {wantsUpgrade === false && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}
          >
            ✅ Prompt đã được lưu. Bạn có thể copy bên dưới.
          </motion.div>
        )}
      </div>

      {/* Final action bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleCopy}
          className="btn-magnetic"
          style={{ flex: 1, padding: '14px', fontSize: 15, minWidth: 140 }}
        >
          📋 Copy Prompt
        </motion.button>
        <button
          onClick={onReset}
          className="btn-ghost"
          style={{ padding: '14px 22px', fontSize: 14 }}
        >
          ↩️ Tạo prompt mới
        </button>
      </div>

      {toast && (
        <div className="toast">{toast}</div>
      )}
    </div>
  );
}
