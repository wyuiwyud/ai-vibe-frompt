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
        const dx = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 12;
        const dy = ((e.clientY - rect.top - rect.height / 2) / rect.height) * 12;
        setTilt({ x: dy, y: dx });
    };

    return (
        <motion.div
            whileHover={{ y: -10 }}
            style={{ perspective: 1000, cursor: 'pointer' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
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
                    padding: '28px 20px',
                    textAlign: 'center',
                    transition: 'background 0.3s, border-color 0.3s',
                    boxShadow: active
                        ? `0 0 30px ${color}33, 0 8px 30px rgba(0,0,0,0.4)`
                        : '0 4px 20px rgba(0,0,0,0.3)',
                    transformStyle: 'preserve-3d',
                    height: 170,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                }}
            >
                <div style={{ fontSize: 36, lineHeight: 1 }}>{icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: active ? color : '#fff' }}>{title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, maxWidth: 160 }}>{description}</div>
                {active && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color, marginTop: 4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                        Đang chọn
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

const CATEGORIES = [
    {
        id: 'writing',
        icon: '✍️',
        title: 'Viết Lách',
        description: 'Blog, SEO, copywriting, social media',
        color: '#00f5ff',
    },
    {
        id: 'visual-inverse',
        icon: '🎞️',
        title: 'Visual Inverse',
        description: 'Upload ảnh → AI bóc tách 4 lớp → Tái tạo chuẩn xác',
        color: '#ff6633',
    },
    {
        id: 'landing-builder',
        icon: '🚀',
        title: 'Landing Page Builder',
        description: 'Ý tưởng → Landing page MVP trong 3 phút',
        color: '#ffd700',
    },
];

interface CategoryGridProps {
    selected: string;
    onSelect: (id: string) => void;
}

export default function CategoryGrid({ selected, onSelect }: CategoryGridProps) {
    return (
        <section id="categories" className="section" style={{ paddingTop: 60 }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: 48 }}
                >
                    <div className="badge badge-cyan" style={{ marginBottom: 16 }}>Bước 1 / 3</div>
                    <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: 12 }}>
                        Chọn <span className="text-gradient">Loại Prompt</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, maxWidth: 400, margin: '0 auto' }}>
                        Chọn danh mục phù hợp với nhu cầu của bạn
                    </p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
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
                                        setTimeout(() => document.getElementById('landing-builder')?.scrollIntoView({ behavior: 'smooth' }), 100);
                                    } else {
                                        setTimeout(() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                                    }
                                }}
                            />
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }} transition={{ duration: 1, delay: 0.4 }}
                    style={{ marginTop: 60 }}
                >
                    <div className="cyber-line" />
                </motion.div>
            </div>
        </section>
    );
}
