'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CursorSpotlight from '@/components/CursorSpotlight';
import HeroSection from '@/components/HeroSection';
import CategoryGrid from '@/components/CategoryGrid';
import DynamicForm from '@/components/DynamicForm';
import PromptOutput from '@/components/PromptOutput';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import { buildPrompt, type FormData, type Category } from '@/lib/promptTemplates';
import { sleep } from '@/lib/utils';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('writing');
  const [prompt, setPrompt] = useState<string>('');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleBuildPrompt = async (data: FormData) => {
    setIsBuilding(true);
    await sleep(1200);
    const result = buildPrompt(data);
    setPrompt(result);
    setFormData(data);
    setIsBuilding(false);
    setShowOutput(true);
    setTimeout(() => {
      document.getElementById('output-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleEdit = () => {
    setShowOutput(false);
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="bg-animated" style={{ position: 'relative', minHeight: '100vh', color: '#fff', overflowX: 'hidden' }}>
      <CursorSpotlight />

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 800 }}>
            <span className="text-gradient">VIBE</span>
            <span style={{ color: '#fff' }}> Frompt</span>
          </span>
          <span className="badge badge-cyan" style={{ fontSize: 10, padding: '2px 8px' }}>BETA</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Hướng dẫn</a>
          <a href="#categories" className="btn-magnetic" style={{ padding: '9px 22px', fontSize: 14 }}>Tạo Prompt</a>
        </div>
      </nav>

      {/* Main content */}
      <HeroSection />
      <CategoryGrid selected={selectedCategory} onSelect={(id) => setSelectedCategory(id as Category)} />
      <DynamicForm category={selectedCategory} onBuildPrompt={handleBuildPrompt} isBuilding={isBuilding} />

      {/* Building overlay */}
      <AnimatePresence>
        {isBuilding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
            }}
          >
            {/* Energy beam loader */}
            <div style={{ position: 'relative', width: 200, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
                style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)', borderRadius: 2 }}
              />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#00f5ff' }}>Optimizing Structure...</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>AI đang phân tích và tối ưu prompt của bạn</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt Output */}
      <AnimatePresence>
        {showOutput && (
          <motion.div ref={outputRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PromptOutput prompt={prompt} formData={formData} onEdit={handleEdit} />
          </motion.div>
        )}
      </AnimatePresence>

      <FeaturesSection />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </main>
  );
}
