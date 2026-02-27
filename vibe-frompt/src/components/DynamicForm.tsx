'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FormData, Category } from '@/lib/promptTemplates';

interface DynamicFormProps {
    category: Category;
    onBuildPrompt: (data: FormData) => void;
    isBuilding: boolean;
}

const TONES = ['Trang trọng', 'Thân thiện', 'Hài hước', 'Thuyết phục'];
const FORMATS = ['Bullet Points', 'Đoạn văn', 'Blog chuẩn SEO'];
const AUDIENCES = ['Sinh viên', 'Marketer', 'Giáo viên', 'Khách hàng'];
const CODE_LANGS = ['JavaScript', 'TypeScript', 'Python', 'C++'];
const FRAMEWORKS = ['Next.js', 'React', 'Express', 'Django'];
const REQUIREMENTS = ['Tạo mới', 'Refactor', 'Debug'];
const PATTERNS = ['MVC', 'Clean Architecture', 'REST API'];
const MODELS = ['Midjourney', 'SDXL'];
const RATIOS = ['1:1', '16:9', '9:16', '4:3'];
const VERSIONS = ['v5', 'v6'];
const STYLES = ['Realistic', 'Anime', 'Cyberpunk', 'Minimal'];
const FILE_TYPES = ['CSV', 'JSON', 'Excel'];
const DATA_TASKS = ['Phân tích', 'Làm sạch', 'Trực quan hóa'];
const OUTPUTS = ['Table', 'Insight báo cáo', 'Code snippet'];

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
    return (
        <div>
            <label className="field-label">{label}</label>
            <select className="input-cyber" value={value} onChange={e => onChange(e.target.value)}>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}

function ToggleGroup({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
    return (
        <div>
            <label className="field-label">{label}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {options.map(o => (
                    <button key={o} onClick={() => onChange(o)} className="toggle-option" style={{
                        padding: '8px 16px', borderRadius: 50, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                        background: value === o ? 'linear-gradient(135deg, #00f5ff, #0080ff)' : 'rgba(255,255,255,0.06)',
                        color: value === o ? '#000' : 'rgba(255,255,255,0.6)',
                        boxShadow: value === o ? '0 0 15px rgba(0,245,255,0.3)' : 'none',
                    }}>
                        {o}
                    </button>
                ))}
            </div>
        </div>
    );
}

function SliderField({ label, value, min, max, onChange, labels }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; labels?: string[] }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="field-label" style={{ marginBottom: 0 }}>{label}</label>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#00f5ff' }}>
                    {labels ? labels[value - min] : value}
                </span>
            </div>
            <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
                style={{ background: `linear-gradient(to right, #00f5ff ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%)` }}
            />
            {labels && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    {labels.map((l, i) => <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{l}</span>)}
                </div>
            )}
        </div>
    );
}

export default function DynamicForm({ category, onBuildPrompt, isBuilding }: DynamicFormProps) {
    const [quickMode, setQuickMode] = useState(true);
    const [topic, setTopic] = useState('');
    const [language, setLanguage] = useState('vi');
    const [length, setLength] = useState('medium');
    const [creativity, setCreativity] = useState(3);
    const [detailLevel, setDetailLevel] = useState('basic');
    // Writing
    const [tone, setTone] = useState(TONES[0]);
    const [format, setFormat] = useState(FORMATS[0]);
    const [audience, setAudience] = useState(AUDIENCES[0]);
    // Coding
    const [codeLanguage, setCodeLanguage] = useState(CODE_LANGS[0]);
    const [framework, setFramework] = useState(FRAMEWORKS[0]);
    const [requirement, setRequirement] = useState(REQUIREMENTS[0]);
    const [pattern, setPattern] = useState(PATTERNS[0]);
    // Image
    const [model, setModel] = useState(MODELS[0]);
    const [aspectRatio, setAspectRatio] = useState(RATIOS[1]);
    const [version, setVersion] = useState(VERSIONS[1]);
    const [style, setStyle] = useState(STYLES[0]);
    // Data
    const [fileType, setFileType] = useState(FILE_TYPES[0]);
    const [dataTask, setDataTask] = useState(DATA_TASKS[0]);
    const [dataOutput, setDataOutput] = useState(OUTPUTS[0]);

    const commonFields = quickMode ? 2 : 5;
    const extraFields = quickMode ? 0 : (category === 'writing' ? 3 : category === 'coding' ? 4 : category === 'image' ? 4 : 3);
    const totalFields = commonFields + extraFields;
    const filledCount = [topic, language].filter(Boolean).length
        + (quickMode ? 0 : [length, creativity > 0, detailLevel].filter(Boolean).length);
    const progress = Math.round((filledCount / totalFields) * 100);

    const getCategoryLabel = () => {
        const labels: Record<Category, string> = { writing: '✍️ Viết Lách', coding: '💻 Lập Trình', image: '🎨 Tạo Hình Ảnh', data: '📊 Xử Lý Dữ Liệu' };
        return labels[category];
    };

    const getTopicPlaceholder = () => {
        if (category === 'writing') return 'VD: Viết bài về tác động của AI với kinh tế Việt Nam';
        if (category === 'coding') return 'VD: Tạo authentication system với JWT và refresh token';
        if (category === 'image') return 'VD: A cyberpunk city at night with neon lights and flying cars';
        return 'VD: Dataset doanh thu 2024 của công ty thương mại điện tử';
    };

    const handleBuild = () => {
        if (!topic.trim()) return;
        onBuildPrompt({
            category, topic, language, length, creativity, detailLevel,
            tone, format, audience, codeLanguage, framework, requirement, pattern,
            model, aspectRatio, version, style, fileType, task: dataTask, output: dataOutput,
        });
    };

    return (
        <section id="form-section" className="section" style={{ paddingTop: 40 }}>
            <div className="container" style={{ maxWidth: 800 }}>
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <div className="badge badge-cyan" style={{ marginBottom: 16 }}>Bước 2 / 4</div>
                        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, marginBottom: 8 }}>
                            Cấu Hình <span className="text-gradient">Thông Minh</span>
                        </h2>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 50, background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)', fontSize: 14, color: '#00f5ff', marginTop: 8 }}>
                            {getCategoryLabel()}
                        </div>
                    </div>

                    {/* Form Card */}
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '32px', backdropFilter: 'blur(30px)' }}>
                        {/* Quick mode toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                            <div className="toggle-container">
                                <button className={`toggle-option ${quickMode ? 'active' : ''}`} onClick={() => setQuickMode(true)}>⚡ Nhanh gọn</button>
                                <button className={`toggle-option ${!quickMode ? 'active' : ''}`} onClick={() => setQuickMode(false)}>🧠 Nâng cao</button>
                            </div>
                            {/* Progress */}
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Hoàn thành {Math.min(100, progress + 30)}%</div>
                                <div className="progress-bar" style={{ width: 120 }}>
                                    <div className="progress-fill" style={{ width: `${Math.min(100, progress + 30)}%` }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: 20 }}>
                            {/* Topic */}
                            <div>
                                <label className="field-label">Chủ Đề / Yêu Cầu *</label>
                                <textarea
                                    className="input-cyber"
                                    rows={3}
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    placeholder={getTopicPlaceholder()}
                                />
                            </div>

                            {/* Language */}
                            <div>
                                <label className="field-label">Ngôn Ngữ Output</label>
                                <div className="toggle-container" style={{ width: 'fit-content' }}>
                                    <button className={`toggle-option ${language === 'vi' ? 'active' : ''}`} onClick={() => setLanguage('vi')}>🇻🇳 Tiếng Việt</button>
                                    <button className={`toggle-option ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>🇺🇸 English</button>
                                </div>
                            </div>

                            {/* Advanced fields */}
                            <AnimatePresence>
                                {!quickMode && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4 }} style={{ display: 'grid', gap: 20, overflow: 'hidden' }}>
                                        <SliderField label="Độ Dài" value={length === 'short' ? 1 : length === 'medium' ? 2 : 3} min={1} max={3}
                                            onChange={v => setLength(v === 1 ? 'short' : v === 2 ? 'medium' : 'long')}
                                            labels={['Ngắn', 'Vừa', 'Dài']} />
                                        <SliderField label="Mức Sáng Tạo" value={creativity} min={1} max={5}
                                            onChange={setCreativity}
                                            labels={['Ổn định', '', 'Cân bằng', '', 'Sáng tạo']} />
                                        <div>
                                            <label className="field-label">Độ Chi Tiết</label>
                                            <div className="toggle-container" style={{ width: 'fit-content' }}>
                                                <button className={`toggle-option ${detailLevel === 'basic' ? 'active' : ''}`} onClick={() => setDetailLevel('basic')}>Cơ bản</button>
                                                <button className={`toggle-option ${detailLevel === 'advanced' ? 'active' : ''}`} onClick={() => setDetailLevel('advanced')}>Nâng cao</button>
                                            </div>
                                        </div>

                                        {/* Category specific */}
                                        <div className="cyber-line" />

                                        {category === 'writing' && (
                                            <div style={{ display: 'grid', gap: 16 }}>
                                                <ToggleGroup label="Giọng Văn" value={tone} options={TONES} onChange={setTone} />
                                                <ToggleGroup label="Định Dạng" value={format} options={FORMATS} onChange={setFormat} />
                                                <ToggleGroup label="Đối Tượng" value={audience} options={AUDIENCES} onChange={setAudience} />
                                            </div>
                                        )}
                                        {category === 'coding' && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                <SelectField label="Ngôn Ngữ Code" value={codeLanguage} options={CODE_LANGS} onChange={setCodeLanguage} />
                                                <SelectField label="Framework" value={framework} options={FRAMEWORKS} onChange={setFramework} />
                                                <ToggleGroup label="Yêu Cầu" value={requirement} options={REQUIREMENTS} onChange={setRequirement} />
                                                <SelectField label="Pattern" value={pattern} options={PATTERNS} onChange={setPattern} />
                                            </div>
                                        )}
                                        {category === 'image' && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                <SelectField label="AI Model" value={model} options={MODELS} onChange={setModel} />
                                                <SelectField label="Aspect Ratio" value={aspectRatio} options={RATIOS} onChange={setAspectRatio} />
                                                <SelectField label="Version" value={version} options={VERSIONS} onChange={setVersion} />
                                                <ToggleGroup label="Style" value={style} options={STYLES} onChange={setStyle} />
                                            </div>
                                        )}
                                        {category === 'data' && (
                                            <div style={{ display: 'grid', gap: 16 }}>
                                                <ToggleGroup label="Loại File" value={fileType} options={FILE_TYPES} onChange={setFileType} />
                                                <ToggleGroup label="Task" value={dataTask} options={DATA_TASKS} onChange={setDataTask} />
                                                <ToggleGroup label="Output Format" value={dataOutput} options={OUTPUTS} onChange={setDataOutput} />
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Build Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleBuild}
                                disabled={!topic.trim() || isBuilding}
                                className={`btn-magnetic energy-beam`}
                                style={{ width: '100%', padding: '18px', fontSize: 17, opacity: !topic.trim() ? 0.5 : 1, marginTop: 8 }}
                            >
                                {isBuilding ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                        Đang tối ưu cấu trúc...
                                    </span>
                                ) : '⚡ Build Prompt'}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </section>
    );
}
