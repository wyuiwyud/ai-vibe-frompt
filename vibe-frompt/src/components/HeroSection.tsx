'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    color: string;
    dx: number;
    dy: number;
}

// Seed-based pseudo-random number generator for consistent results
function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

const DEMO_LINES = [
    { raw: '"Viết bài về kinh tế số Việt Nam"', out: '' },
    { raw: '', out: 'Bạn là chuyên gia viết nội dung...' },
    { raw: '', out: '📌 CHỦ ĐỀ: Kinh tế số Việt Nam' },
    { raw: '', out: '🎯 Giọng văn: Chuyên nghiệp' },
    { raw: '', out: '📝 Độ dài: 400–500 từ, SEO chuẩn' },
    { raw: '', out: '✨ 218 từ · Cấu trúc chuyên gia · Ví dụ VN' },
];

function generateParticles(): Particle[] {
    return Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: seededRandom(i * 1.5) * 100,
        y: seededRandom(i * 2.7) * 100,
        size: seededRandom(i * 3.3) * 3 + 1,
        duration: seededRandom(i * 4.1) * 6 + 6,
        delay: seededRandom(i * 5.9) * 4,
        color: i % 3 === 0 ? '#00f5ff' : i % 3 === 1 ? '#ff00cc' : '#7b2fff',
        dx: (seededRandom(i * 7.1) - 0.5) * 60,
        dy: -(seededRandom(i * 8.3) * 60 + 20),
    }));
}

export default function HeroSection() {
    const [particles] = useState<Particle[]>(generateParticles);
    const [demoLine, setDemoLine] = useState(0);
    const [isGlitch, setIsGlitch] = useState(false);
    const heroRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef });
    const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

    // Demo line interval with proper cleanup
    useEffect(() => {
        const id = setInterval(() => {
            setDemoLine(prev => (prev + 1) % DEMO_LINES.length);
        }, 1800);
        return () => clearInterval(id);
    }, []);

    // Easter egg
    const handleLogoDoubleClick = () => {
        setIsGlitch(true);
        setTimeout(() => setIsGlitch(false), 500);
    };

    return (
        <section ref={heroRef} suppressHydrationWarning style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '120px 24px 80px' }}>
            {/* Animated background orbs */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <motion.div style={({ position: 'absolute', top: '20%', left: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,245,255,0.08) 0%, transparent 70%)', filter: 'blur(40px)', y }) as React.CSSProperties} />
                <motion.div style={({ position: 'absolute', top: '40%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,0,204,0.07) 0%, transparent 70%)', filter: 'blur(40px)', y: useTransform(scrollYProgress, [0, 1], [0, -60]) }) as React.CSSProperties} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,47,255,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
                {/* Pulse rings */}
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${i})`, width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(0,245,255,0.06)', animation: `pulseRing ${3 + i}s ease-out ${i * 0.8}s infinite` }} />
                ))}
                {/* Floating particles */}
                {particles.map(p => (
                    <div key={p.id} className="particle" style={{
                        left: `${p.x}%`, top: `${p.y}%`,
                        width: p.size, height: p.size,
                        background: p.color,
                        '--duration': `${p.duration}s`,
                        '--delay': `${p.delay}s`,
                        '--dx1': `${p.dx}px`, '--dy1': `${p.dy}px`,
                        '--dx2': `${p.dx * 0.7}px`, '--dy2': `${p.dy * 1.5}px`,
                        '--dx3': `${p.dx * 1.3}px`, '--dy3': `${p.dy * 0.8}px`,
                        opacity: 0.4,
                    } as React.CSSProperties} />
                ))}
            </div>

            <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 900 }}>
                {/* Badge */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={({ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32 }) as React.CSSProperties}>
                    <span className="badge badge-cyan">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00f5ff', animation: 'pulseRing 1.5s ease-out infinite', display: 'inline-block' }} />
                        AI Amplifier · 2026
                    </span>
                </motion.div>

                {/* Logo / Title */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
                    <h1
                        className={isGlitch ? 'glitch' : ''}
                        onDoubleClick={handleLogoDoubleClick}
                        style={{ fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 800, lineHeight: 1, marginBottom: 16, letterSpacing: '-0.02em', cursor: 'pointer' }}
                    >
                        <span className="text-gradient">VIBE</span>
                        <span style={{ color: '#fff', opacity: 0.9 }}> Frompt</span>
                    </h1>
                </motion.div>

                {/* Subtitle */}
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} style={({ fontSize: 'clamp(18px, 2.5vw, 24px)', color: 'rgba(255,255,255,0.7)', marginBottom: 12, fontWeight: 300, lineHeight: 1.5 }) as React.CSSProperties}>
                    Vibe Your Prompt – AI Hiểu Ý Bạn Chuẩn{' '}
                    <span style={{ color: '#00f5ff', fontWeight: 600 }}>100%</span>
                </motion.p>

                {/* Stats */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={({ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 48, flexWrap: 'wrap' }) as React.CSSProperties}>
                    {[
                        { n: '10.000+', label: 'người Việt đã dùng' },
                        { n: '70%', label: 'tiết kiệm thời gian' },
                        { n: '4.9★', label: 'đánh giá trung bình' },
                    ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#00f5ff' }}>{s.n}</div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{s.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Mini Demo Block */}
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35 }} style={({ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '20px 28px', marginBottom: 44, backdropFilter: 'blur(20px)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, textAlign: 'left', maxWidth: 680, margin: '0 auto 44px' }) as React.CSSProperties}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>💭 Raw Idea</div>
                        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', minHeight: 24, fontStyle: 'italic' }}>
                            {demoLine === 0 ? DEMO_LINES[0].raw : '"Viết bài về kinh tế số Việt Nam"'}
                        </div>
                    </div>
                    <div style={{ borderLeft: '1px solid rgba(0,245,255,0.15)', paddingLeft: 20 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#00f5ff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>✨ Optimized Prompt</div>
                        <motion.div key={demoLine} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} style={({ fontSize: 13, color: 'rgba(255,255,255,0.8)', minHeight: 24, lineHeight: 1.5 }) as React.CSSProperties}>
                            {DEMO_LINES[Math.max(1, demoLine)].out || DEMO_LINES[1].out}
                        </motion.div>
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} style={({ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }) as React.CSSProperties}>
                    <a href="#categories" className="btn-magnetic" style={{ fontSize: 17 }}>
                        ⚡ Tạo Prompt Ngay
                    </a>
                    <a href="#how-it-works" className="btn-ghost">
                        Xem thử mẫu →
                    </a>
                </motion.div>
            </div>

            {/* Bottom gradient fade */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to bottom, transparent, rgba(3,0,16,0.8))', pointerEvents: 'none' }} />
        </section>
    );
}
