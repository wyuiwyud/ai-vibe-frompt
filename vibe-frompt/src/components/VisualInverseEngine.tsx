'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Components {
    subject: string;
    environment: string;
    cinematography: string;
    style: string;
}

const DEFAULT_COMPONENTS: Components = {
    subject: '',
    environment: '',
    cinematography: '',
    style: '',
};

const COMPONENT_META: { key: keyof Components; label: string; icon: string; color: string; hint: string }[] = [
    { key: 'subject', label: 'Subject (Chủ thể)', icon: '👤', color: '#00f5ff', hint: 'Nhân vật chính, dáng pose, trang phục, cảm xúc' },
    { key: 'environment', label: 'Environment (Bối cảnh)', icon: '🌍', color: '#7b2fff', hint: 'Địa điểm, không gian, bầu khí quyển, độ sâu' },
    { key: 'cinematography', label: 'Cinematography (Kỹ thuật)', icon: '🎬', color: '#ff6633', hint: 'Góc máy, tiêu cự, DOF, ánh sáng' },
    { key: 'style', label: 'Artistic Style (Phong cách)', icon: '🎨', color: '#ff00cc', hint: 'Bảng màu, texture, tone màu, phong cách nghệ thuật' },
];

type Variant = 'original' | 'galaxy4d' | 'cinematic';

function buildPrompt(components: Components, variant: Variant): string {
    const s = components.subject;
    const e = components.environment;
    const c = components.cinematography;
    const st = components.style;

    if (variant === 'original') {
        return `[ROLE]
Bạn là AI Image Generation Expert chuyên tái tạo hình ảnh với độ tương đồng 99%.

[TASK]
Tạo hình ảnh theo đúng mô tả sau, tái tạo chính xác "linh hồn" của ảnh gốc.

[CONTEXT — SUBJECT]
${s}

[CONTEXT — ENVIRONMENT]
${e}

[CONTEXT — CINEMATOGRAPHY]
${c}

[CONTEXT — ARTISTIC STYLE]
${st}

[EXAMPLE]
Ultra-detailed, professional quality, masterpiece.

[INSTRUCTION]
Recreate with maximum fidelity. Preserve all visual elements, lighting, and atmosphere. --ar 16:9 --v 6 --style raw --stylize 150

Negative: blurry, low quality, watermark, distorted, text`.trim();
    }

    if (variant === 'galaxy4d') {
        return `[ROLE]
Bạn là AI Image Artist chuyên phong cách Galaxy 4D/Cosmic Cinematic.

[TASK]
Tái tạo hình ảnh với phong cách Galaxy 4D đặc trưng của VIBE Frompt:
- Nền vũ trụ sâu thẳm với Nebula Purple (#7b2fff) và Stardust Cyan (#00f5ff)
- Ánh sáng huyền bí từ sao và thiên thể
- Hiệu ứng bokeh hạt sao lấp lánh

[CONTEXT — SUBJECT]
${s}

[CONTEXT — ENVIRONMENT]
${e}, dưới đây là bầu trời thiên hà Nebula Purple, ánh sáng Stardust Cyan tỏa ra xung quanh, bokeh sao lấp lánh

[CONTEXT — CINEMATOGRAPHY]
${c}, volumetric nebula lighting, anamorphic lens flare

[CONTEXT — ARTISTIC STYLE]
Galaxy 4D aesthetic, ${st}, cosmic color grading with deep purple and cyan tones, Nebula Glow overlay

[INSTRUCTION]
Apply Galaxy 4D VIBE Frompt signature style. Add nebula particles, galactic bokeh, cosmic rim lighting. --ar 16:9 --v 6 --style raw --stylize 200

Negative: bland colors, no glow, overexposed, washed out`.trim();
    }

    // cinematic epic
    return `[ROLE]
Bạn là Cinematographer AI siêu cấp, chuyên gia về hình ảnh điện ảnh Hollywood AAA.

[TASK]
Nâng cấp hình ảnh lên cấp độ EPIC CINEMATIC — hoành tráng, đột phá thị giác, như cảnh phim bom tấn.

[CONTEXT — SUBJECT]
${s}, enhanced with dynamic pose, powerful presence, hero lighting

[CONTEXT — ENVIRONMENT]
${e}, expanded to epic scale, dramatic weather effects (lightning/storm/fire), god rays, cinematic depth

[CONTEXT — CINEMATOGRAPHY]
${c}, upgraded to: extreme dramatic angle, anamorphic widescreen, high contrast dramatic lighting, Dolby Vision HDR color

[CONTEXT — ARTISTIC STYLE]
Epic cinematic, ${st}, Hollywood grade color grading, lens flares, volumetric fog, cinematic bloom, IMAX quality

[INSTRUCTION]
Make it EPIC. Maximum drama, maximum visual impact, AAA movie quality. --ar 21:9 --v 6 --style cinematic --stylize 250

Negative: boring, flat lighting, ordinary, amateur, low contrast`.trim();
}

interface EditableCardProps {
    meta: typeof COMPONENT_META[0];
    value: string;
    onChange: (v: string) => void;
    loading: boolean;
}

function EditableCard({ meta, value, onChange, loading }: EditableCardProps) {
    const [focused, setFocused] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
                background: focused ? `rgba(${meta.color === '#00f5ff' ? '0,245,255' : meta.color === '#7b2fff' ? '123,47,255' : meta.color === '#ff6633' ? '255,102,51' : '255,0,204'},0.06)` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${focused ? meta.color + '66' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 16,
                padding: '18px',
                transition: 'border-color 0.3s, background 0.3s',
                boxShadow: focused ? `0 0 20px ${meta.color}22` : 'none',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{meta.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{meta.label}</span>
                {loading && <span style={{ marginLeft: 'auto', width: 14, height: 14, border: `2px solid ${meta.color}33`, borderTop: `2px solid ${meta.color}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />}
            </div>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={loading ? 'AI đang phân tích...' : meta.hint}
                rows={4}
                disabled={loading}
                style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    color: value ? '#fff' : 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.6,
                    resize: 'vertical', fontFamily: 'inherit', opacity: loading ? 0.5 : 1,
                }}
            />
        </motion.div>
    );
}

const VARIANT_TABS: { id: Variant; label: string; icon: string; color: string }[] = [
    { id: 'original', label: 'Original', icon: '⚡', color: '#00f5ff' },
    { id: 'galaxy4d', label: 'Galaxy 4D', icon: '🌌', color: '#7b2fff' },
    { id: 'cinematic', label: 'Cinematic Epic', icon: '🎬', color: '#ff6633' },
];

export default function VisualInverseEngine() {
    const [dragOver, setDragOver] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [mimeType, setMimeType] = useState('image/jpeg');
    const [components, setComponents] = useState<Components>(DEFAULT_COMPONENTS);
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzed, setAnalyzed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeVariant, setActiveVariant] = useState<Variant>('original');
    const [copied, setCopied] = useState(false);
    const [fallbackMode, setFallbackMode] = useState(false);
    const [description, setDescription] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const originalDataUrl = e.target?.result as string;
            setImagePreview(originalDataUrl);

            // Compress to max 512px + JPEG 0.65 (keeps it under ~100KB base64)
            const img = new Image();
            img.onload = () => {
                const MAX = 512;
                let w = img.width;
                let h = img.height;
                if (w > MAX || h > MAX) {
                    if (w > h) { h = Math.round((h * MAX) / w); w = MAX; }
                    else { w = Math.round((w * MAX) / h); h = MAX; }
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
                const compressed = canvas.toDataURL('image/jpeg', 0.65);
                setImageBase64(compressed.split(',')[1]);
                setMimeType('image/jpeg');
                setComponents(DEFAULT_COMPONENTS);
                setAnalyzed(false);
                setError(null);
            };
            img.src = originalDataUrl;
        };
        reader.readAsDataURL(file);
    }, []);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleAnalyze = async () => {
        if (!imageBase64 && !description) return;
        setAnalyzing(true);
        setError(null);

        // Text mode: user described the image
        if (fallbackMode || !imageBase64) {
            try {
                const res = await fetch('/api/vision', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description, mode: 'text' }),
                });
                const data = await res.json() as { components?: Components; error?: string };
                if (!res.ok || data.error) throw new Error('Không thể phân tích. Thử lại.');
                setComponents(data.components ?? DEFAULT_COMPONENTS);
                setAnalyzed(true);
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setAnalyzing(false);
            }
            return;
        }

        // Vision mode: send the image
        try {
            const res = await fetch('/api/vision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64, mimeType }),
            });
            const data = await res.json() as { components?: Components; error?: string; fallbackMode?: string; message?: string };

            if (data.error === 'vision_unavailable') {
                // Graceful degradation: switch to text mode
                setFallbackMode(true);
                setError('⚠️ ' + (data.message || 'AI Vision đang bận. Hãy mô tả hình ảnh bên dưới để phân tích.'));
                return;
            }

            if (!res.ok || !data.components) throw new Error(data.error || 'Vision API error');
            setComponents(data.components);
            setAnalyzed(true);
        } catch (e) {
            const msg = (e as Error).message;
            if (!msg.includes('vision_unavailable')) setError(msg);
        } finally {
            setAnalyzing(false);
        }
    };

    const prompt = analyzed ? buildPrompt(components, activeVariant) : '';

    const handleCopy = async () => {
        await navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <section style={{ padding: '60px 0 80px' }}>
            <div className="container" style={{ maxWidth: 900 }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 44 }}>
                    <div className="badge badge-cyan" style={{ marginBottom: 14 }}>🧠 AI Vision Analysis</div>
                    <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, marginBottom: 10 }}>
                        <span className="text-gradient">Visual Inverse</span> Engine
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
                        Upload ảnh → AI bóc tách 4 lớp → Chỉnh sửa → Tái tạo bằng Midjourney/DALL-E
                    </p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: analyzed ? '340px 1fr' : '1fr', gap: 24, alignItems: 'start' }}>
                    {/* LEFT: Upload + Preview */}
                    <div style={{ display: 'grid', gap: 16 }}>
                        {/* Dropzone */}
                        <motion.div
                            onClick={() => fileRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            whileHover={{ scale: 1.01 }}
                            style={{
                                border: `2px dashed ${dragOver ? '#00f5ff' : imagePreview ? '#7b2fff' : 'rgba(255,255,255,0.15)'}`,
                                borderRadius: 20, padding: imagePreview ? 0 : '40px 20px',
                                cursor: 'pointer', textAlign: 'center', overflow: 'hidden',
                                background: dragOver ? 'rgba(0,245,255,0.05)' : 'rgba(255,255,255,0.02)',
                                transition: 'all 0.3s', minHeight: 200,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Upload preview" style={{ width: '100%', borderRadius: 18, display: 'block', objectFit: 'cover', maxHeight: 260 }} />
                            ) : (
                                <div>
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
                                    <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 6 }}>Upload hoặc Drag & Drop</div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>JPG, PNG, WEBP · Tối đa 10MB</div>
                                </div>
                            )}
                        </motion.div>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

                        {/* Analyze button */}
                        {imagePreview && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: analyzing ? 1 : 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={handleAnalyze} disabled={analyzing || (fallbackMode && !description)}
                                className="btn-magnetic energy-beam"
                                style={{ width: '100%', padding: '16px', fontSize: 16, opacity: (analyzing || (fallbackMode && !description)) ? 0.6 : 1, cursor: analyzing ? 'wait' : 'pointer' }}
                            >
                                {analyzing ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                                        <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                        AI đang phân tích...
                                    </span>
                                ) : analyzed ? '🔄 Phân tích lại' : fallbackMode ? '✍️ Tạo từ mô tả' : '🔍 Phân tích hình ảnh'}
                            </motion.button>
                        )}

                        {/* Fallback text input when vision quota is exhausted */}
                        {fallbackMode && imagePreview && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                style={{ padding: '14px 16px', background: 'rgba(255,153,0,0.06)', border: '1px solid rgba(255,153,0,0.25)', borderRadius: 14 }}
                            >
                                <div style={{ fontSize: 12, color: '#ff9900', fontWeight: 700, marginBottom: 8 }}>✍️ Mô tả AI Vision (trong khi chờ quota reset)</div>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Ví dụ: Chân dung người phụ nữ mặc áo đỏ, nền rừng ban đêm, ánh sáng vầng trăng..."
                                    style={{
                                        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,153,0,0.2)',
                                        borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 13,
                                        lineHeight: 1.5, resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                                    }}
                                />
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>Groq Llama 3.3 sẽ sinh 4 lớp phân tích từ mô tả này</div>
                            </motion.div>
                        )}

                        {/* Error */}
                        {error && (
                            <div style={{ padding: '12px 16px', background: 'rgba(255,153,0,0.08)', border: '1px solid rgba(255,153,0,0.25)', borderRadius: 12, fontSize: 13, color: '#ff9900' }}>
                                {error}
                            </div>
                        )}

                        {/* Tip */}
                        {!imagePreview && (
                            <div style={{ padding: '14px 16px', background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.12)', borderRadius: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                                💡 <strong style={{ color: '#00f5ff' }}>Cách dùng:</strong> Upload ảnh mẫu bạn thích → AI tự động bóc tách thành 4 lớp → Chỉnh sửa từng lớp → Tạo prompt để sinh ảnh mới tương tự 99%
                            </div>
                        )}
                    </div>

                    {/* RIGHT: 4 Editable Cards (shown after analysis) */}
                    <AnimatePresence>
                        {analyzed && (
                            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ display: 'grid', gap: 12 }}>
                                {COMPONENT_META.map((meta) => (
                                    <EditableCard
                                        key={meta.key}
                                        meta={meta}
                                        value={components[meta.key]}
                                        onChange={(v) => setComponents(prev => ({ ...prev, [meta.key]: v }))}
                                        loading={analyzing}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Output Section */}
                <AnimatePresence>
                    {analyzed && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            style={{ marginTop: 32 }}
                        >
                            <div className="cyber-line" style={{ marginBottom: 28 }} />

                            {/* Variant Tabs */}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                                {VARIANT_TABS.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveVariant(tab.id)}
                                        style={{
                                            padding: '9px 18px', borderRadius: 50, fontSize: 13, fontWeight: 700,
                                            cursor: 'pointer',
                                            border: `1px solid ${activeVariant === tab.id ? tab.color : 'rgba(255,255,255,0.1)'}`,
                                            background: activeVariant === tab.id ? `${tab.color}15` : 'transparent',
                                            color: activeVariant === tab.id ? tab.color : 'rgba(255,255,255,0.4)',
                                            transition: 'all 0.2s',
                                            boxShadow: activeVariant === tab.id ? `0 0 16px ${tab.color}33` : 'none',
                                        }}>
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Prompt Display */}
                            <div className="code-block" style={{ maxHeight: 340, overflowY: 'auto', fontSize: 13.5, lineHeight: 1.7 }}>
                                {prompt}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{prompt.length} ký tự</span>
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                                    {activeVariant === 'galaxy4d' ? '🌌 VIBE Galaxy 4D' : activeVariant === 'cinematic' ? '🎬 Cinematic Epic' : '⚡ Original'}
                                </span>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                                <button
                                    onClick={handleCopy}
                                    className="btn-magnetic"
                                    style={{ flex: 1, padding: '14px', fontSize: 15 }}
                                >
                                    {copied ? '✅ Đã Copy!' : '📋 Copy Stellar Prompt'}
                                </button>
                                <button
                                    onClick={() => { setImagePreview(null); setImageBase64(null); setAnalyzed(false); setComponents(DEFAULT_COMPONENTS); }}
                                    className="btn-ghost"
                                    style={{ padding: '14px 20px', fontSize: 14 }}
                                >
                                    🔄 Upload ảnh mới
                                </button>
                            </div>

                            {/* Info */}
                            <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(123,47,255,0.07)', border: '1px solid rgba(123,47,255,0.2)', borderRadius: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                                🌌 <strong style={{ color: '#7b2fff' }}>Stellar Prompt</strong> đã được tối ưu cho Midjourney v6, DALL-E 3, và Stable Diffusion XL.
                                Chỉnh sửa từng thẻ ở trên để tinh chỉnh kết quả trước khi copy.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </section>
    );
}
