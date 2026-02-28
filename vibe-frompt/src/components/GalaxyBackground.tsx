'use client';

import React, { useEffect, useState } from 'react';

// Seed-based pseudo-random number generator for consistent results
function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

const GalaxyBackground: React.FC = () => {
    const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Generate stars with seeded randomness for consistency between server and client
        const newStars = Array.from({ length: 150 }).map((_, i) => ({
            id: i,
            x: seededRandom(i * 1.5) * 100,
            y: seededRandom(i * 2.7) * 100,
            size: seededRandom(i * 3.3) * 2 + 1,
            duration: seededRandom(i * 4.1) * 5 + 5,
            delay: seededRandom(i * 5.9) * 10,
        }));
        setStars(newStars);
        setIsMounted(true);
    }, []);

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#030010] pointer-events-none">
            {/* Deep Cosmos Layer */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0f001f_0%,#030010_100%)]" />

            {/* Nebula Clouds */}
            <div
                className="nebula-glow absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 mix-blend-screen"
                style={{ '--orbit-radius': '50px', '--orbit-speed': '40s' } as React.CSSProperties}
            />
            <div
                className="nebula-glow absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-cyan-600/10 mix-blend-screen"
                style={{ '--orbit-radius': '70px', '--orbit-speed': '60s' } as React.CSSProperties}
            />

            {/* Stars */}
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="absolute rounded-full bg-white opacity-0"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        boxShadow: `0 0 ${star.size * 2}px #fff`,
                        animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
                    }}
                />
            ))}

            <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>
        </div>
    );
};

export default GalaxyBackground;
