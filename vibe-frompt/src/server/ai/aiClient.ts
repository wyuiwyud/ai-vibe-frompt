import type { ReaddyInput, ReaddyOutput } from './prompts';
import { buildRtcePrompt } from './prompts';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Groq models in priority order (fastest + best quality first)
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama3-70b-8192',
  'mixtral-8x7b-32768',
];

async function callGroq(systemPrompt: string, temperature = 0.8): Promise<string> {
  if (!GROQ_API_KEY) {
    console.log('[Groq] No API key — using fallback template');
    return '';
  }

  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: systemPrompt }],
          temperature,
          max_tokens: 2048,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`[Groq] ${model} failed ${res.status}: ${err.slice(0, 200)}`);
        continue;
      }

      const data = await res.json();
      const text = (data?.choices?.[0]?.message?.content ?? '').trim();
      if (text) {
        console.log(`[Groq] ✅ ${model} OK (${text.length} chars)`);
        return text;
      }
    } catch (e) {
      console.error(`[Groq] ${model} exception:`, e);
    }
  }

  console.error('[Groq] All models failed. Using fallback.');
  return '';
}

// Export for use in API routes
export const callGroqText = callGroq;

// ─── Landing Builder AI ─────────────────────────────────────────────────────

export async function generateReaddyPrompt(input: ReaddyInput): Promise<ReaddyOutput> {
  const { strategy, layout, refinement } = input;

  const sectionsText = layout.sections?.length
    ? layout.sections.map((s: any, i: number) => `  ${i + 1}. ${s.type}${s.settings?.title ? ` — "${s.settings.title}"` : ''}`).join('\n')
    : '  (Chưa có section nào)';

  const aiPrompt = `Bạn là chuyên gia Landing Page Builder và Senior Copywriter với 10+ năm kinh nghiệm tạo landing page triệu đô cho thị trường Việt Nam.

Dưới đây là TOÀN BỘ thông tin thiết kế landing page từ người dùng. Hãy tạo một prompt Readdy/Webflow hoàn chỉnh để build landing page MVP này.

=== CHIẾN LƯỢC (Strategy Layer) ===
- Brand: ${strategy.brandName || 'Chưa đặt'}
- Sản phẩm: ${strategy.productType || 'Landing page'}
- Mục tiêu: ${strategy.goals?.join(', ') || 'Lead generation'}
- Đối tượng: ${strategy.targetAudience?.join(', ') || 'Người dùng Việt Nam'}
- Phong cách: ${strategy.style || 'Hiện đại'}
- Màu chủ đạo: ${strategy.primaryColor || '#00f5ff'}

=== BỐ CỤC (Structure/Layout Layer) ===
- Archetype: ${layout.layoutType || 'actionFirst'}
- Danh sách Sections (từ trên xuống):
${sectionsText}

=== HERO SECTION ===
- Headline: "${layout.hero?.headline || 'Chưa có headline'}"
- Subheadline: "${layout.hero?.subheadline || 'Chưa có subheadline'}"
- CTA Text: "${layout.hero?.ctaText || 'Bắt đầu ngay'}"
- CTA Color: ${layout.hero?.ctaColor || strategy.primaryColor}
- Background Style: ${layout.hero?.backgroundStyle || 'gradient'}

=== DESIGN SYSTEM ===
- Font: ${layout.typography?.font || 'Inter'}
- Headline Size: ${layout.typography?.headlineSizePx || 56}px
- Button Shape: ${layout.typography?.buttonShape || 'rounded'}
- Hover Effect: ${layout.visuals?.hoverEffect || 'scale'}
- Micro-animations: ${layout.visuals?.microAnimations ? 'Bật' : 'Tắt'}
- Blur Orbs: ${layout.visuals?.blurOrbs ? 'Bật' : 'Tắt'}
- Conversion Score (từ bước Finalize): ${layout.conversionScore ?? 0}/100

${refinement ? `=== YÊU CẦU BỔ SUNG TỪ NGƯỜI DÙNG ===\n${refinement}\n` : ''}

=== NHIỆM VỤ ===
Viết một PROMPT hoàn chỉnh (1000–1800 ký tự) dùng để giao cho AI build landing page này trên Readdy hoặc Webflow.

Prompt phải mô tả:
1. Mục đích trang và tone of voice
2. Layout từ trên xuống theo đúng thứ tự sections đã liệt kê
3. Nội dung cụ thể cho Hero (headline, sub, CTA)
4. Màu sắc, font, border-radius theo design system
5. Hiệu ứng animation/hover nếu có
6. Yêu cầu chất lượng: mobile-first, fast load, conversion-optimized

CHỈ trả về nội dung prompt. KHÔNG giải thích. KHÔNG dùng markdown header.`;

  const aiText = await callGroq(aiPrompt, 0.72);

  if (aiText && aiText.length > 100) {
    return {
      prompt: aiText,
      length: aiText.length,
      conversionScore: (layout.conversionScore ?? 0) + 5,
      truncated: aiText.length > 2000,
    };
  }

  // Fallback template if AI fails
  const fallback = `[Brand: ${strategy.brandName}] [Style: ${strategy.style}] [Color: ${strategy.primaryColor}]\n\nBuild a conversion-optimized landing page for "${strategy.brandName}" targeting ${strategy.targetAudience?.join(', ')}.\n\nLayout: ${layout.sections?.map((s: any) => s.type).join(' → ') || 'hero → features → cta'}\n\nHero: "${layout.hero?.headline || strategy.brandName}", CTA "${layout.hero?.ctaText || 'Bắt đầu ngay'}".\n\nFont: ${layout.typography?.font}, background: ${layout.hero?.backgroundStyle}. Mobile-first.`.trim();

  return {
    prompt: fallback,
    length: fallback.length,
    conversionScore: layout.conversionScore ?? 50,
    truncated: false,
  };
}

// ─── Category Prompt Generator ───────────────────────────────────────────────

export interface GenerateResult {
  prompt: string;
  isAI: boolean;
  error?: string;
}

export interface StrategyResult {
  brandName: string;
  primaryColor: string;
  productType: string;
  style: string;
  goals: string[];
  targetAudience: string[];
}

export async function generatePromptForCategory(
  category: string,
  topic: string,
  options: Record<string, string>
): Promise<GenerateResult> {
  const systemPrompt = buildSmartSystemPrompt(category, topic, options);
  const aiText = await callGroq(systemPrompt, 0.85);

  if (aiText && aiText.length > 80) {
    return { prompt: aiText, isAI: true };
  }

  return { prompt: buildFallbackPrompt(category, topic, options), isAI: false };
}

function buildSmartSystemPrompt(
  category: string,
  topic: string,
  opts: Record<string, string>
): string {
  const lang = opts.language === 'en' ? 'English' : 'Tiếng Việt';
  const detail = opts.detailLevel === 'advanced'
    ? 'rất chi tiết, chuyên sâu, professional-grade, với ví dụ thực tế và phân tích sâu'
    : 'súc tích, rõ ràng, dễ dùng ngay, không quá phức tạp';

  if (category === 'writing') {
    return `Bạn là chuyên gia content marketing và copywriter hàng đầu Việt Nam với 10+ năm kinh nghiệm.

Nhiệm vụ: Tạo MỘT prompt AI hoàn chỉnh bằng ${lang} để viết nội dung về: "${topic}"

Thông số từ user:
- Giọng văn: ${opts.tone || 'Chuyên nghiệp'}
- Định dạng: ${opts.format || 'Bullet Points có cấu trúc'}
- Đối tượng: ${opts.audience || 'Đại chúng'}
- Ngôn ngữ output: ${lang}
- Độ chi tiết: ${detail}

Prompt phải:
1. Giao cho AI một vai trò chuyên gia cực kỳ cụ thể (không chung chung)
2. Mô tả nhiệm vụ chi tiết với tiêu chí chất lượng rõ ràng
3. Chỉ định cấu trúc bài viết cụ thể (ví dụ: Hook → Problem → Solution → Evidence → CTA)
4. Yêu cầu giọng văn, tone, phong cách phù hợp với đối tượng
5. Có hướng dẫn về độ dài, SEO (nếu cần), và cách kết thúc ấn tượng

QUAN TRỌNG: Chỉ trả về prompt hoàn chỉnh bằng ${lang}. KHÔNG giải thích. KHÔNG dùng markdown header.`;
  }

  if (category === 'coding') {
    return `You are a Staff Software Engineer and systems architect with 12+ years at top tech companies.

Task: Create ONE complete, professional AI coding prompt in ${lang} for this request: "${topic}"

Developer specs:
- Language: ${opts.codeLanguage || 'JavaScript'}
- Framework: ${opts.framework || 'React'}
- Task type: ${opts.requirement || 'Build new feature'}
- Response language: ${lang}
- Detail level: ${detail}

The prompt must:
1. Assign AI a highly specific expert role (e.g. "Senior React Performance Engineer who works on large-scale SPAs")
2. Define the exact deliverable with clear acceptance criteria
3. Specify tech stack, architecture patterns, and quality standards
4. Request specific outputs: working code + inline comments + usage example + edge case handling
5. Include performance requirements, security considerations if relevant
6. Ask AI to explain approach before coding

IMPORTANT: Return ONLY the complete prompt in ${lang === 'English' ? 'English' : 'Vietnamese'}. NO explanation. NO markdown headers.`;
  }

  if (category === 'image') {
    const isSDXL = (opts.model || '').toLowerCase().includes('sdxl');
    return `You are an elite AI image prompt engineer specialized in ${isSDXL ? 'Stable Diffusion XL' : 'Midjourney v6'} with 500+ viral images created.

Task: Create ONE masterful, highly-optimized image generation prompt for: "${topic}"

Specs:
- Visual style: ${opts.style || 'Cinematic'}
- Aspect ratio: ${opts.aspectRatio || '16:9'}
- Target model: ${isSDXL ? 'Stable Diffusion XL' : 'Midjourney v6'}

The prompt must include (in order):
1. Rich subject description (composition, pose, expression, clothing details)
2. Specific art style + artist references (e.g. "in the style of Greg Rutkowski, cinematic lighting")
3. Environment and atmosphere details
4. Lighting setup (golden hour / studio / dramatic rim lighting / etc.)
5. Camera details (85mm portrait lens / wide angle / bird's eye view)
6. Color grading and mood keywords
7. Quality boosters (ultra-detailed, 8k UHD, RAW photo, sharp focus, masterpiece)
8. Model parameters: --ar ${opts.aspectRatio || '16:9'} ${isSDXL ? '' : '--v 6 --style raw --stylize 150'}
9. Negative prompt: (blurry, low quality, watermark, distorted, ugly, bad anatomy, text)

Return ONLY the final complete prompt. No explanation.`;
  }

  return `Create a professional AI prompt for: "${topic}". Language: ${lang}. Return ONLY the prompt.`;
}

function buildFallbackPrompt(
  category: string,
  topic: string,
  opts: Record<string, string>
): string {
  const lang = opts.language === 'en' ? 'English' : 'Tiếng Việt';

  if (category === 'writing') {
    return `[ROLE]
Bạn là chuyên gia Content Creator & Copywriter người Việt Nam với 10 năm kinh nghiệm về ${opts.format || 'content marketing'}.

[TASK]
Viết nội dung ${opts.format || 'có cấu trúc'} về: "${topic}"

[CONTEXT]
- Giọng văn: ${opts.tone || 'Chuyên nghiệp'}
- Đối tượng đọc: ${opts.audience || 'Đại chúng'}
- Ngôn ngữ output: ${lang}
- Mức chi tiết: ${opts.detailLevel === 'advanced' ? 'Sâu, có số liệu và ví dụ thực tế' : 'Súc tích, dễ đọc, có thể chia sẻ ngay'}

[STRUCTURE]
Hook gây chú ý → Body rõ ràng → Call-to-action ấn tượng

[INSTRUCTION]
1. Mở đầu bằng 1-2 câu hook kéo người đọc vào ngay
2. Trình bày nội dung theo định dạng ${opts.format || 'bullet points'} dễ scan
3. Kết thúc bằng câu kết hoặc CTA khiến người đọc muốn hành động`.trim();
  }

  if (category === 'coding') {
    return `[ROLE]
You are a Senior ${opts.framework || 'React'} Developer and Software Architect, expert in ${opts.codeLanguage || 'JavaScript'} with a focus on clean, maintainable code.

[TASK]
${opts.requirement || 'Build'}: "${topic}"

[CONTEXT]
- Tech stack: ${opts.codeLanguage || 'JavaScript'} / ${opts.framework || 'React'}
- Response language: ${lang}
- Quality: Production-ready, well-commented, error-handled

[INSTRUCTION]
1. Briefly explain your approach and architecture decisions
2. Write clean, commented, production-ready code
3. Handle errors and edge cases
4. Provide a usage example at the end`.trim();
  }

  if (category === 'image') {
    return `${topic}, ${opts.style || 'cinematic'} style, ultra-detailed, dramatic professional lighting, volumetric light rays, 8k UHD resolution, sharp focus throughout, masterpiece quality, depth of field, color grading --ar ${opts.aspectRatio || '16:9'} --v 6 --style raw

Negative prompt: blurry, low quality, watermark, distorted, text overlay, amateur`.trim();
  }

  return `Professional AI prompt for: ${topic}`;
}
export async function generateLandingStrategy(brandIdea: string): Promise<StrategyResult | null> {
  const systemPrompt = `You are a world-class Startup Brand Strategist and UI/UX Director.
Based on this raw idea: "${brandIdea}"

Generate a complete visual and strategic identity for a landing page.
Return ONLY a valid JSON object with these exact keys:
{
  "brandName": "A catchy, matching name",
  "primaryColor": "A hex color code that fits the niche (e.g. #00f5ff for tech, #10b981 for eco)",
  "productType": "One of: SaaS, Giáo dục, Ecommerce, Portfolio, Landing bán khóa học, Blog cá nhân, Startup pitch",
  "style": "One of: Minimal, Cyberpunk, Neumorphic, Holographic, Retro-futuristic, Clean Corporate, Playful",
  "goals": ["Goal 1 (from: Lead generation, Bán sản phẩm, Thu thập email, Giới thiệu lớp học, Xây dựng thương hiệu)"],
  "targetAudience": ["Audience 1 (from: GenZ 18-24, Sinh viên, Doanh nhân trẻ, Giáo viên, Marketer, Người Việt Nam)"]
}

Rules:
- brandName: Max 20 chars.
- goals: Select 1-2 most relevant goals.
- targetAudience: Select 1-2 most relevant audiences.
- Return ONLY raw JSON. No explanation. No markdown.`;

  const aiText = await callGroq(systemPrompt, 0.6);
  if (!aiText) return null;

  try {
    const cleaned = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[aiClient] Failed to parse strategy JSON:', e);
    return null;
  }
}
