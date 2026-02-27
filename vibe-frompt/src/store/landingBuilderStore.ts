import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LayoutType = 'actionFirst' | 'benefitFirst' | 'storyFirst' | null;

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export interface HeroConfig {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaColor: string;
  animation: 'fade' | 'slide' | 'scale';
  backgroundStyle: 'gradient' | 'blurOrbs' | 'particles';
}

export type SectionType =
  | 'hero'
  | 'benefits'
  | 'features'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'ctaFinal';

export interface LandingSection {
  id: string;
  type: SectionType;
  settings: Record<string, any>;
}

export interface TypographyConfig {
  font: 'Inter' | 'Poppins' | 'Space Grotesk' | 'Manrope';
  headlineSizePx: number;
  bodySizePx: number;
  spacingBase: 4 | 8 | 12 | 16;
  buttonShape: 'rounded' | 'full' | 'pill';
  buttonSize: 'sm' | 'md' | 'lg';
}

export interface VisualConfig {
  hoverEffect: 'tilt3d' | 'scale' | 'glow' | 'lift';
  microAnimations: boolean;
  particlesIntensity: number; // 0–100
  blurOrbs: boolean;
}

export interface StrategyState {
  brandName: string;
  primaryColor: string;
  productType: string;
  goals: string[];
  targetAudience: string[];
  style: string;
}

export interface LayoutState {
  layoutType: LayoutType;
  sections: LandingSection[];
  hero: HeroConfig;
  typography: TypographyConfig;
  visuals: VisualConfig;
  deviceMode: DeviceMode;
  conversionScore?: number;
}

export interface LandingBuilderState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  strategy: StrategyState;
  layout: LayoutState;
  finalPrompt: string | null;
  isGenerating: boolean;

  setStep: (step: LandingBuilderState['currentStep']) => void;
  updateStrategy: (partial: Partial<StrategyState>) => void;
  updateLayout: (partial: Partial<LayoutState>) => void;
  setFinalPrompt: (prompt: string | null) => void;
  setIsGenerating: (v: boolean) => void;
  reset: () => void;
}

const defaultStrategy: StrategyState = {
  brandName: '',
  primaryColor: '#00f5ff',
  productType: '',
  goals: [],
  targetAudience: [],
  style: 'Holographic',
};

const defaultLayout: LayoutState = {
  layoutType: null,
  sections: [],
  hero: {
    headline: '',
    subheadline: '',
    ctaText: '',
    ctaColor: '#00f5ff',
    animation: 'fade',
    backgroundStyle: 'gradient',
  },
  typography: {
    font: 'Inter',
    headlineSizePx: 60,
    bodySizePx: 16,
    spacingBase: 8,
    buttonShape: 'pill',
    buttonSize: 'md',
  },
  visuals: {
    hoverEffect: 'tilt3d',
    microAnimations: true,
    particlesIntensity: 60,
    blurOrbs: true,
  },
  deviceMode: 'desktop',
};

export const useLandingBuilderStore = create<LandingBuilderState>()(
  persist(
    (set) => ({
      currentStep: 1,
      strategy: defaultStrategy,
      layout: defaultLayout,
      finalPrompt: null,
      isGenerating: false,

      setStep: (step) => set({ currentStep: step }),
      updateStrategy: (partial) =>
        set((state) => ({
          strategy: { ...state.strategy, ...partial },
        })),
      updateLayout: (partial) =>
        set((state) => ({
          layout: { ...state.layout, ...partial },
        })),
      setFinalPrompt: (prompt) => set({ finalPrompt: prompt }),
      setIsGenerating: (v) => set({ isGenerating: v }),
      reset: () =>
        set({
          currentStep: 1,
          strategy: defaultStrategy,
          layout: defaultLayout,
          finalPrompt: null,
          isGenerating: false,
        }),
    }),
    {
      name: 'landing-builder-store',
    }
  )
);

