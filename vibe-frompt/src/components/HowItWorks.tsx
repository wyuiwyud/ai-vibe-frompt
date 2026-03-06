'use client';

import { motion } from 'framer-motion';

const STEPS = [
    { num: '01', icon: '🧭', title: 'Chọn Công Cụ', desc: 'Chọn Prompt Builder, Visual Inverse, hay Landing Builder tùy theo nhu cầu của bạn.', color: '#00f5ff' },
    { num: '02', icon: '⚙️', title: 'Nhập Thông Tin', desc: 'Điền form đơn giản (4-8 fields), upload ảnh, hay mô tả ý tưởng landing page.', color: '#7b2fff' },
    { num: '03', icon: '⚡', title: 'AI Xử Lý', desc: 'AI tự động tối ưu content, phân tích ảnh, hoặc xây dựng từng bước landing page.', color: '#ff00cc' },
    { num: '04', icon: '🚀', title: 'Copy & Deploy', desc: 'Copy prompt vào AI, download landing page, hoặc sử dụng ngay – chức năng gì cũng có.', color: '#00ffaa' },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="section">
            <div className="container">
                <div className="cyber-line" style={{ marginBottom: 80 }} />

                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 60 }}>
                    <div className="badge badge-cyan" style={{ marginBottom: 16 }}>Cách Hoạt Động</div>
                    <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: 12 }}>
                        4 Bước. <span className="text-gradient">1 Phút.</span> Xong.
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>Không cần học prompt engineering. Chỉ cần ý tưởng.</p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, position: 'relative' }}>
                    {/* Connector line */}
                    <div style={{ position: 'absolute', top: 40, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.2), rgba(123,47,255,0.2), rgba(255,0,204,0.2), transparent)', display: 'none' }} />

                    {STEPS.map((step, i) => (
                        <motion.div key={step.num}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.12 }}
                        >
                            <div style={{ textAlign: 'center', padding: '32px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
                                {/* Number watermark */}
                                <div style={{ position: 'absolute', top: -10, right: 16, fontSize: 80, fontWeight: 900, color: `${step.color}08`, lineHeight: 1 }}>{step.num}</div>
                                {/* Step number pill */}
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 20, background: `${step.color}15`, border: `1px solid ${step.color}33`, fontSize: 28, marginBottom: 20 }}>
                                    {step.icon}
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: step.color, letterSpacing: '0.1em', marginBottom: 8 }}>BƯỚC {step.num}</div>
                                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{step.title}</div>
                                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{step.desc}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }} style={{ textAlign: 'center', marginTop: 56 }}>
                    <a href="#categories" className="btn-magnetic" style={{ fontSize: 17 }}>
                        🚀 Thử Ngay – Miễn Phí
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
