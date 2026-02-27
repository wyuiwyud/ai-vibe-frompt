'use client';

import { useEffect, useRef } from 'react';

export default function CursorSpotlight() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const spotlightRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        const onMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (dotRef.current) {
                dotRef.current.style.left = `${mouseX - 4}px`;
                dotRef.current.style.top = `${mouseY - 4}px`;
            }

            if (spotlightRef.current) {
                const xPercent = (mouseX / window.innerWidth) * 100;
                const yPercent = (mouseY / window.innerHeight) * 100;
                spotlightRef.current.style.setProperty('--spotlight-x', `${xPercent}%`);
                spotlightRef.current.style.setProperty('--spotlight-y', `${yPercent}%`);
            }
        };

        const animate = () => {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;

            if (ringRef.current) {
                ringRef.current.style.left = `${ringX - 16}px`;
                ringRef.current.style.top = `${ringY - 16}px`;
            }
            requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', onMove);
        animate();
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    return (
        <>
            <div ref={dotRef} className="cursor-dot" />
            <div ref={ringRef} className="cursor-ring" />
            <div ref={spotlightRef} className="spotlight" />
        </>
    );
}
