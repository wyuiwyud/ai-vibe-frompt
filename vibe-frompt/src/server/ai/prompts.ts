import type {
  LayoutState,
  StrategyState,
} from '@/store/landingBuilderStore';

export interface ReaddyInput {
  strategy: StrategyState;
  layout: LayoutState;
  refinement?: string;
}

export interface ReaddyOutput {
  prompt: string;
  length: number;
  conversionScore: number;
  truncated: boolean;
}

const MAX_CHARS = 2000;

export function buildRtcePrompt(input: ReaddyInput): ReaddyOutput {
  const { strategy, layout, refinement } = input;

  const goals = strategy.goals.join(', ') || 'Landing page';
  const audience =
    strategy.targetAudience.join(', ') || 'Người dùng Việt Nam quan tâm';
  const sectionsLabel =
    layout.sections.length > 0
      ? layout.sections
          .map((s) => s.type)
          .filter((v, i, arr) => arr.indexOf(v) === i)
          .join(', ')
      : 'hero, benefits, social proof, pricing, FAQ, final CTA';

  const layoutLabel =
    layout.layoutType === 'actionFirst'
      ? 'Action-first'
      : layout.layoutType === 'benefitFirst'
      ? 'Benefit-first'
      : layout.layoutType === 'storyFirst'
      ? 'Story-first'
      : 'Action-first';

  const heroHeadline = layout.hero.headline || '[Headline chính 60px]';

  const base = `
[ROLE]
Bạn là Senior UI/UX Designer + Readdy/Webflow expert với 8 năm kinh nghiệm thiết kế landing page SaaS/Edu/Ecommerce cho creator Việt Nam.

[TASK]
Thiết kế và mô tả chi tiết một landing page hoàn chỉnh để có thể build trực tiếp trong Readdy chỉ với một prompt, giới hạn tối đa ${MAX_CHARS} ký tự.

[CONTEXT]
- Brand: ${strategy.brandName || '[Brand]'}
- Màu chủ đạo: ${strategy.primaryColor}
- Loại sản phẩm / dự án: ${strategy.productType || 'Landing page'}
- Mục tiêu chính: ${goals}
- Đối tượng mục tiêu: ${audience}
- Phong cách: ${strategy.style || 'Holographic, premium, cosmic'}
- Layout đã chọn: ${layoutLabel}
- Danh sách section: ${sectionsLabel}
- Headline cuối cùng (hero): ${heroHeadline}
- Font: ${layout.typography.font}, headline ~${layout.typography.headlineSizePx}px, body ${layout.typography.bodySizePx}px
- Animation: ${layout.hero.animation} + hover ${layout.visuals.hoverEffect}, particles intensity ${layout.visuals.particlesIntensity}%

[EXAMPLE & RULES]
- Hero: headline 60px bold, tối đa 2 dòng, subheadline ngắn gọn (~20 từ), CTA nổi bật màu ${strategy.primaryColor} với hiệu ứng pulse, nền gradient + particles bay nhẹ.
- Cards/sections: card đồng chiều cao, khoảng cách theo hệ 8pt (${layout.typography.spacingBase}px base), CTA và heading luôn thẳng hàng theo trục dọc.
- Tối ưu conversion: có social proof (testimonials hoặc số liệu), nhắc CTA lặp lại ít nhất 2–3 lần, thêm yếu tố khan hiếm nếu phù hợp.
- UX logic: áp dụng F-pattern trên desktop, mobile-first, đảm bảo hierarchy rõ ràng, không dùng hơn 2 font.

[INSTRUCTIONS]
1. Viết prompt Readdy duy nhất, gọn, giàu thông tin, mô tả đầy đủ layout từ trên xuống dưới (hero → sections → footer).
2. Dùng tiếng Việt tự nhiên, có thể xen vài từ khóa tiếng Anh nếu cần cho Readdy.
3. Mô tả rõ:
   - tone, style hình ảnh, bố cục section, vị trí CTA, dạng card/slider/table, loại social proof.
   - màu sắc chính/phụ, background (gradient, blur orbs, glow).
4. Không vượt quá ${MAX_CHARS} ký tự tổng thể, ưu tiên nội dung quan trọng cho conversion và UX.
5. Trả về CHỈ prompt Readdy, không thêm giải thích.

${refinement ? `[REFINEMENT]\nƯu tiên tinh chỉnh thêm theo yêu cầu: ${refinement}\n` : ''}
`.trim();

  let prompt = base;
  let truncated = false;

  if (prompt.length > MAX_CHARS) {
    prompt = prompt.slice(0, MAX_CHARS - 50) + '\n...[TRIMMED_FOR_LIMIT]';
    truncated = true;
  }

  const ctaScore = layout.sections.some((s) => s.type === 'ctaFinal') ? 10 : 7;
  const socialProofScore = layout.sections.some(
    (s) => s.type === 'testimonials'
  )
    ? 10
    : 6;
  const emotionalScore =
    strategy.style.toLowerCase().includes('holographic') ||
    strategy.style.toLowerCase().includes('cyberpunk')
      ? 9
      : 7;

  const conversionScore = ctaScore + socialProofScore + emotionalScore;

  return {
    prompt,
    length: prompt.length,
    conversionScore,
    truncated,
  };
}

