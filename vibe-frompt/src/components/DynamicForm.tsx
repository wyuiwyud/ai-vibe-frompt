'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Category } from '@/lib/promptTemplates';

interface DynamicFormProps {
    category: Category;
    onBuildPrompt: (data: FormFields) => void;
    isBuilding: boolean;
}

export interface FormFields {
    category: Category;
    topic: string;
    language: string;
    tone: string;
    format: string;
    audience: string;
    codeLanguage: string;
    framework: string;
    requirement: string;
    style: string;
    aspectRatio: string;
    detailLevel: string;
}

const CATEGORY_CONFIG: Record<Category, {
    label: string;
    icon: string;
    color: string;
    topicPlaceholder: string;
}> = {
    writing: {
        label: 'Viết Lách',
        icon: '✍️',
        color: '#00f5ff',
        topicPlaceholder: 'VD: Viết bài về tác động của AI với kinh tế Việt Nam',
    },
    coding: {
        label: 'Lập Trình',
        icon: '💻',
        color: '#7b2fff',
        topicPlaceholder: 'VD: Tạo authentication system với JWT và refresh token',
    },
    image: {
        label: 'Tạo Hình Ảnh',
        icon: '🎨',
        color: '#ff00cc',
        topicPlaceholder: 'VD: A futuristic city at night with neon lights and flying cars',
    },
};

function ToggleGroup({ label, value, options, onChange, color }: {
    label: string; value: string; options: string[]; onChange: (v: string) => void; color?: string;
}) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                {label}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {options.map(o => (
                    <button
                        key={o}
                        onClick={() => onChange(o)}
                        style={{
                            padding: '7px 14px', borderRadius: 50, fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                            background: value === o ? (color ? `${color}22` : 'rgba(0,245,255,0.15)') : 'rgba(255,255,255,0.06)',
                            color: value === o ? (color || '#00f5ff') : 'rgba(255,255,255,0.55)',
                            boxShadow: value === o ? `0 0 12px ${color || '#00f5ff'}44` : 'none',
                            outline: value === o ? `1px solid ${color || '#00f5ff'}66` : '1px solid transparent',
                        }}
                    >
                        {o}
                    </button>
                ))}
            </div>
        </div>
    );
}

function SelectField({ label, value, options, onChange }: {
    label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                {label}
            </label>
            <select
                className="input-cyber"
                value={value}
                onChange={e => onChange(e.target.value)}
            >
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}

export default function DynamicForm({ category, onBuildPrompt, isBuilding }: DynamicFormProps) {
    const cfg = CATEGORY_CONFIG[category];
    const [topic, setTopic] = useState('');
    const [language, setLanguage] = useState('vi');
    const [detailLevel, setDetailLevel] = useState('basic');

    // Writing
    const [tone, setTone] = useState('Chuyên nghiệp');
    const [format, setFormat] = useState('Bullet Points');
    const [audience, setAudience] = useState('Đại chúng');

    // Coding
    const [codeLanguage, setCodeLanguage] = useState('JavaScript');
    const [framework, setFramework] = useState('React');
    const [requirement, setRequirement] = useState('Tạo mới');

    // Image
    const [style, setStyle] = useState('Cinematic');
    const [aspectRatio, setAspectRatio] = useState('16:9');

    const canBuild = !!topic.trim() && !isBuilding;

    const handleBuild = () => {
        if (!canBuild) return;
        onBuildPrompt({
            category, topic, language, tone, format, audience,
            codeLanguage, framework, requirement,
            style, aspectRatio, detailLevel,
        });
    };

    return (
        <section id="form-section" style={{ padding: '40px 0 80px' }}>
            <div className="container" style={{ maxWidth: 720 }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 36 }}>
                        <div className="badge badge-cyan" style={{ marginBottom: 14 }}>Bước 2 / 3</div>
                        <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 800, marginBottom: 8 }}>
                            Cấu Hình <span className="text-gradient">Thông Minh</span>
                        </h2>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px',
                            borderRadius: 50, background: `${cfg.color}15`, border: `1px solid ${cfg.color}33`,
                            fontSize: 14, color: cfg.color, marginTop: 8,
                        }}>
                            {cfg.icon} {cfg.label}
                        </div>
                    </div>

                    {/* Form Card */}
                    <div style={{
                        background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 24, padding: '28px', backdropFilter: 'blur(30px)',
                    }}>
                        <div style={{ display: 'grid', gap: 20 }}>
                            {/* Topic */}
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                                    Chủ Đề / Yêu Cầu <span style={{ color: cfg.color }}>*</span>
                                </label>
                                <textarea
                                    className="input-cyber"
                                    rows={3}
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    placeholder={cfg.topicPlaceholder}
                                    onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleBuild(); }}
                                />
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>Ctrl+Enter để tạo nhanh</div>
                            </div>

                            {/* Language */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                                        Ngôn Ngữ Output
                                    </label>
                                    <div className="toggle-container" style={{ width: 'fit-content' }}>
                                        <button className={`toggle-option ${language === 'vi' ? 'active' : ''}`} onClick={() => setLanguage('vi')}>🇻🇳 Tiếng Việt</button>
                                        <button className={`toggle-option ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>🇺🇸 English</button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                                        Mức Độ Chi Tiết
                                    </label>
                                    <div className="toggle-container" style={{ width: 'fit-content' }}>
                                        <button className={`toggle-option ${detailLevel === 'basic' ? 'active' : ''}`} onClick={() => setDetailLevel('basic')}>Cơ bản</button>
                                        <button className={`toggle-option ${detailLevel === 'advanced' ? 'active' : ''}`} onClick={() => setDetailLevel('advanced')}>Nâng cao</button>
                                    </div>
                                </div>
                            </div>

                            {/* Category-specific fields */}
                            <div className="cyber-line" />

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={category}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    style={{ display: 'grid', gap: 16 }}
                                >
                                    {category === 'writing' && (
                                        <>
                                            <ToggleGroup label="Giọng Văn" value={tone} color={cfg.color}
                                                options={['Chuyên nghiệp', 'Thân thiện', 'Thuyết phục', 'Hài hước']}
                                                onChange={setTone} />
                                            <ToggleGroup label="Định Dạng" value={format} color={cfg.color}
                                                options={['Bullet Points', 'Đoạn văn', 'Blog SEO', 'Thread MXH']}
                                                onChange={setFormat} />
                                            <ToggleGroup label="Đối Tượng" value={audience} color={cfg.color}
                                                options={['Đại chúng', 'Sinh viên', 'Marketer', 'Khách hàng']}
                                                onChange={setAudience} />
                                        </>
                                    )}
                                    {category === 'coding' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <SelectField label="Ngôn Ngữ" value={codeLanguage}
                                                options={['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust']}
                                                onChange={setCodeLanguage} />
                                            <SelectField label="Framework" value={framework}
                                                options={['React', 'Next.js', 'Vue', 'Express', 'FastAPI', 'Django']}
                                                onChange={setFramework} />
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <ToggleGroup label="Loại Yêu Cầu" value={requirement} color={cfg.color}
                                                    options={['Tạo mới', 'Refactor', 'Debug', 'Tối ưu hóa']}
                                                    onChange={setRequirement} />
                                            </div>
                                        </div>
                                    )}
                                    {category === 'image' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <ToggleGroup label="Phong Cách" value={style} color={cfg.color}
                                                    options={['Cinematic', 'Anime', 'Realistic', 'Abstract', 'Cyberpunk', 'Minimalist']}
                                                    onChange={setStyle} />
                                            </div>
                                            <ToggleGroup label="Tỉ lệ" value={aspectRatio} color={cfg.color}
                                                options={['1:1', '16:9', '9:16', '4:3']}
                                                onChange={setAspectRatio} />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Build Button */}
                            <motion.button
                                whileHover={{ scale: canBuild ? 1.02 : 1 }}
                                whileTap={{ scale: canBuild ? 0.98 : 1 }}
                                onClick={handleBuild}
                                disabled={!canBuild}
                                className="btn-magnetic energy-beam"
                                style={{ width: '100%', padding: '18px', fontSize: 17, marginTop: 4, opacity: canBuild ? 1 : 0.5, cursor: canBuild ? 'pointer' : 'not-allowed' }}
                            >
                                {isBuilding ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                                        <span style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                        AI đang tạo prompt...
                                    </span>
                                ) : '🚀 Tạo Prompt Ngay'}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </section>
    );
}
