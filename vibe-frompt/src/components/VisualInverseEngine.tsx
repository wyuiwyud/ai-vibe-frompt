'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Components {
    subject: string;
    environment: string;
    layout: string;
    text: string;
    cinematography: string;
    style: string;
}

const DEFAULT_COMPONENTS: Components = {
    subject: '',
    environment: '',
    layout: '',
    text: '',
    cinematography: '',
    style: '',
};

const COMPONENT_META: { key: keyof Components; label: string; icon: string; color: string; hint: string }[] = [
    { key: 'subject', label: 'Chủ thể', icon: '👤', color: '#00f5ff', hint: 'Nhân vật chính, dáng pose, trang phục, cảm xúc...' },
    { key: 'environment', label: 'Bối cảnh', icon: '🌍', color: '#7b2fff', hint: 'Địa điểm, ánh sáng nền, bầu không khí, độ sâu...' },
    { key: 'layout', label: 'Bố cục & Sắp xếp', icon: '📐', color: '#33ffaa', hint: 'Quy tắc 1/3, vị trí chính phụ, sự cân bằng khối...' },
    { key: 'text', label: 'Văn bản & Thông tin', icon: '📝', color: '#ffff33', hint: 'Slogan, logo, văn hiệu, các chi tiết ký tự...' },
    { key: 'cinematography', label: 'Ống kính & Ánh sáng', icon: '🎬', color: '#ff6633', hint: 'Góc máy, tiêu cự, ánh sáng kỹ thuật, DOF...' },
    { key: 'style', label: 'Phong cách & Màu sắc', icon: '🎨', color: '#ff00cc', hint: 'Bảng màu, chất liệu, tone màu, phong cách họa sĩ...' },
];

type Variant = 'original' | 'galaxy4d' | 'cinematic';

function buildPrompt(components: Components, variant: Variant): string {
    const s = components.subject;
    const e = components.environment;
    const l = components.layout;
    const t = components.text;
    const c = components.cinematography;
    const st = components.style;

    if (variant === 'original') {
        return `[VAI TRÒ]
Bạn là chuyên gia về AI Image Generation, chuyên tái tạo hình ảnh với độ tương đồng 99%.

[NHIỆM VỤ]
Tạo hình ảnh theo đúng mô tả sau, tái tạo chính xác "linh hồn" của ảnh gốc.

[BỐI CẢNH — CHỦ THỂ]
${s}

[BỐI CẢNH — KHÔNG GIAN]
${e}

[BỐI CẢNH — BỐ CỤC]
${l}

[BỐI CẢNH — VĂN BẢN]
${t}

[BỐI CẢNH — KỸ THUẬT]
${c}

[BỐI CẢNH — PHONG CÁCH]
${st}

[VÍ DỤ]
Ultra-detailed, professional quality, masterpiece.

[CHỈ DẪN]
Tái tạo với độ trung thực tối đa. Giữ trọn vẹn các yếu tố thị giác, ánh sáng và bầu không khí. --ar 16:9 --v 6 --style raw --stylize 150

[LOẠI BỎ]
blurry, low quality, watermark, distorted, text`.trim();
    }

    if (variant === 'galaxy4d') {
        return `[VAI TRÒ]
Bạn là AI Image Artist chuyên phong cách Galaxy 4D/Cosmic Cinematic của VIBE Frompt.

[NHIỆM VỤ]
Tái tạo hình ảnh với phong cách Galaxy 4D đặc trưng:
- Nền vũ trụ sâu thẳm với Nebula Purple (#7b2fff) và Stardust Cyan (#00f5ff)
- Ánh sáng huyền bí từ sao và thiên thể
- Hiệu ứng bokeh hạt sao lấp lánh

[BỐI CẢNH — CHỦ THỂ]
${s}

[BỐI CẢNH — KHÔNG GIAN]
${e}, dưới đây là bầu trời thiên hà Nebula Purple, ánh sáng Stardust Cyan tỏa ra xung quanh, bokeh sao lấp lánh

[BỐI CẢNH — KỸ THUẬT]
${c}, volumetric nebula lighting, anamorphic lens flare

[BỐI CẢNH — PHONG CÁCH]
Galaxy 4D aesthetic, ${st}, cosmic color grading with deep purple and cyan tones, Nebula Glow overlay

[CHỈ DẪN]
Áp dụng phong cách Galaxy 4D độc bản của VIBE Frompt. Thêm các hạt tinh vân, bokeh vũ trụ và ánh sáng viền huyền ảo. --ar 16:9 --v 6 --style raw --stylize 200

[LOẠI BỎ]
bland colors, no glow, overexposed, washed out`.trim();
    }

    // cinematic epic
    return `[VAI TRÒ]
Bạn là Cinematographer AI siêu cấp, chuyên gia về hình ảnh điện ảnh Hollywood AAA.

[NHIỆM VỤ]
Nâng cấp hình ảnh lên cấp độ EPIC CINEMATIC — hoành tráng, đột phá thị giác, như cảnh phim bom tấn Hollywood.

[BỐI CẢNH — CHỦ THỂ]
${s}, được tăng cường với tư thế động, sự hiện diện mạnh mẽ, hero lighting

[BỐI CẢNH — KHÔNG GIAN]
${e}, mở rộng quy mô hoành tráng, hiệu ứng thời tiết kịch tính (sét/bão/lửa), god rays, độ sâu điện ảnh

[BỐI CẢNH — KỸ THUẬT]
${c}, góc máy kịch tính cực độ, anamorphic widescreen, ánh sáng tương phản cao, Dolby Vision HDR

[BỐI CẢNH — PHONG CÁCH]
Epic cinematic, ${st}, Hollywood grade color grading, lens flares, volumetric fog, cinematic bloom, IMAX quality

[CHỈ DẪN]
Làm cho nó trở nên hoành tráng (EPIC). Tối đa tính kịch tính, tác động thị giác mạnh mẽ, chất lượng phim AAA. --ar 21:9 --v 6 --style cinematic --stylize 250

[LOẠI BỎ]
boring, flat lighting, ordinary, amateur, low contrast`.trim();
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
                background: focused ? `${meta.color}11` : 'rgba(255,255,255,0.03)',
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
    { id: 'original', label: 'Nguyên bản', icon: '⚡', color: '#00f5ff' },
    { id: 'galaxy4d', label: 'Galaxy 4D', icon: '🌌', color: '#7b2fff' },
    { id: 'cinematic', label: 'Điện ảnh (Epic)', icon: '🎬', color: '#ff6633' },
];

export default function VisualInverseEngine() {
    const [dragOver, setDragOver] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [mimeType, setMimeType] = useState('image/jpeg');
    const [components, setComponents] = useState<Components>(DEFAULT_COMPONENTS);
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzed, setAnalyzed] = useState(false);
    const [generatingPrompt, setGeneratingPrompt] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [generatedPrompts, setGeneratedPrompts] = useState<{ master: string; galaxy4d: string; cinematic: string } | null>(null);
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
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, w, h);
                    const compressed = canvas.toDataURL('image/jpeg', 0.65);
                    setImageBase64(compressed.split(',')[1]);
                    setMimeType('image/jpeg');
                    setComponents(DEFAULT_COMPONENTS);
                    setAnalyzed(false);
                    setShowPrompt(false);
                    setError(null);
                }
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

    const handleGeneratePrompt = async () => {
        if (!imageBase64 || !analyzed) return;
        setGeneratingPrompt(true);
        setError(null);
        console.log('[Vision] Phase 2: Starting Deep Synthesis (6 layers)...');
        try {
            const res = await fetch('/api/vision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'generate_final',
                    imageBase64,
                    mimeType,
                    components,
                }),
            });
            const data = await res.json() as { prompts?: { master: string; galaxy4d: string; cinematic: string }; error?: string };
            if (!res.ok || !data.prompts) throw new Error(data.error || 'Lỗi khi tạo prompt cuối.');

            setGeneratedPrompts(data.prompts);
            setShowPrompt(true);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setGeneratingPrompt(false);
        }
    };

    const prompt = (showPrompt && generatedPrompts)
        ? (activeVariant === 'galaxy4d' ? generatedPrompts.galaxy4d : activeVariant === 'cinematic' ? generatedPrompts.cinematic : generatedPrompts.master)
        : '';

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
                        Upload ảnh → AI bóc tách 6 lớp chuyên sâu → Chỉnh sửa → Tái tạo bằng Midjourney/DALL-E
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
                                    <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 6 }}>Tải ảnh lên hoặc Kéo thả vào đây</div>
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
                                <div style={{ fontSize: 12, color: '#ff9900', fontWeight: 700, marginBottom: 8 }}>✍️ Mô tả Ảnh (AI Vision đang bận)</div>
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
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>Groq sẽ sinh 4 lớp phân tích từ mô tả này</div>
                            </motion.div>
                        )}

                        {/* Error */}
                        {error && (
                            <div style={{ padding: '12px 16px', background: 'rgba(255,102,51,0.08)', border: '1px solid rgba(255,102,51,0.25)', borderRadius: 12, fontSize: 13, color: '#ff6633' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Tip */}
                        {!imagePreview && (
                            <div style={{ padding: '14px 16px', background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.12)', borderRadius: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                                💡 <strong style={{ color: '#00f5ff' }}>Cách dùng:</strong> Tải ảnh mẫu → AI bóc tách <strong style={{ color: '#fff' }}>6 lớp chuyên sâu</strong> (Chủ thể, Bối cảnh, Bố cục, Văn bản, Kỹ thuật, Style) → Chỉnh sửa → AI tổng hợp thành Master Prompt siêu chi tiết.
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {analyzed && (
                            <motion.div
                                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                    gap: 16,
                                    marginTop: 20
                                }}
                            >
                                {COMPONENT_META.map((meta) => (
                                    <EditableCard
                                        key={meta.key}
                                        meta={meta}
                                        value={components[meta.key]}
                                        onChange={(v) => {
                                            setComponents(prev => ({ ...prev, [meta.key]: v }));
                                            setShowPrompt(false); // Reset prompt if user edits
                                        }}
                                        loading={analyzing}
                                    />
                                ))}

                                {/* Toggle Prompt Button */}
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: (analyzing || generatingPrompt) ? 1 : 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGeneratePrompt}
                                    disabled={analyzing || generatingPrompt}
                                    className="btn-magnetic"
                                    style={{
                                        width: '100%',
                                        marginTop: 8,
                                        padding: '16px',
                                        fontSize: 16,
                                        background: 'linear-gradient(135deg, #00f5ff 0%, #7b2fff 100%)',
                                        color: '#000',
                                        fontWeight: 800,
                                        boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)',
                                        opacity: (analyzing || generatingPrompt) ? 0.7 : 1,
                                        cursor: (analyzing || generatingPrompt) ? 'wait' : 'pointer'
                                    }}
                                >
                                    {generatingPrompt ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                                            <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                            AI đang tạo Master Prompt chuyên sâu...
                                        </span>
                                    ) : (
                                        '🚀 Tạo Master Prompt Chuyên Sâu'
                                    )}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Output Section */}
                <AnimatePresence>
                    {showPrompt && (
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
                                    {activeVariant === 'galaxy4d' ? '🌌 VIBE Galaxy 4D' : activeVariant === 'cinematic' ? '🎬 Điện ảnh Epic' : '⚡ Nguyên bản'}
                                </span>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                                <button
                                    onClick={handleCopy}
                                    className="btn-magnetic"
                                    style={{ flex: 1, padding: '14px', fontSize: 15 }}
                                >
                                    {copied ? '✅ Đã Sao chép!' : '📋 Sao chép Prompt'}
                                </button>
                                <button
                                    onClick={() => {
                                        setImagePreview(null);
                                        setImageBase64(null);
                                        setAnalyzed(false);
                                        setShowPrompt(false);
                                        setComponents(DEFAULT_COMPONENTS);
                                    }}
                                    className="btn-ghost"
                                    style={{ padding: '14px 20px', fontSize: 14 }}
                                >
                                    🔄 Làm mới
                                </button>
                            </div>

                            {/* Info */}
                            <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(123,47,255,0.07)', border: '1px solid rgba(123,47,255,0.2)', borderRadius: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                                🌌 <strong style={{ color: '#7b2fff' }}>Stellar Prompt</strong> đã được tối ưu cho Midjourney v6, DALL-E 3, và Stable Diffusion XL.
                                Bạn có thể chỉnh sửa các lớp phân tích ở trên để tinh chỉnh kết quả trước khi sao chép.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </section>
    );
}
