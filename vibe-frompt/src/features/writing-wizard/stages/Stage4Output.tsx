'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { copyToClipboard } from '@/lib/utils';

interface Stage4OutputProps {
  prompt: string;
  scores: { clarity: number; structure: number; creativity: number };
  onRegenerate: () => void;
  onContinue: () => void;
  onEdit: () => void;
  onReset: () => void;
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 300); return () => clearTimeout(t); }, [value]);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value}%</span>
      </div>
      <div className="score-bar">
        <div className="score-fill" style={{
          width: `${w}%`,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className="toast">{message}</div>;
}

export default function Stage4Output({ prompt, scores, onRegenerate, onContinue, onEdit, onReset }: Stage4OutputProps) {
  const [toast, setToast] = useState('');
  const avg = Math.round((scores.clarity + scores.structure + scores.creativity) / 3);

  const handleCopy = async () => {
    await copyToClipboard(prompt);
    setToast('✨ Đã copy VIBE Prompt vào clipboard!');
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,245,255,0.06), rgba(123,47,255,0.04))',
        border: '1px solid rgba(0,245,255,0.15)', borderRadius: 16, padding: '18px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#00f5ff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            ✅ GIAI ĐOẠN 4 — VIBE PROMPT ĐÃ SẴN SÀNG
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            Framework RTCE+I · Self-critique loop · Writing Intelligence v2.0
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>Quality Score</div>
          <div className="badge badge-gold" style={{ fontSize: 20, fontWeight: 900 }}>{avg}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) min(260px, 40%)', gap: 20, alignItems: 'start' }}>
        {/* Left: Prompt content */}
        <div>
          <div className="code-block" style={{ maxHeight: 420, overflowY: 'auto', fontSize: 13.5, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
            {prompt}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
            <span>{prompt.length} ký tự</span>
            <span>Copy và dán vào ChatGPT / Claude / Gemini</span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleCopy}
              className="btn-magnetic"
              style={{ flex: 1, padding: '13px', fontSize: 14, minWidth: 120 }}
            >
              📋 Copy Prompt
            </motion.button>
            <button
              onClick={onRegenerate}
              className="btn-ghost"
              style={{ padding: '13px 18px', fontSize: 14 }}
            >
              🔄 Tạo lại
            </button>
            <button
              onClick={onEdit}
              className="btn-ghost"
              style={{ padding: '13px 18px', fontSize: 14 }}
            >
              ✏️ Chỉnh sửa
            </button>
          </div>
        </div>

        {/* Right: Scores + actions */}
        <div style={{ display: 'grid', gap: 14 }}>
          {/* Score meter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)',
              borderRadius: 16, padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>🏆</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#ffd700' }}>Prompt Score</span>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <ScoreBar label="Clarity" value={scores.clarity} color="#00f5ff" />
              <ScoreBar label="Structure" value={scores.structure} color="#7b2fff" />
              <ScoreBar label="Creativity" value={scores.creativity} color="#ff00cc" />
            </div>
          </motion.div>

          {/* Meta-review CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onContinue}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, fontSize: 13, fontWeight: 800,
              cursor: 'pointer', border: '1px solid rgba(123,47,255,0.4)',
              background: 'rgba(123,47,255,0.12)', color: '#7b2fff',
              boxShadow: '0 0 20px rgba(123,47,255,0.15)',
              transition: 'all 0.2s',
            }}
          >
            🔬 Xem Meta-Review →
          </motion.button>

          {/* Tip */}
          <div style={{
            padding: '12px', background: 'rgba(0,245,255,0.04)',
            border: '1px solid rgba(0,245,255,0.1)', borderRadius: 10,
            fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6,
          }}>
            💡 <strong style={{ color: '#00f5ff' }}>Tip:</strong> Dán prompt vào ChatGPT / Claude / Gemini để nhận kết quả viết lách ngay lập tức.
          </div>

          {/* Reset */}
          <button
            onClick={onReset}
            style={{
              padding: '10px', borderRadius: 10, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', border: '1px solid rgba(255,255,255,0.07)',
              background: 'transparent', color: 'rgba(255,255,255,0.3)',
              transition: 'all 0.2s',
            }}
          >
            ↩️ Bắt đầu lại
          </button>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}
