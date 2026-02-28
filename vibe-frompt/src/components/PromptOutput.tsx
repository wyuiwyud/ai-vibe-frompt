'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateVariants, type FormData } from '@/lib/promptTemplates';
import { copyToClipboard } from '@/lib/utils';

interface ScoreValues {
    clarity: number;
    structure: number;
    creativity: number;
}

interface PromptOutputProps {
    prompt: string;
    formData: FormData | null;
    scores: ScoreValues;
    onEdit: () => void;
}

function ScoreMeter({ clarity, structure, creativity }: ScoreValues) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setTimeout(() => setMounted(true), 200); }, []);

    const avg = Math.round((clarity + structure + creativity) / 3);
    const bars = [
        { label: 'Clarity', value: clarity, color: '#00f5ff' },
        { label: 'Structure', value: structure, color: '#7b2fff' },
        { label: 'Creativity', value: creativity, color: '#ff00cc' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
                background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)',
                borderRadius: 16, padding: '20px 24px', boxShadow: '0 0 30px rgba(255,215,0,0.08)',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🏆</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#ffd700' }}>Prompt Score</span>
                </div>
                <div className="badge badge-gold" style={{ fontSize: 17, fontWeight: 800 }}>{avg}%</div>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
                {bars.map(b => (
                    <div key={b.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{b.label}</span>
                            <span style={{ color: b.color, fontWeight: 700 }}>{b.value}%</span>
                        </div>
                        <div className="score-bar">
                            <div className="score-fill" style={{
                                width: mounted ? `${b.value}%` : '0%',
                                background: `linear-gradient(90deg, ${b.color}, ${b.color}88)`,
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return <div className="toast">{message}</div>;
}

export default function PromptOutput({ prompt, formData, scores, onEdit }: PromptOutputProps) {
    const [activeVariant, setActiveVariant] = useState<'original' | 'persuasive' | 'technical' | 'emotional'>('original');
    const [toast, setToast] = useState('');

    const displayedPrompt = activeVariant === 'original'
        ? prompt
        : generateVariants(prompt, activeVariant as 'persuasive' | 'technical' | 'emotional');

    const handleCopy = async () => {
        await copyToClipboard(displayedPrompt);
        setToast('✨ Đã copy prompt vào clipboard!');
    };

    const VARIANTS = [
        { id: 'original', label: '⚡ Original', color: '#00f5ff' },
        { id: 'persuasive', label: '🔥 Thuyết phục', color: '#ff6633' },
        { id: 'technical', label: '🔬 Kỹ thuật', color: '#7b2fff' },
        { id: 'emotional', label: '💫 Cảm xúc', color: '#ff00cc' },
    ];

    const charCount = displayedPrompt.length;

    return (
        <section id="output-section" className="section" style={{ paddingTop: 20 }}>
            <div className="container" style={{ maxWidth: 900 }}>
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 36 }}>
                        <div className="badge badge-cyan" style={{ marginBottom: 16 }}>Bước 3 / 3</div>
                        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, marginBottom: 8 }}>
                            Prompt <span className="text-gradient">Đã Sẵn Sàng</span> ✨
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
                            Copy và paste trực tiếp vào ChatGPT, Claude, Gemini
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
                        {/* Left: Prompt output */}
                        <div>
                            {/* Variant selector */}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                                {VARIANTS.map(v => (
                                    <button key={v.id} onClick={() => setActiveVariant(v.id as typeof activeVariant)}
                                        style={{
                                            padding: '7px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600,
                                            cursor: 'pointer',
                                            border: `1px solid ${activeVariant === v.id ? v.color : 'rgba(255,255,255,0.1)'}`,
                                            background: activeVariant === v.id ? `${v.color}15` : 'transparent',
                                            color: activeVariant === v.id ? v.color : 'rgba(255,255,255,0.45)',
                                            transition: 'all 0.2s',
                                        }}>
                                        {v.label}
                                    </button>
                                ))}
                            </div>

                            {/* Code block */}
                            <AnimatePresence mode="wait">
                                <motion.div key={activeVariant} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                                    <div className="code-block" style={{ maxHeight: 400, overflowY: 'auto', fontSize: 14 }}>
                                        {displayedPrompt}
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
                                        {charCount} ký tự
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                                <button onClick={handleCopy} className="btn-magnetic" style={{ flex: 1, padding: '12px', fontSize: 14 }}>
                                    📋 Copy Prompt
                                </button>
                                <button onClick={onEdit} className="btn-ghost" style={{ padding: '12px 20px', fontSize: 14 }}>
                                    ✏️ Chỉnh sửa
                                </button>
                            </div>
                            <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.1)', borderRadius: 12, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                                💡 <strong style={{ color: '#00f5ff' }}>Tip:</strong> Dán prompt vào ChatGPT/Claude/Gemini và nhận kết quả ngay. Dùng biến thể (Thuyết phục/Kỹ thuật/Cảm xúc) để tùy chỉnh.
                            </div>
                        </div>

                        {/* Right: Score + variants */}
                        <div style={{ display: 'grid', gap: 16 }}>
                            <ScoreMeter {...scores} />

                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '18px' }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                                    🔄 Tinh Chỉnh Nhanh
                                </div>
                                <div style={{ display: 'grid', gap: 8 }}>
                                    {[
                                        { id: 'persuasive', label: '🔥 Thuyết phục hơn', color: '#ff6633' },
                                        { id: 'technical', label: '🔬 Kỹ thuật hơn', color: '#7b2fff' },
                                        { id: 'emotional', label: '💫 Cảm xúc hơn', color: '#ff00cc' },
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => setActiveVariant(opt.id as typeof activeVariant)}
                                            style={{
                                                width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                                                cursor: 'pointer',
                                                border: `1px solid ${activeVariant === opt.id ? opt.color : 'rgba(255,255,255,0.07)'}`,
                                                background: activeVariant === opt.id ? `${opt.color}12` : 'rgba(255,255,255,0.03)',
                                                color: activeVariant === opt.id ? opt.color : 'rgba(255,255,255,0.55)',
                                                transition: 'all 0.2s', textAlign: 'left',
                                                display: 'flex', alignItems: 'center', gap: 8,
                                            }}>
                                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: opt.color, boxShadow: `0 0 6px ${opt.color}` }} />
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
            {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </section>
    );
}
