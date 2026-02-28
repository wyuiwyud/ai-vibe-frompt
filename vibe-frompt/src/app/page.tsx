'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CursorSpotlight from '@/components/CursorSpotlight';
import HeroSection from '@/components/HeroSection';
import CategoryGrid from '@/components/CategoryGrid';
import DynamicForm, { type FormFields } from '@/components/DynamicForm';
import PromptOutput from '@/components/PromptOutput';
import VisualInverseEngine from '@/components/VisualInverseEngine';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import { LandingBuilderWizard } from '@/features/landing-builder/LandingBuilderWizard';
import { buildPrompt, calculateScore, type FormData, type Category } from '@/lib/promptTemplates';

const PROMPT_CATEGORIES: Category[] = ['writing', 'coding', 'image'];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('writing');
  const [prompt, setPrompt] = useState<string>('');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [scores, setScores] = useState({ clarity: 88, structure: 84, creativity: 90 });

  const handleBuildPrompt = async (fields: FormFields) => {
    setIsBuilding(true);
    setShowOutput(false);

    // Map FormFields → FormData for the API call
    const data: FormData = {
      category: fields.category,
      topic: fields.topic,
      language: fields.language,
      tone: fields.tone,
      format: fields.format,
      audience: fields.audience,
      codeLanguage: fields.codeLanguage,
      framework: fields.framework,
      requirement: fields.requirement,
      style: fields.style,
      aspectRatio: fields.aspectRatio,
      detailLevel: fields.detailLevel,
    };

    const result = await buildPrompt(data);
    setPrompt(result);
    setFormData(data);
    setScores(calculateScore(data));
    setIsBuilding(false);
    setShowOutput(true);

    setTimeout(() => {
      document.getElementById('output-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleEdit = () => {
    setShowOutput(false);
    setTimeout(() => {
      document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <main style={{ position: 'relative', minHeight: '100vh', color: '#fff', overflowX: 'hidden' }} suppressHydrationWarning>
      <CursorSpotlight />

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(3,0,16,0.7)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>
            <span className="text-gradient">VIBE</span>
            <span style={{ color: '#fff' }}> Frompt</span>
          </span>
          <span className="badge badge-cyan" style={{ fontSize: 10, padding: '2px 8px' }}>BETA</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Hướng dẫn</a>
          <a href="#categories" className="btn-magnetic" style={{ padding: '8px 20px', fontSize: 14 }}>⚡ Tạo Prompt</a>
        </div>
      </nav>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <HeroSection />

        <CategoryGrid
          selected={selectedCategory}
          onSelect={(id) => setSelectedCategory(id)}
        />

        {/* Prompt Form */}
        {PROMPT_CATEGORIES.includes(selectedCategory as Category) && (
          <DynamicForm
            category={selectedCategory as Category}
            onBuildPrompt={handleBuildPrompt}
            isBuilding={isBuilding}
          />
        )}

        {/* Visual Inverse Engine */}
        <AnimatePresence>
          {selectedCategory === 'visual-inverse' && (
            <motion.div
              key="visual-inverse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <VisualInverseEngine />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Landing Builder */}
        <div id="landing-builder">
          <LandingBuilderWizard />
        </div>

        {/* Building overlay */}
        <AnimatePresence>
          {isBuilding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(3,0,16,0.85)', backdropFilter: 'blur(20px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
              }}
            >
              {/* Animated rings */}
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  position: 'absolute',
                  width: 120 + i * 80,
                  height: 120 + i * 80,
                  borderRadius: '50%',
                  border: `1px solid rgba(0,245,255,${0.15 - i * 0.04})`,
                  animation: `pulseRing ${2 + i}s ease-out ${i * 0.5}s infinite`,
                }} />
              ))}
              <div style={{ fontSize: 40 }}>🧠</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#00f5ff', marginBottom: 8 }}>AI đang tạo Prompt...</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>MVPI CE Framework · RTCE+I Structure</div>
              </div>
              <div style={{ width: 220, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                  style={{ height: '100%', width: '50%', background: 'linear-gradient(90deg, transparent, #00f5ff, #7b2fff, transparent)', borderRadius: 2 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prompt Output */}
        <AnimatePresence>
          {showOutput && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PromptOutput prompt={prompt} formData={formData} scores={scores} onEdit={handleEdit} />
            </motion.div>
          )}
        </AnimatePresence>

        <FeaturesSection />
        <HowItWorks />
        <Testimonials />
        <Footer />
      </div>
    </main>
  );
}
