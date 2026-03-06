'use client';

import { motion } from 'framer-motion';

const TESTIMONIALS = [
    {
        name: 'Phương Linh', role: 'Content Creator · HCM', avatar: '👩‍💻',
        text: 'Từ trước mình mất 20 phút viết 1 prompt cho ChatGPT. Giờ dùng VIBE chỉ 30 giây, output còn tốt hơn hẳn. Nhất là Quality Score giúp mình biết prompt đã chuẩn hay không.',
        score: 5, tag: 'Prompt Builder',
    },
    {
        name: 'Minh Khoa', role: 'UI/UX Designer · Hà Nội', avatar: '👨‍💻',
        text: 'Visual Inverse Engine cứu chanh đời tôi. Upload ảnh cũ, AI phân tích xong output prompt chi tiết để tạo ảnh tương tự hay nâng cấp. Tiết kiệm hàng giờ styling.',
        score: 5, tag: 'Visual Inverse',
    },
    {
        name: 'Thanh Trúc', role: 'AI Prompt Specialist', avatar: '👩‍🎨',
        text: 'Prompt Quality Score như có mentor review từng cái. Biết ngay cần cải thiện ở đâu: structure? creativity? clarity? Tất cả trong 1 điểm.',
        score: 5, tag: 'Score Meter',
    },
    {
        name: 'Đức Anh', role: 'Startup Founder · HCM', avatar: '📊',
        text: 'Landing Builder giúp mình setup landing page từ ý tưởng thô trong 1 tiếng. Trước đó lấy 1 tuần. Wizard 5 bước guide rất logic: strategy → layout → optimize → finalize → prompt.',
        score: 5, tag: 'Landing Builder',
    },
];

export default function Testimonials() {
    return (
        <section className="section">
            <div className="container">
                <div className="cyber-line" style={{ marginBottom: 80 }} />

                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 52 }}>
                    <div className="badge badge-cyan" style={{ marginBottom: 16 }}>Người Dùng Nói Gì</div>
                    <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, marginBottom: 12 }}>
                        Users Yêu Thích <span className="text-gradient">VIBE Frompt</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>Từ content creator, designer, developer, đến startup founder</p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                    {TESTIMONIALS.map((t, i) => (
                        <motion.div key={t.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ y: -6 }}
                        >
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {/* Stars */}
                                <div style={{ display: 'flex', gap: 3 }}>
                                    {Array.from({ length: t.score }).map((_, j) => (
                                        <span key={j} style={{ color: '#ffd700', fontSize: 14 }}>★</span>
                                    ))}
                                </div>
                                {/* Quote */}
                                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, flexGrow: 1, fontStyle: 'italic' }}>
                                    &ldquo;{t.text}&rdquo;
                                </p>
                                {/* Author */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</div>
                                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{t.role}</div>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 50, background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)', color: '#00f5ff' }}>
                                        {t.tag}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
