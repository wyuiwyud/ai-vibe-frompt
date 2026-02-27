'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateScore, generateVariants, type FormData } from '@/lib/promptTemplates';
import { copyToClipboard } from '@/lib/utils';

interface PromptOutputProps {
    prompt: string;
    formData: FormData | null;
    onEdit: () => void;
}

function ScoreMeter({ clarity, structure, creativity }: { clarity: number; structure: number; creativity: number }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setTimeout(() => setMounted(true), 200); }, []);

    const bars = [
        { label: 'Clarity', value: clarity, color: '#00f5ff' },
        { label: 'Structure', value: structure, color: '#7b2fff' },
        { label: 'Creativity', value: creativity, color: '#ff00cc' },
    ];
    const avg = Math.round((clarity + structure + creativity) / 3);

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 16, padding: '20px 24px', boxShadow: '0 0 30px rgba(255,215,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🏆</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#ffd700' }}>Prompt Score</span>
                </div>
                <div className="badge badge-gold" style={{ fontSize: 18, fontWeight: 800 }}>{avg}%</div>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
                {bars.map(b => (
                    <div key={b.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{b.label}</span>
                            <span style={{ color: b.color, fontWeight: 700 }}>{b.value}%</span>
                        </div>
                        <div className="score-bar">
                            <div className="score-fill" style={{ width: mounted ? `${b.value}%` : '0%', background: `linear-gradient(90deg, ${b.color}, ${b.color}88)` }} />
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

export default function PromptOutput({ prompt, formData, onEdit }: PromptOutputProps) {
    const [activeVariant, setActiveVariant] = useState<'original' | 'persuasive' | 'technical' | 'emotional'>('original');
    const [toast, setToast] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    const scores = formData ? calculateScore(formData) : { clarity: 88, structure: 84, creativity: 90 };

    const displayedPrompt = activeVariant === 'original'
        ? prompt
        : generateVariants(prompt, activeVariant as 'persuasive' | 'technical' | 'emotional');

    const handleCopy = async () => {
        await copyToClipboard(displayedPrompt);
        setToast('✨ Prompt copied to vibe clipboard!');
    };

    const handleSave = () => {
        setIsSaved(true);
        setToast('💾 Đã lưu vào Prompt Library!');
    };

    const VARIANTS = [
        { id: 'original', label: '⚡ Original', color: '#00f5ff' },
        { id: 'persuasive', label: '🔥 Thuyết phục', color: '#ff6633' },
        { id: 'technical', label: '🔬 Kỹ thuật', color: '#7b2fff' },
        { id: 'emotional', label: '💫 Cảm xúc', color: '#ff00cc' },
    ];

    return (
        <section id="output-section" className="section" style={{ paddingTop: 20 }}>
            <div className="container" style={{ maxWidth: 900 }}>
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 36 }}>
                        <div className="badge badge-cyan" style={{ marginBottom: 16 }}>Bước 4 / 4</div>
                        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, marginBottom: 8 }}>
                            Prompt <span className="text-gradient">Đã Sẵn Sàng</span> ✨
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>
                            Copy và paste trực tiếp vào ChatGPT, Claude, Gemini
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
                        {/* Left: Prompt output */}
                        <div>
                            {/* Variant selector */}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                                {VARIANTS.map(v => (
                                    <button key={v.id} onClick={() => setActiveVariant(v.id as typeof activeVariant)}
                                        style={{
                                            padding: '8px 16px', borderRadius: 50, fontSize: 13, fontWeight: 600,
                                            cursor: 'pointer', border: `1px solid ${activeVariant === v.id ? v.color : 'rgba(255,255,255,0.1)'}`,
                                            background: activeVariant === v.id ? `${v.color}15` : 'transparent',
                                            color: activeVariant === v.id ? v.color : 'rgba(255,255,255,0.5)',
                                            transition: 'all 0.2s',
                                        }}>
                                        {v.label}
                                    </button>
                                ))}
                            </div>

                            {/* Code block */}
                            <AnimatePresence mode="wait">
                                <motion.div key={activeVariant} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                    <div className="code-block" style={{ maxHeight: 420, overflowY: 'auto' }}>
                                        {displayedPrompt}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                                <button onClick={handleCopy} className="btn-magnetic" style={{ flex: 1, padding: '12px', fontSize: 14 }}>
                                    📋 Copy Prompt
                                </button>
                                <button onClick={onEdit} className="btn-ghost" style={{ padding: '12px 20px', fontSize: 14 }}>
                                    ✏️ Chỉnh sửa
                                </button>
                                <button onClick={handleSave}
                                    style={{
                                        padding: '12px 20px', borderRadius: 50, fontSize: 14, fontWeight: 600,
                                        cursor: 'pointer', border: `1px solid ${isSaved ? 'rgba(0,255,170,0.4)' : 'rgba(255,255,255,0.15)'}`,
                                        background: isSaved ? 'rgba(0,255,170,0.08)' : 'transparent',
                                        color: isSaved ? '#00ffaa' : 'rgba(255,255,255,0.5)', transition: 'all 0.3s',
                                    }}>
                                    {isSaved ? '✅ Đã lưu' : '💾 Lưu'}
                                </button>
                            </div>
                        </div>

                        {/* Right: Score + refine */}
                        <div style={{ display: 'grid', gap: 16 }}>
                            <ScoreMeter {...scores} />

                            {/* Auto Refine */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                                    🔄 Auto Refine
                                </div>
                                <div style={{ display: 'grid', gap: 8 }}>
                                    {[
                                        { id: 'persuasive', label: 'Thuyết phục hơn', color: '#ff6633' },
                                        { id: 'technical', label: 'Kỹ thuật hơn', color: '#7b2fff' },
                                        { id: 'emotional', label: 'Cảm xúc hơn', color: '#ff00cc' },
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => setActiveVariant(opt.id as 'persuasive' | 'technical' | 'emotional')}
                                            style={{
                                                width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                                                cursor: 'pointer', border: `1px solid ${activeVariant === opt.id ? opt.color : 'rgba(255,255,255,0.08)'}`,
                                                background: activeVariant === opt.id ? `${opt.color}12` : 'rgba(255,255,255,0.03)',
                                                color: activeVariant === opt.id ? opt.color : 'rgba(255,255,255,0.6)', transition: 'all 0.2s',
                                                textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                                            }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color, display: 'inline-block', boxShadow: `0 0 6px ${opt.color}` }} />
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Share hint */}
                            <div style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)', borderRadius: 16, padding: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: 20, marginBottom: 8 }}>🔗</div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Chia sẻ prompt này</div>
                                <button onClick={() => setToast('🔗 Link đã được tạo!')} className="btn-ghost" style={{ padding: '8px 20px', fontSize: 13 }}>
                                    Tạo share link
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </section>
    );
}
