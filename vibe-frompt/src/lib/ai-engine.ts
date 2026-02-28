// MVPI CE AI Engine - simplified, no external dependency on old promptTemplates
export interface UserInput {
    brand: string;
    color: string;
    productType: string;
    goal: string;
    style: string;
    audience?: string;
}

export interface DecisionOutput {
    intent: string;
    layout: string;
    uxRules: string[];
    conversionTriggers: string[];
    prompt: string;
}

export const processMVPI = (input: UserInput): DecisionOutput => {
    const productType = input.productType.toLowerCase();
    const goal = input.goal.toLowerCase();

    let intent = 'General';
    if (goal.includes('đăng ký') || goal.includes('conversion')) intent = 'Conversion';
    if (productType.includes('dashboard') || productType.includes('quản lý')) intent = 'Data Management';
    if (productType.includes('landing') || productType.includes('giới thiệu')) intent = 'Landing Page';

    let layout = 'Action-first';
    if (intent === 'Landing Page') layout = 'Benefit-first';
    if (intent === 'Data Management') layout = 'Sidebar + Data Grid';
    if (input.style.toLowerCase().includes('story')) layout = 'Story-first';

    const uxRules = [
        'Hero headline: 60px bold',
        '8pt grid system spacing',
        'Equal-height card alignment',
        'Max 2 lines per section title',
        'High-contrast neon CTA',
    ];

    const conversionTriggers = [
        'Social Proof (Testimonials/Stats)',
        'Micro-animations on hover',
        'F-Pattern Visual Hierarchy',
        'Urgency/Scarcity triggers',
    ];

    const prompt = `
[R - ROLE]
Bạn là một UI/UX Designer & Frontend Expert chuyên nghiệp, bậc thầy về conversion rate optimization.

[T - TASK]
Thiết kế một ${input.productType} cho thương hiệu ${input.brand}.

[C - CONTEXT]
Màu chủ đạo: ${input.color}. Phong cách: ${input.style}.
Mục tiêu: ${input.goal}. Đối tượng: ${input.audience || 'Người dùng Việt Nam'}.

[E - EXAMPLE]
Hero: headline 60px, layout ${layout}, card hover effect.

[I - INSTRUCTION]
1. Hệ thống spacing 8px nhất quán.
2. Typography phong cách ${input.style}.
3. Animation fade-in mượt mà.
4. Galaxy theme (thiên hà, ánh sáng neon).
`.trim();

    return { intent, layout, uxRules, conversionTriggers, prompt };
};
