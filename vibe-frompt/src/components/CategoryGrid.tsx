'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface CategoryCardProps {
    icon: string;
    title: string;
    description: string;
    id: string;
    active: boolean;
    onClick: () => void;
    color: string;
}

function CategoryCard({ icon, title, description, active, onClick, color }: CategoryCardProps) {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = ((e.clientX - cx) / rect.width) * 15;
        const dy = ((e.clientY - cy) / rect.height) * 15;
        setTilt({ x: dy, y: dx });
    };

    const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

    return (
        <motion.div
            whileHover={{ y: -12 }}
            style={{
                perspective: 1000,
                transformStyle: 'preserve-3d',
                cursor: 'pointer',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
        >
            <motion.div
                animate={{ rotateX: tilt.x, rotateY: tilt.y }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                    background: active ? `rgba(0,245,255,0.07)` : 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${active ? color : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 20,
                    padding: '28px 24px',
                    textAlign: 'center',
                    transition: 'background 0.3s, border-color 0.3s',
                    boxShadow: active ? `0 0 30px ${color}33, 0 8px 30px rgba(0,0,0,0.4)` : '0 4px 20px rgba(0,0,0,0.3)',
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* Glow rim */}
                {active && (
                    <div style={{
                        position: 'absolute', inset: -1, borderRadius: 20,
                        background: `linear-gradient(135deg, ${color}66, transparent 60%)`,
                        opacity: 0.4, pointerEvents: 'none', zIndex: -1,
                    }} />
                )}
                <div style={{ fontSize: 40, marginBottom: 14, display: 'block', transform: 'translateZ(20px)' }}>{icon}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: active ? color : '#fff', marginBottom: 8, transform: 'translateZ(15px)' }}>{title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, transform: 'translateZ(10px)' }}>{description}</div>
                {active && (
                    <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color, transform: 'translateZ(10px)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 6px ${color}` }} />
                        Đang chọn
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

const CATEGORIES = [
    { id: 'writing', icon: '✍️', title: 'Viết Lách', description: 'Blog, SEO, copywriting, social media content chuẩn', color: '#00f5ff' },
    { id: 'coding', icon: '💻', title: 'Lập Trình', description: 'Code sạch, debug, tạo mới theo kiến trúc chuẩn', color: '#7b2fff' },
    { id: 'image', icon: '🎨', title: 'Tạo Hình Ảnh', description: 'Prompt Midjourney & SDXL chuyên nghiệp', color: '#ff00cc' },
    { id: 'data', icon: '📊', title: 'Xử Lý Dữ Liệu', description: 'Phân tích, làm sạch, trực quan hóa dataset', color: '#00ffaa' },
    { id: 'landing-builder', icon: '💻✨', title: 'Landing Page Builder', description: 'Từ ý tưởng thô → landing page MVP trong 3 phút', color: '#00f5ff' },
];

interface CategoryGridProps {
    selected: string;
    onSelect: (id: string) => void;
}

export default function CategoryGrid({ selected, onSelect }: CategoryGridProps) {
    return (
        <section id="categories" className="section" style={{ paddingTop: 60 }}>
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: 48 }}
                >
                    <div className="badge badge-cyan" style={{ marginBottom: 16 }}>Bước 1 / 4</div>
                    <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: 12 }}>
                        Chọn <span className="text-gradient">Loại Prompt</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, maxWidth: 420, margin: '0 auto' }}>
                        Chọn danh mục phù hợp để form được tối ưu cho nhu cầu của bạn
                    </p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                    {CATEGORIES.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <CategoryCard
                                {...cat}
                                active={selected === cat.id}
                                onClick={() => {
                                    onSelect(cat.id);
                                    if (cat.id === 'landing-builder') {
                                        document.getElementById('landing-builder')?.scrollIntoView({ behavior: 'smooth' });
                                    } else {
                                        document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Energy connector line */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.4 }}
                    style={{ marginTop: 60 }}
                >
                    <div className="cyber-line" />
                </motion.div>
            </div>
        </section>
    );
}
