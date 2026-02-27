'use client';

import { motion } from 'framer-motion';

export default function Footer() {
    return (
        <footer style={{ padding: '60px 0 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40, marginBottom: 52 }}>
                    {/* Brand */}
                    <div>
                        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
                            <span className="text-gradient">VIBE</span>
                            <span style={{ color: '#fff', opacity: 0.9 }}> Frompt</span>
                        </div>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 20, maxWidth: 240 }}>
                            AI Amplifier cho người Việt. Biến ý tưởng thành công cụ làm việc mỗi ngày.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {['🇻🇳', '💬', '📘'].map((icon, i) => (
                                <button key={i} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}>
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Sản Phẩm</div>
                        {['Tạo Prompt', 'Prompt Library', 'Prompt Packs', 'API cho Developer'].map(item => (
                            <div key={item} style={{ marginBottom: 10 }}>
                                <a href="#" style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#00f5ff')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>
                                    {item}
                                </a>
                            </div>
                        ))}
                    </div>

                    {/* Resources */}
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Tài Nguyên</div>
                        {['Prompt Guide VN', 'Blog AI Tips', 'Community', 'Changelog'].map(item => (
                            <div key={item} style={{ marginBottom: 10 }}>
                                <a href="#" style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#00f5ff')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>
                                    {item}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Prompt Pack Banner */}
                <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true }}
                    style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: 16, padding: '20px 24px', marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>🎁 Weekly Prompt Pack</div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>20 prompt viral TikTok + 10 prompt viết CV + 15 prompt bán hàng</div>
                    </div>
                    <button className="btn-ghost" style={{ padding: '10px 24px', fontSize: 14, whiteSpace: 'nowrap' }}>
                        Nhận miễn phí →
                    </button>
                </motion.div>

                <div className="cyber-line" style={{ marginBottom: 28 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>© 2026 VIBE Frompt · Made with 💜 for người Việt</div>
                    <div style={{ display: 'flex', gap: 20 }}>
                        {['Privacy', 'Terms', 'Contact'].map(l => (
                            <a key={l} href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>{l}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
