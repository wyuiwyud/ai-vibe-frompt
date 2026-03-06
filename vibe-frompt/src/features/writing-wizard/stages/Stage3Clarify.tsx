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
interface MicroLens {
  label: string;
  description: string;
  is_trend: boolean;
  technical_constraints: string[];
}
interface ResearchResult {
  term: string;
  micro_lenses: MicroLens[];
  source: string;
  user_selected_lens_index?: number;
  user_manual_override?: string;
}
interface ClarifyOption {
  option_id: string;
  label: string;
  what_this_means: string;
  grounded_in: string;
  identity?: string;
  blueprint?: string;
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
    community_pattern?: string;
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
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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
  { id: 'SEO & Traffic', label: '🔍 SEO & Tìm kiếm', color: '#00f5ff' },
  { id: 'Viral / Tương tác', label: '🔥 Viral / Tương tác', color: '#ff6633' },
  { id: 'Uy tín thương hiệu', label: '🏆 Uy tín thương hiệu', color: '#ffd700' },
  { id: 'Chuyển đổi (Sales/Lead)', label: '💰 Chuyển đổi (Sales)', color: '#7b2fff' },
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
  const [purpose, setPurpose] = useState('Uy tín thương hiệu');
  const [keywords, setKeywords] = useState('');
  const [readyForGenerate, setReadyForGenerate] = useState(false);

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userMsg, setUserMsg] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Micro-Discovery State
  const [selectedLenses, setSelectedLenses] = useState<Record<string, number>>({});
  const [manualOverrides, setManualOverrides] = useState<Record<string, string>>({});
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [reanalysisStatus, setReanalysisStatus] = useState('');

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
    if (!clarifyData) return;
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
          clarifyContext: JSON.stringify({
            ...clarifyData,
            step_c: {
              ...clarifyData.step_c,
              research_results: (clarifyData.step_c?.research_results || []).map(r => ({
                ...r,
                user_selected_lens_index: selectedLenses[r.term] ?? 0,
                user_manual_override: manualOverrides[r.term] || undefined
              }))
            }
          }),
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

  const handleSendMessage = async () => {
    if (!userMsg.trim() || isChatLoading) return;
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: userMsg }];
    setChatHistory(newHistory);
    setUserMsg('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/write-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clarify_chat',
          rawInput,
          clarifyContext: JSON.stringify(clarifyData),
          chatHistory: newHistory,
          userMessage: userMsg,
          language,
        }),
      });
      const data = await res.json();
      setChatHistory([...newHistory, { role: 'assistant', content: data.assistant_response }]);
    } catch (e) {
      console.error('[Stage3] chat error', e);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleManualReverify = async () => {
    if (isReanalyzing) return;
    setIsReanalyzing(true);
    setReanalysisStatus('AI đang hiệu chỉnh dữ liệu theo lệnh của bạn...');
    
    // Combine overrides into a single string for prompt injection
    const overrides = Object.entries(manualOverrides)
      .filter(([_, val]) => val.trim().length > 0)
      .map(([key, val]) => `${key}: ${val}`)
      .join('; ');

    try {
      const res = await fetch('/api/write-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clarify_reanalysis',
          rawInput,
          direction,
          purpose,
          keywords,
          language,
          userOverrides: overrides
        }),
      });
      const data = await res.json() as ClarifyData;
      setClarifyData(prev => ({
        ...prev,
        ...data,
        // Preserve B and C if possible, but D must be updated
        step_d: data.step_d
      }));
      setVerifyState('done');
    } catch (e) {
      console.error('[Stage3] reanalysis error', e);
    } finally {
      setIsReanalyzing(false);
      setReanalysisStatus('');
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
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Độ tin cậy: {clarifyData.step_a.preliminary_answer.confidence}</span>
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

            {/* Step C: Micro-Discovery results */}
            {clarifyData.step_c && clarifyData.step_c.research_results.length > 0 && (
              <div style={{
                background: 'rgba(0,245,255,0.03)', border: '1px solid rgba(0,245,255,0.12)',
                borderRadius: 14, padding: '14px 18px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 50, fontSize: 10, fontWeight: 700,
                    background: 'rgba(0,245,255,0.08)', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.2)',
                  }}>
                    🔬 Bước C — Khám phá Vi mô (Micro-Discovery)
                  </span>
                </div>
                
                <div style={{ display: 'grid', gap: 16 }}>
                  {clarifyData.step_c.research_results.map((res, i) => (
                    <motion.div
                      key={i}
                      style={{
                        padding: '16px', borderRadius: 16, background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00f5ff', boxShadow: '0 0 10px #00f5ff' }} />
                        <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          TỪ KHOÁ: "{res.term}"
                        </span>
                      </div>

                      {/* --- Multi-Lens Selector --- */}
                      <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
                        {(res.micro_lenses || []).map((lens, idx) => {
                          const isSelected = (selectedLenses[res.term] ?? 0) === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedLenses(prev => ({ ...prev, [res.term]: idx }))}
                              style={{
                                textAlign: 'left', padding: '12px', borderRadius: 12, cursor: 'pointer',
                                background: isSelected ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${isSelected ? '#00f5ff' : 'rgba(255,255,255,0.05)'}`,
                                transition: 'all 0.2s ease', position: 'relative'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: isSelected ? '#00f5ff' : '#fff' }}>{lens.label}</span>
                                {lens.is_trend && (
                                  <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 6, background: '#ff3366', color: '#fff', fontWeight: 900 }}>TRENDING</span>
                                )}
                              </div>
                              <div style={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>
                                {lens.description}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* --- Manual Override --- */}
                      <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(0,0,0,0.25)', border: '1px dashed rgba(0,245,255,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(0,245,255,0.6)', textTransform: 'uppercase' }}>
                            CAN THIỆP THỦ CÔNG:
                          </span>
                        </div>
                        <input
                          value={manualOverrides[res.term] || ''}
                          onChange={(e) => setManualOverrides(prev => ({ ...prev, [res.term]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleManualReverify()}
                          placeholder="Nhấn Enter để AI phân tích lại..."
                          style={{
                            width: '100%', background: 'transparent', border: 'none', color: '#00f5ff',
                            fontSize: 11, outline: 'none', fontStyle: 'italic'
                          }}
                        />
                      </div>

                      <div style={{ marginTop: 12, fontSize: 8, color: 'rgba(255,255,255,0.15)', fontWeight: 600, textAlign: 'right', textTransform: 'uppercase' }}>
                        NGUỒN: {res.source}
                      </div>
                    </motion.div>
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
                  borderRadius: 16, padding: '18px 20px', position: 'relative'
                }}
              >
                {isReanalyzing && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', 
                    backdropFilter: 'blur(4px)', borderRadius: 16, zIndex: 10,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12
                  }}>
                    <Spinner color="#ffd700" />
                    <span style={{ fontSize: 11, color: '#ffd700', fontWeight: 700 }}>{reanalysisStatus}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 50, fontSize: 10, fontWeight: 700,
                    background: 'rgba(255,215,0,0.1)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.25)',
                  }}>
                    💡 Bước D — AI phát hiện điều bạn thực sự muốn
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 14, lineHeight: 1.6 }}>
                  AI đã truy quét kho dữ liệu cộng đồng và phát hiện sự khác biệt quan trọng. <strong style={{ color: 'rgba(255,215,0,0.8)' }}>Bạn đang muốn tạo loại nội dung nào?</strong>
                </div>

                {clarifyData.step_d.community_pattern && (
                  <div style={{ 
                    marginBottom: 16, padding: '12px', background: 'rgba(0,245,255,0.08)', 
                    border: '1px solid rgba(0,245,255,0.2)', borderRadius: 12,
                    display: 'flex', alignItems: 'center', gap: 10
                  }}>
                    <span style={{ fontSize: 18 }}>💡</span>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 900, color: '#00f5ff', textTransform: 'uppercase' }}>ĐỀ XUẤT CẤU TRÚC TỪ CỘNG ĐỒNG:</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{clarifyData.step_d.community_pattern}</div>
                    </div>
                  </div>
                )}
                <div style={{ display: 'grid', gap: 14 }}>
                  {clarifyData.step_d.options.map((opt, i) => {
                    const color = OPTION_COLORS[i % OPTION_COLORS.length];
                    return (
                      <motion.button
                        key={opt.option_id}
                        whileHover={{ scale: 1.01, x: 5 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleOptionSelect(opt)}
                        style={{
                          textAlign: 'left', padding: '20px', borderRadius: 16,
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                          position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s ease',
                          display: 'flex', flexDirection: 'column', gap: 12
                        }}
                      >
                        {/* Selected Scenario Indicator */}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: color }} />
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {opt.label}
                          </span>
                          <span style={{ 
                            padding: '4px 10px', borderRadius: 20, background: `${color}11`, 
                            border: `1px solid ${color}33`, color: color, fontSize: 10, fontWeight: 800 
                          }}>
                            LĂNG KÍNH #{i + 1}
                          </span>
                        </div>

                        {/* Expert Identity */}
                        {opt.identity && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ fontSize: 16 }}>👤</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                              Dưới danh nghĩa: {opt.identity}
                            </div>
                          </div>
                        )}

                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, paddingLeft: 24 }}>
                          {opt.what_this_means}
                        </div>

                        {/* Blueprint Info */}
                        {opt.blueprint && (
                          <div style={{ 
                            marginTop: 4, padding: '10px 14px', borderRadius: 12, 
                            background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)',
                            display: 'flex', alignItems: 'center', gap: 10
                          }}>
                            <div style={{ width: 6, height: 6, background: color, borderRadius: '50%' }} />
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                              Cấu trúc sử dụng: <span style={{ color: '#fff' }}>{opt.blueprint}</span>
                            </div>
                          </div>
                        )}

                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600, textTransform: 'uppercase', paddingLeft: 24, marginTop: 4 }}>
                          Dựa trên: {opt.grounded_in}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* --- CHATBOT ASSISTANT INTEGRATION --- */}
                <div style={{ marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #7b2fff, #00f5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💬</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Hỏi đáp trực tiếp với trợ lý AI</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Cần giải thích thêm về lăng kính hoặc quy tắc?</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsChatOpen(!isChatOpen)}
                      style={{ 
                        padding: '6px 14px', borderRadius: 50, background: isChatOpen ? 'rgba(255,255,255,0.05)' : 'rgba(0,245,255,0.1)', 
                        border: '1px solid rgba(0,245,255,0.3)', color: '#00f5ff', fontSize: 10, fontWeight: 800, cursor: 'pointer' 
                      }}
                    >
                      {isChatOpen ? 'THU GỌN' : 'MỞ CHAT'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {isChatOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ 
                          maxHeight: 300, overflowY: 'auto', padding: '16px', 
                          background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)',
                          display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12
                        }}>
                          {chatHistory.length === 0 && (
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                              Bạn có thể yêu cầu AI giải thích về quy định tô phiếu 2025 hoặc đề xuất cấu trúc prompt phù hợp nhất...
                            </div>
                          )}
                          {chatHistory.map((msg, i) => (
                            <div key={i} style={{ 
                              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                              maxWidth: '85%', padding: '10px 14px', borderRadius: 14,
                              background: msg.role === 'user' ? '#7b2fff22' : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${msg.role === 'user' ? '#7b2fff44' : 'rgba(255,255,255,0.1)'}`,
                              color: msg.role === 'user' ? '#fff' : 'rgba(255,255,255,0.9)',
                              fontSize: 12, lineHeight: 1.5
                            }}>
                              {msg.content}
                            </div>
                          ))}
                          {isChatLoading && (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingLeft: 4 }}>
                              <Spinner color="#00f5ff" />
                              <div style={{ fontSize: 10, color: '#00f5ff', fontWeight: 600 }}>AI ĐANG SUY NGHĨ...</div>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                          <input 
                            value={userMsg}
                            onChange={(e) => setUserMsg(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Hỏi AI về các quy định hoặc lăng kính..."
                            style={{ 
                              flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#fff', outline: 'none'
                            }}
                          />
                          <button 
                            onClick={handleSendMessage}
                            disabled={isChatLoading || !userMsg.trim()}
                            style={{ 
                              padding: '0 20px', borderRadius: 12, background: 'linear-gradient(135deg, #7b2fff, #00f5ff)', 
                              border: 'none', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer',
                              opacity: (isChatLoading || !userMsg.trim()) ? 0.5 : 1
                            }}
                          >
                            GỬI
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
              // Merge results from Step C (micro-discovery) with Step E (confirm) if they exist
              const researchResults = clarifyData?.step_c?.research_results || [];
              const hiddenStandards: string[] = [];
              const allConstraints: string[] = [];

              researchResults.forEach(r => {
                if (manualOverrides[r.term]) {
                  allConstraints.push(`[OVERRIDE for ${r.term}]: ${manualOverrides[r.term]}`);
                } else {
                  const lensIndex = selectedLenses[r.term] ?? 0;
                  const lens = r.micro_lenses[lensIndex];
                  if (lens) {
                    hiddenStandards.push(`${r.term}: ${lens.description}`);
                    if (lens.technical_constraints) allConstraints.push(...lens.technical_constraints);
                  }
                }
              });

              const baseCtx = confirmData ? { ...confirmData } : { ...clarifyData };
              const mergedCtx = {
                ...baseCtx,
                hidden_standards: hiddenStandards,
                technical_constraints: allConstraints,
              };
              
              onGenerate(purpose, keywords, JSON.stringify(mergedCtx));
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
