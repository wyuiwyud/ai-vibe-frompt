'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Direction } from '../WritingWizard';

// ─── Types ────────────────────────────────────────────────────
interface TermToVerify {
  term: string;
  assumed_meaning: string;
  why_might_be_wrong: string;
  needs_web_search: boolean;
}
interface ResearchResult {
  term: string;
  what_i_assumed: string;
  what_is_actually_true: string;
  source: string;
  understanding_was_correct: boolean;
  what_changed: string;
  why_user_likely_used_this_term: string;
}
interface ClarifyOption {
  option_id: string;
  label: string;
  what_this_means: string;
  grounded_in: string;
}
interface ClarifyData {
  step_a?: {
    label: string;
    preliminary_answer: {
      title: string;
      outline: string[];
      current_understanding: string;
      confidence: string;
    };
  };
  step_b?: { terms_to_verify: TermToVerify[] };
  step_c?: { research_results: ResearchResult[] };
  step_d?: {
    has_corrections: boolean;
    options: ClarifyOption[];
    ready_for_phase5: boolean;
  };
}
interface ConfirmData {
  step: string;
  confirmed_understanding: string;
  refined_answer: {
    title: string;
    outline: string[];
    delta_from_step_A: string;
    confidence: string;
  };
  confirmed_signals?: {
    format_confirmed: string;
    audience_confirmed: string;
    unique_angle: string;
  };
  ready_for_phase5: boolean;
}

interface Stage3ClarifyProps {
  rawInput: string;
  direction: Direction;
  language?: string;
  onGenerate: (purpose: string, keywords: string, confirmedContext?: string) => void;
  onBack: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────
const PURPOSES = [
  { id: 'SEO & Traffic', label: '🔍 SEO & Traffic', color: '#00f5ff' },
  { id: 'Viral / Engagement', label: '🔥 Viral / Engagement', color: '#ff6633' },
  { id: 'Brand Authority', label: '🏆 Brand Authority', color: '#ffd700' },
  { id: 'Chuyển đổi (Sales/Lead)', label: '💰 Sales & Lead', color: '#7b2fff' },
];

const OPTION_COLORS = ['#00f5ff', '#7b2fff', '#ff00cc', '#ffd700'];

// Step indicator pill
function StepBadge({ step, label, done, active }: { step: string; label: string; done: boolean; active: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '5px 12px', borderRadius: 50,
      background: done ? 'rgba(0,245,255,0.1)' : active ? 'rgba(123,47,255,0.12)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${done ? '#00f5ff44' : active ? '#7b2fff55' : 'rgba(255,255,255,0.08)'}`,
      fontSize: 11, fontWeight: 700,
      color: done ? '#00f5ff' : active ? '#7b2fff' : 'rgba(255,255,255,0.28)',
      transition: 'all 0.4s',
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
        background: done ? '#00f5ff' : active ? '#7b2fff' : 'rgba(255,255,255,0.2)',
        boxShadow: active ? '0 0 6px #7b2fff' : done ? '0 0 6px #00f5ff' : 'none',
      }} />
      {step}: {label}
    </div>
  );
}

// Spinner
function Spinner({ color = '#7b2fff' }: { color?: string }) {
  return (
    <div style={{
      width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
      border: `2px solid ${color}33`,
      borderTop: `2px solid ${color}`,
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}

export default function Stage3Clarify({ rawInput, direction, language = 'vi', onGenerate, onBack }: Stage3ClarifyProps) {
  // Verification state
  const [verifyState, setVerifyState] = useState<'idle' | 'loading' | 'done' | 'confirming' | 'confirmed'>('idle');
  const [clarifyData, setClarifyData] = useState<ClarifyData | null>(null);
  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  // User inputs (shown after verification is done)
  const [purpose, setPurpose] = useState('Brand Authority');
  const [keywords, setKeywords] = useState('');
  const [readyForGenerate, setReadyForGenerate] = useState(false);

  // Auto-run verification on mount
  const runVerification = useCallback(async () => {
    setVerifyState('loading');
    try {
      const res = await fetch('/api/write-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clarify',
          rawInput,
          direction,
          purpose,
          keywords,
          language,
        }),
      });
      const data = await res.json() as ClarifyData;
      setClarifyData(data);
      setVerifyState('done');
      // If no corrections needed, go straight to ready
      if (data.step_d?.ready_for_phase5 || (data.step_d && !data.step_d.has_corrections && data.step_d.options.length === 0)) {
        setReadyForGenerate(true);
      }
    } catch (e) {
      console.error('[Stage3] clarify error', e);
      setVerifyState('done');
      setReadyForGenerate(true);
    }
  }, [rawInput, direction, purpose, keywords, language]);

  useEffect(() => { runVerification(); }, []);  // eslint-disable-line

  // Step E: run after user picks an option
  const handleOptionSelect = async (option: ClarifyOption) => {
    setSelectedOption(option.option_id);
    setVerifyState('confirming');
    try {
      const res = await fetch('/api/write-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clarify_confirm',
          rawInput,
          direction,
          language,
          chosenOptionId: option.option_id,
          chosenOptionLabel: option.label,
          clarifyContext: JSON.stringify(clarifyData),
        }),
      });
      const data = await res.json() as ConfirmData;
      setConfirmData(data);
      setVerifyState('confirmed');
      if (data.ready_for_phase5) setReadyForGenerate(true);
    } catch (e) {
      console.error('[Stage3] clarify_confirm error', e);
      setVerifyState('confirmed');
      setReadyForGenerate(true);
    }
  };

  const currentStep = verifyState === 'idle' || verifyState === 'loading' ? 'A-D' :
    verifyState === 'confirming' ? 'E' : verifyState === 'confirmed' ? '✓' : 'D';

  return (
    <div style={{ display: 'grid', gap: 16 }}>

      {/* ── Step progress bar ── */}
      <div style={{
        background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, padding: '14px 18px',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          🔍 GIAI ĐOẠN 3 — TỰ XÁC MINH TRƯỚC KHI TẠO PROMPT
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <StepBadge step="A" label="Phản hồi ban đầu" done={verifyState !== 'idle' && verifyState !== 'loading'} active={verifyState === 'loading'} />
          <StepBadge step="B" label="Tự nghi ngờ" done={verifyState !== 'idle' && verifyState !== 'loading'} active={verifyState === 'loading'} />
          <StepBadge step="C" label="Xác minh" done={verifyState !== 'idle' && verifyState !== 'loading'} active={verifyState === 'loading'} />
          <StepBadge step="D" label="Gợi ý" done={verifyState === 'confirming' || verifyState === 'confirmed'} active={verifyState === 'done'} />
          <StepBadge step="E" label="Câu trả lời cuối" done={verifyState === 'confirmed'} active={verifyState === 'confirming'} />
        </div>
      </div>

      {/* ── Loading state (Steps A→B→C running) ── */}
      <AnimatePresence mode="wait">
        {verifyState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              background: 'rgba(123,47,255,0.06)', border: '1px solid rgba(123,47,255,0.2)',
              borderRadius: 16, padding: '24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            }}
          >
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              {['A', 'B', 'C', 'D'].map((s, i) => (
                <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(123,47,255,0.15)',
                      border: '1.5px solid rgba(123,47,255,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, color: '#7b2fff',
                    }}
                  >
                    {s}
                  </motion.div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                    {['Trả lời', 'Nghi ngờ', 'Kiểm tra', 'Gợi ý'][i]}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Spinner />
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                AI đang tự kiểm tra xem có hiểu đúng ý bạn không...
              </div>
            </div>
            {/* Animated progress bar */}
            <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg, transparent, #7b2fff, #00f5ff, transparent)', borderRadius: 2 }}
              />
            </div>
          </motion.div>
        )}

        {/* ── Results: Steps A + B + C displayed, Step D options ── */}
        {(verifyState === 'done' || verifyState === 'confirming' || verifyState === 'confirmed') && clarifyData && (
          <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gap: 12 }}>

            {/* Step A: Preliminary answer */}
            {clarifyData.step_a && (
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: '16px 18px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 50, fontSize: 10, fontWeight: 700,
                    background: 'rgba(255,165,0,0.12)', color: '#ffa500', border: '1px solid rgba(255,165,0,0.25)',
                  }}>
                    ⚡ Bước A — {clarifyData.step_a.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Confidence: {clarifyData.step_a.preliminary_answer.confidence}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                  "{clarifyData.step_a.preliminary_answer.title}"
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, lineHeight: 1.5 }}>
                  🧠 AI hiểu: {clarifyData.step_a.preliminary_answer.current_understanding}
                </div>
                {clarifyData.step_a.preliminary_answer.outline.length > 0 && (
                  <div style={{ display: 'grid', gap: 4 }}>
                    {clarifyData.step_a.preliminary_answer.outline.map((item, i) => (
                      <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingLeft: 12, borderLeft: '2px solid rgba(255,165,0,0.25)' }}>
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step B: Terms flagged */}
            {clarifyData.step_b && clarifyData.step_b.terms_to_verify.length > 0 && (
              <div style={{
                background: 'rgba(255,50,50,0.04)', border: '1px solid rgba(255,50,50,0.15)',
                borderRadius: 14, padding: '14px 18px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 50, fontSize: 10, fontWeight: 700,
                    background: 'rgba(255,50,50,0.1)', color: '#ff5555', border: '1px solid rgba(255,50,50,0.25)',
                  }}>
                    🤔 Bước B — Tự nghi ngờ
                  </span>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {clarifyData.step_b.terms_to_verify.map((t, i) => (
                    <div key={i}>
                      <button
                        onClick={() => setExpandedTerm(expandedTerm === t.term ? null : t.term)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', textAlign: 'left',
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#ff5555' }}>"{t.term}"</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>— {t.assumed_meaning.slice(0, 50)}...</span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>{expandedTerm === t.term ? '▲' : '▼'}</span>
                      </button>
                      <AnimatePresence>
                        {expandedTerm === t.term && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 6, paddingLeft: 12, lineHeight: 1.6 }}>
                              ⚠️ {t.why_might_be_wrong}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step C: Research results */}
            {clarifyData.step_c && clarifyData.step_c.research_results.length > 0 && (
              <div style={{
                background: 'rgba(0,245,255,0.03)', border: '1px solid rgba(0,245,255,0.12)',
                borderRadius: 14, padding: '14px 18px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 50, fontSize: 10, fontWeight: 700,
                    background: 'rgba(0,245,255,0.08)', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.2)',
                  }}>
                    🔬 Bước C — Kết quả xác minh
                  </span>
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {clarifyData.step_c.research_results.map((r, i) => (
                    <div key={i} style={{
                      padding: '10px 12px', borderRadius: 10,
                      background: r.understanding_was_correct ? 'rgba(0,255,100,0.05)' : 'rgba(255,100,0,0.06)',
                      border: `1px solid ${r.understanding_was_correct ? 'rgba(0,255,100,0.15)' : 'rgba(255,100,0,0.2)'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 12 }}>{r.understanding_was_correct ? '✅' : '❌'}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: r.understanding_was_correct ? '#00ff64' : '#ff6433' }}>
                          "{r.term}"
                        </span>
                      </div>
                      {!r.understanding_was_correct && (
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                          <span style={{ color: 'rgba(255,255,255,0.35)' }}>Thực tế: </span>
                          {r.what_is_actually_true}
                          {r.what_changed && (
                            <div style={{ marginTop: 4, color: 'rgba(255,150,50,0.8)' }}>→ {r.what_changed}</div>
                          )}
                        </div>
                      )}
                      {r.understanding_was_correct && (
                        <div style={{ fontSize: 11, color: 'rgba(0,255,100,0.6)' }}>
                          {r.why_user_likely_used_this_term}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step D: Clickable options (only if has_corrections) */}
            {clarifyData.step_d && clarifyData.step_d.options.length > 0 && verifyState !== 'confirming' && verifyState !== 'confirmed' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.2)',
                  borderRadius: 16, padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 50, fontSize: 10, fontWeight: 700,
                    background: 'rgba(255,215,0,0.1)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.25)',
                  }}>
                    💡 Bước D — AI phát hiện điều bạn thực sự muốn
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 14, lineHeight: 1.6 }}>
                  AI đã xác minh và phát hiện sự khác biệt quan trọng. <strong style={{ color: 'rgba(255,215,0,0.8)' }}>Bạn đang muốn tạo loại nội dung nào?</strong> Chọn một trong các hướng sau:
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {clarifyData.step_d.options.map((opt, i) => {
                    const color = OPTION_COLORS[i % OPTION_COLORS.length];
                    return (
                      <motion.button
                        key={opt.option_id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOptionSelect(opt)}
                        style={{
                          background: `${color}08`, border: `1px solid ${color}30`,
                          borderRadius: 12, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: 50, fontSize: 10, fontWeight: 800,
                            background: `${color}18`, color, border: `1px solid ${color}33`,
                          }}>
                            {opt.option_id}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color }}>{opt.label}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 4 }}>
                          → {opt.what_this_means}
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                          📎 Dựa trên: {opt.grounded_in}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step E confirming spinner */}
            {verifyState === 'confirming' && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{
                  background: 'rgba(123,47,255,0.06)', border: '1px solid rgba(123,47,255,0.2)',
                  borderRadius: 14, padding: '20px', display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <Spinner color="#7b2fff" />
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                  <strong style={{ color: '#7b2fff' }}>Bước E:</strong> AI đang tinh chỉnh câu trả lời dựa trên lựa chọn của bạn...
                </div>
              </motion.div>
            )}

            {/* Step E: confirmed refined answer */}
            {verifyState === 'confirmed' && confirmData && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(0,255,100,0.04)', border: '1px solid rgba(0,255,100,0.2)',
                  borderRadius: 16, padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 50, fontSize: 10, fontWeight: 700,
                    background: 'rgba(0,255,100,0.1)', color: '#00ff64', border: '1px solid rgba(0,255,100,0.25)',
                  }}>
                    ✅ Bước E — Câu trả lời đã tinh chỉnh ({confirmData.refined_answer.confidence})
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                  "{confirmData.refined_answer.title}"
                </div>
                <div style={{ fontSize: 11, color: 'rgba(0,255,100,0.65)', marginBottom: 10 }}>
                  🎯 {confirmData.confirmed_understanding}
                </div>
                <div style={{ display: 'grid', gap: 5, marginBottom: 10 }}>
                  {confirmData.refined_answer.outline.map((item, i) => (
                    <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', paddingLeft: 12, borderLeft: '2px solid rgba(0,255,100,0.3)' }}>
                      {item}
                    </div>
                  ))}
                </div>
                {confirmData.refined_answer.delta_from_step_A && (
                  <div style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.35)', padding: '8px 12px',
                    background: 'rgba(255,255,255,0.03)', borderRadius: 8, lineHeight: 1.5,
                  }}>
                    📊 So với bảnA: {confirmData.refined_answer.delta_from_step_A}
                  </div>
                )}
              </motion.div>
            )}

            {/* No corrections case — ready directly */}
            {clarifyData.step_d?.ready_for_phase5 && !clarifyData.step_d.has_corrections && clarifyData.step_d.options.length === 0 && (
              <div style={{
                background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.15)',
                borderRadius: 12, padding: '12px 16px', fontSize: 12, color: '#00f5ff',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                ✅ AI xác minh: hiểu đúng hoàn toàn ý tưởng gốc — không cần làm rõ thêm.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Purpose + Keywords (shown when ready) ── */}
      <AnimatePresence>
        {readyForGenerate && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18, padding: '22px 24px',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 18 }}>
              ✨ Sẵn sàng tạo prompt! Thêm 2 thông tin cuối:
            </div>

            {/* Purpose */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: '#00f5ff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
              }}>
                Mục tiêu tối ưu
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {PURPOSES.map(p => (
                  <motion.button
                    key={p.id}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setPurpose(p.id)}
                    style={{
                      padding: '10px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', textAlign: 'left',
                      border: `1px solid ${purpose === p.id ? p.color : 'rgba(255,255,255,0.07)'}`,
                      background: purpose === p.id ? `${p.color}10` : 'rgba(255,255,255,0.02)',
                      color: purpose === p.id ? p.color : 'rgba(255,255,255,0.4)',
                      boxShadow: purpose === p.id ? `0 0 14px ${p.color}20` : 'none',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: 7,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: purpose === p.id ? p.color : 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                    {p.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: '#7b2fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
              }}>
                Từ khoá / thương hiệu <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>(tuỳ chọn)</span>
              </label>
              <input
                className="input-cyber"
                type="text"
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                placeholder='VD: "AI thay thế lao động", "tương lai việc làm", @brand...'
                style={{ fontSize: 13 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Action buttons ── */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onBack}
          style={{
            padding: '14px 22px', borderRadius: 12, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)',
            transition: 'all 0.2s',
          }}
        >
          ← Quay lại
        </button>
        <motion.button
          whileHover={{ scale: readyForGenerate ? 1.02 : 1 }}
          whileTap={{ scale: readyForGenerate ? 0.97 : 1 }}
          onClick={() => {
            if (readyForGenerate) {
              const ctx = confirmData ? JSON.stringify(confirmData) : JSON.stringify(clarifyData ?? {});
              onGenerate(purpose, keywords, ctx);
            }
          }}
          disabled={!readyForGenerate}
          style={{
            flex: 1, padding: '16px', borderRadius: 12, fontSize: 15, fontWeight: 800,
            cursor: readyForGenerate ? 'pointer' : 'not-allowed', border: 'none',
            background: readyForGenerate ? 'linear-gradient(135deg, #7b2fff, #00f5ff)' : 'rgba(255,255,255,0.05)',
            color: readyForGenerate ? '#fff' : 'rgba(255,255,255,0.2)',
            boxShadow: readyForGenerate ? '0 4px 28px rgba(123,47,255,0.45)' : 'none',
            transition: 'all 0.35s',
          }}
        >
          {readyForGenerate ? '🚀 Tạo VIBE Prompt →' : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Spinner color="rgba(255,255,255,0.2)" />
              AI đang xác minh...
            </span>
          )}
        </motion.button>
      </div>

      {/* Inline spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
