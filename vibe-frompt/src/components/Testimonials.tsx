'use client';

import { motion } from 'framer-motion';

const TESTIMONIALS = [
    {
        name: 'Phương Linh', role: 'Content Creator · HCM', avatar: '👩‍💻',
        text: 'Trước đây mình mất 20 phút để viết 1 cái prompt cho ChatGPT. Giờ dùng VIBE Frompt chỉ cần 30 giây, output cũng tốt hơn hẳn!',
        score: 5, tag: 'Viết Lách',
    },
    {
        name: 'Minh Khoa', role: 'Full-stack Developer · Hà Nội', avatar: '👨‍💻',
        text: 'Tôi hay dùng cho coding prompts. Nó tự thêm context về architecture pattern, error handling – những thứ tôi hay quên mention.',
        score: 5, tag: 'Lập Trình',
    },
    {
        name: 'Thanh Trúc', role: 'Marketing Manager', avatar: '👩‍🎨',
        text: 'Phần Prompt Score Meter rất hay – nó giúp mình biết prompt đã đủ cụ thể chưa trước khi paste vào AI. Game changer!',
        score: 5, tag: 'Viết Lách',
    },
    {
        name: 'Đức Anh', role: 'Data Analyst · Đà Nẵng', avatar: '📊',
        text: 'Dùng cho data analysis prompt. Template xử lý dữ liệu rất chuẩn, tự thêm yêu cầu về output format và visualization.',
        score: 5, tag: 'Xử Lý Dữ Liệu',
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
                        <span className="text-gradient">10.000+ Người Việt</span> Đã Vibe
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>Từ sinh viên đến marketer, developer đến data analyst</p>
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
