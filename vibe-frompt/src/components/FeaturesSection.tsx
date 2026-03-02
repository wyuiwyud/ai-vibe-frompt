'use client';

import { motion } from 'framer-motion';

const FEATURES = [
    {
        icon: '⚡', title: 'Smart Prompt Builder',
        desc: 'Form tối ưu cho Writing, Coding, Image. Build prompt chất lượng trong vài giây, không cần kỹ năng prompt engineering.',
        color: '#00f5ff',
    },
    {
        icon: '🎯', title: 'Prompt Quality Score',
        desc: 'Tự động chấm điểm Clarity, Structure, Creativity. Biết ngay prompt của bạn chuẩn professional hay cần cải thiện.',
        color: '#7b2fff',
    },
    {
        icon: '🖼️', title: 'Visual Inverse Engine',
        desc: 'Upload ảnh, AI phân tích thành từng thành phần (subject, environment, cinematography, style) để tái tạo hoặc nâng cấp.',
        color: '#ff6633',
    },
    {
        icon: '🏗️', title: 'AI Landing Page Builder',
        desc: '5 bước từ ý tưởng đến landing page MVP. Tự động tạo strategy, structure, optimization, finalize – sẵn sàng deploy.',
        color: '#ff00cc',
    },
    {
        icon: '🎨', title: 'Galaxy 4D & Cinematic Styles',
        desc: 'Signature styles của VIBE: Galaxy 4D (cosmic nebula aesthetic) và Cinematic Epic (Hollywood blockbuster quality).',
        color: '#00ffaa',
    },
    {
        icon: '💾', title: 'Save & Reuse',
        desc: 'Lưu prompt, template, và landing page drafts. Tái sử dụng và cải tiến dần dần.',
        color: '#ffd700',
    },
];

export default function FeaturesSection() {
    return (
        <section className="section" style={{ paddingTop: 80 }}>
            <div className="container">
                <div className="cyber-line" style={{ marginBottom: 80 }} />

                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 56 }}>
                    <div className="badge badge-cyan" style={{ marginBottom: 16 }}>Tính Năng</div>
                    <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: 16 }}>
                        Tại Sao Chọn <span className="text-gradient">VIBE Frompt?</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto', fontSize: 16, lineHeight: 1.6 }}>
                        Bộ công cụ AI toàn diện: từ Build Prompt, Visual Analysis, đến Landing Page. Mọi thứ bạn cần để làm việc ngon hơn, nhanh hơn.
                    </p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                    {FEATURES.map((f, i) => (
                        <motion.div key={f.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            whileHover={{ y: -6 }}
                        >
                            <div style={{
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: 20, padding: '28px 24px', height: '100%',
                                transition: 'border-color 0.3s, box-shadow 0.3s', cursor: 'default',
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${f.color}44`; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${f.color}15`; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                            >
                                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${f.color}15`, border: `1px solid ${f.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>
                                    {f.icon}
                                </div>
                                <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{f.title}</div>
                                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{f.desc}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
