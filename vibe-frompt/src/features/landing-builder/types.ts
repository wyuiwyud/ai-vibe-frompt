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
    settings: Record<string, unknown>;
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

export interface AIDirection {
    id: number;
    title: string;
    reasoning: string;
    colors: string;
    font: string;
    headline: string;
    subheadline: string;
    sections: { type: string; title: string; desc: string }[];
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
