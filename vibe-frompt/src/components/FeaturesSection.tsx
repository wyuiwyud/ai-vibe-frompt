'use client';

import { motion } from 'framer-motion';

const FEATURES = [
    {
        icon: '🧠', title: 'AI Context Engine Việt',
        desc: 'Tự động thêm ví dụ thực tế VN, văn phong chuẩn, slang phù hợp từng nhóm tuổi.',
        color: '#00f5ff',
    },
    {
        icon: '⚡', title: 'Build Prompt 3 Giây',
        desc: 'Form thông minh tối đa 8 fields, không lãng phí thời gian. Nhanh gọn hoặc nâng cao theo nhu cầu.',
        color: '#7b2fff',
    },
    {
        icon: '🎯', title: 'Prompt Score Meter',
        desc: 'Chấm điểm Clarity, Structure, Creativity. Gold badge khi prompt đạt chuẩn professional.',
        color: '#ffd700',
    },
    {
        icon: '🔄', title: 'Auto-Refine Engine',
        desc: 'Một click để tạo biến thể: Thuyết phục hơn, Kỹ thuật hơn, Cảm xúc hơn.',
        color: '#ff00cc',
    },
    {
        icon: '📚', title: 'Prompt Library',
        desc: 'Lưu, tag, và tái sử dụng prompt yêu thích. Bộ sưu tập cá nhân ngày càng mạnh hơn.',
        color: '#00ffaa',
    },
    {
        icon: '🔗', title: 'Share Prompt Card',
        desc: 'Tạo link share đẹp, auto thumbnail. Chia sẻ lên Zalo, Facebook chỉ 1 click.',
        color: '#ff6633',
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
                        Vì Sao Dùng <span className="text-gradient">VIBE Frompt?</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto', fontSize: 16, lineHeight: 1.6 }}>
                        Không chỉ là form tạo prompt. Đây là AI Amplifier – biến ý tưởng thành công cụ làm việc mạnh mẽ.
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
