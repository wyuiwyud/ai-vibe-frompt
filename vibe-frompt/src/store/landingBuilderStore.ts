import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  LayoutType,
  DeviceMode,
  HeroConfig,
  SectionType,
  LandingSection,
  TypographyConfig,
  VisualConfig,
  StrategyState,
  LayoutState,
  AIDirection,
  ChatMessage
} from '@/features/landing-builder/types';

export type { LayoutType, DeviceMode, SectionType, LandingSection, AIDirection, ChatMessage };

export interface LandingBuilderState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  strategy: StrategyState;
  layout: LayoutState;
  finalPrompt: string | null;
  isGenerating: boolean;
  aiDirections: AIDirection[] | null;
  chatHistory: ChatMessage[];
  selectedDirectionId: number | null;

  setStep: (step: LandingBuilderState['currentStep']) => void;
  updateStrategy: (partial: Partial<StrategyState>) => void;
  updateLayout: (partial: Partial<LayoutState>) => void;
  setFinalPrompt: (prompt: string | null) => void;
  setIsGenerating: (v: boolean) => void;
  setAIDirections: (directions: AIDirection[] | null) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setSelectedDirection: (id: number | null) => void;
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
      aiDirections: null,
      chatHistory: [],
      selectedDirectionId: null,

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
      setAIDirections: (dirs) => set({ aiDirections: dirs }),
      addChatMessage: (msg) => set((s) => ({ chatHistory: [...s.chatHistory, msg] })),
      setSelectedDirection: (id) => set({ selectedDirectionId: id }),
      reset: () =>
        set({
          currentStep: 1,
          strategy: defaultStrategy,
          layout: defaultLayout,
          finalPrompt: null,
          isGenerating: false,
          aiDirections: null,
          chatHistory: [],
          selectedDirectionId: null,
        }),
    }),
    {
      name: 'landing-builder-store',
    }
  )
);

