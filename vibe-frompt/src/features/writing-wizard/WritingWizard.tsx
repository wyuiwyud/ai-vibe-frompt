'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Stage1Input from './stages/Stage1Input';
import Stage2Analysis from './stages/Stage2Analysis';
import Stage3Clarify from './stages/Stage3Clarify';
import Stage4Output from './stages/Stage4Output';
import Stage5Review from './stages/Stage5Review';

// ─── Types shared across wizard stages ───────────────────────
export interface Direction {
  id?: string;
  label: string;
  name: string;
  full_topic?: string;
  why_this_direction?: string;
  content_type?: string;
  relevance_score?: number;
  audience_fit?: string;
  description: string;
  match: number;
  type: string;
}

export interface WizardState {
  rawInput: string;
  directions: Direction[];
  detectedSignals: { format: string|null; level: string|null; domain: string; audience: string; hidden_standards?: string[] } | null;
  webTrendsSummary: string;
  chosenDirection: Direction | null;
  purpose: string;
  keywords: string;
  language: string;
  generatedPrompt: string;
  metaReview: string;
  scores: { clarity: number; structure: number; creativity: number };
}

type Stage = 1 | 2 | 3 | 4 | 5;

const STAGE_LABELS = ['Nhập liệu', 'Phân tích', 'Làm rõ', 'Kết quả', 'Đánh giá'];

function StageProgress({ current }: { current: Stage }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
      {STAGE_LABELS.map((label, i) => {
        const stageNum = (i + 1) as Stage;
        const isActive = stageNum === current;
        const isDone = stageNum < current;
        const color = isDone ? '#00f5ff' : isActive ? '#7b2fff' : 'rgba(255,255,255,0.15)';
        return (
          <div key={stageNum} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1 }}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: isDone ? '#00f5ff22' : isActive ? '#7b2fff22' : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  color: isDone ? '#00f5ff' : isActive ? '#7b2fff' : 'rgba(255,255,255,0.3)',
                  boxShadow: isActive ? '0 0 16px #7b2fff66' : 'none',
                  transition: 'all 0.3s',
                }}
              >
                {isDone ? '✓' : stageNum}
              </motion.div>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
                color: isActive ? '#7b2fff' : isDone ? '#00f5ff' : 'rgba(255,255,255,0.25)',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </div>
            {i < STAGE_LABELS.length - 1 && (
              <div style={{
                width: 40, height: 1, marginBottom: 20,
                background: isDone ? 'linear-gradient(90deg, #00f5ff, #7b2fff)' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.5s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const INITIAL_STATE: WizardState = {
  rawInput: '',
  directions: [],
  detectedSignals: null,
  webTrendsSummary: '',
  chosenDirection: null,
  purpose: '',
  keywords: '',
  language: 'vi',
  generatedPrompt: '',
  metaReview: '',
  scores: { clarity: 0, structure: 0, creativity: 0 },
};

export default function WritingWizard() {
  const [stage, setStage] = useState<Stage>(1);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);

  const updateState = (partial: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...partial }));
  };

  const handleReset = () => {
    setStage(1);
    setState(INITIAL_STATE);
  };

  // Stage 1 → 2: Analyze raw input
  const handleAnalyze = async (rawInput: string, language: string) => {
    setLoading(true);
    updateState({ rawInput, language });
    try {
      const res = await fetch('/api/write-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Bug #2 fix: pass language so AI can tailor direction descriptions
        body: JSON.stringify({ action: 'analyze', rawInput, language }),
      });
      const data = await res.json() as {
        directions: Direction[];
        detected_signals?: { format: string|null; level: string|null; domain: string; audience: string };
        web_trends_summary?: string;
        original_idea_preserved?: string;
      };
      updateState({
        directions: data.directions || [],
        detectedSignals: data.detected_signals ?? null,
        webTrendsSummary: data.web_trends_summary ?? '',
      });
      setStage(2);
    } catch (e) {
      console.error('[WritingWizard] analyze error', e);
    } finally {
      setLoading(false);
    }
  };

  // Stage 2 → 3: Choose direction
  const handleChooseDirection = (direction: Direction) => {
    updateState({ chosenDirection: direction });
    setStage(3);
  };

  // Stage 3 → 4: Generate prompt
  // Bug #3 fix: accept confirmedContext from Stage3 self-verification pipeline
  const handleGenerate = async (purpose: string, keywords: string, confirmedContext?: string) => {
    if (!state.chosenDirection) return;
    setLoading(true);
    updateState({ purpose, keywords });
    try {
      const res = await fetch('/api/write-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          rawInput: state.rawInput,
          direction: state.chosenDirection,
          purpose,
          keywords,
          language: state.language,
          // Pass Stage3's self-verification results to enrich Phase 4 prompt generation
          ...(confirmedContext ? { clarifyContext: confirmedContext } : {}),
        }),
      });
      const data = await res.json() as {
        prompt: string;
        metaReview: string;
        scores: { clarity: number; structure: number; creativity: number };
      };
      updateState({
        generatedPrompt: data.prompt,
        metaReview: data.metaReview,
        scores: data.scores,
      });
      setStage(4);
    } catch (e) {
      console.error('[WritingWizard] generate error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="form-section" style={{ padding: '40px 0 100px' }}>
      <div className="container" style={{ maxWidth: 820 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div className="badge badge-cyan" style={{ marginBottom: 12 }}>Bước 2 / 3</div>
            <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 800, marginBottom: 6 }}>
              ✍️ <span className="text-gradient">Writing Intelligence</span> Wizard
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
              5 giai đoạn · Phân tích thông minh · RTCE+I Framework
            </p>
          </div>

          {/* Stage Progress */}
          <StageProgress current={stage} />

          {/* Loading Overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'fixed', inset: 0, zIndex: 300,
                  background: 'rgba(3,0,16,0.88)', backdropFilter: 'blur(20px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
                }}
              >
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    position: 'absolute',
                    width: 80 + i * 60, height: 80 + i * 60,
                    borderRadius: '50%',
                    border: `1px solid rgba(123,47,255,${0.2 - i * 0.05})`,
                    animation: `pulseRing ${2 + i}s ease-out ${i * 0.4}s infinite`,
                  }} />
                ))}
                <div style={{ fontSize: 36 }}>🧠</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#7b2fff', marginBottom: 6 }}>
                    VIBE AI đang phân tích...
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                    RTCE+I Framework · Writing Intelligence v2.0
                  </div>
                </div>
                <div style={{ width: 200, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.3, ease: 'easeInOut' }}
                    style={{ height: '100%', width: '50%', background: 'linear-gradient(90deg, transparent, #7b2fff, #00f5ff, transparent)', borderRadius: 2 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stages */}
          <AnimatePresence mode="wait">
            {stage === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}>
                <Stage1Input onAnalyze={handleAnalyze} defaultLanguage={state.language} />
              </motion.div>
            )}
            {stage === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}>
                <Stage2Analysis
                  rawInput={state.rawInput}
                  directions={state.directions.map(d => ({ ...d, id: d.id ?? d.label }))}
                  detectedSignals={state.detectedSignals ?? undefined}
                  webTrendsSummary={state.webTrendsSummary}
                  onChoose={handleChooseDirection}
                  onBack={() => setStage(1)}
                />
              </motion.div>
            )}
            {stage === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}>
                <Stage3Clarify
                  rawInput={state.rawInput}
                  direction={state.chosenDirection!}
                  language={state.language}
                  onGenerate={handleGenerate}
                  onBack={() => setStage(2)}
                />
              </motion.div>
            )}
            {stage === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}>
                <Stage4Output
                  prompt={state.generatedPrompt}
                  scores={state.scores}
                  onRegenerate={() => handleGenerate(state.purpose, state.keywords)}
                  onContinue={() => setStage(5)}
                  onEdit={() => setStage(3)}
                  onReset={handleReset}
                />
              </motion.div>
            )}
            {stage === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}>
                <Stage5Review
                  prompt={state.generatedPrompt}
                  metaReview={state.metaReview}
                  scores={state.scores}
                  onUpgrade={() => {
                    // Bug #1 fix: build upgraded keywords first, then pass to both updateState and handleGenerate
                    // using the same value — avoids reading stale state.keywords after setState
                    const upgradedKeywords = state.keywords + ' [Đã nâng cấp: Few-shot + Perspective Flip]';
                    updateState({ keywords: upgradedKeywords });
                    handleGenerate(state.purpose, upgradedKeywords);
                  }}
                  onReset={handleReset}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
