// ============================================
// VIBE FROMPT — Prompt Template Engine with RTCE+I
// ============================================

export type Category = 'writing' | 'coding' | 'image';

export interface FormData {
  category: Category;
  topic: string;
  language: string;
  tone?: string;
  format?: string;
  audience?: string;
  codeLanguage?: string;
  framework?: string;
  requirement?: string;
  style?: string;
  aspectRatio?: string;
  detailLevel?: string;
}

export async function buildPrompt(data: FormData): Promise<string> {
  try {
    const options: Record<string, string> = {
      language: data.language,
      tone: data.tone ?? '',
      format: data.format ?? '',
      audience: data.audience ?? '',
      codeLanguage: data.codeLanguage ?? '',
      framework: data.framework ?? '',
      requirement: data.requirement ?? '',
      style: data.style ?? '',
      aspectRatio: data.aspectRatio ?? '',
      detailLevel: data.detailLevel ?? 'basic',
    };

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: data.category, topic: data.topic, options }),
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json() as { prompt?: string; isAI?: boolean; error?: string };
    if (json.prompt && json.prompt.length > 10) return json.prompt;
  } catch (e) {
    console.error('[buildPrompt] fetch failed', e);
  }

  return buildFallbackTemplate(data);
}

function buildFallbackTemplate(data: FormData): string {
  if (data.category === 'writing') {
    return `[ROLE]
Bạn là chuyên gia Content Creator & Storyteller người Việt Nam.

[TASK]
Viết nội dung về chủ đề: ${data.topic}

[CONTEXT]
- Giọng văn: ${data.tone || 'Chuyên nghiệp'}
- Định dạng: ${data.format || 'Bullet Points'}
- Đối tượng: ${data.audience || 'Đại chúng'}
- Ngôn ngữ: ${data.language === 'en' ? 'English' : 'Tiếng Việt'}
- Mức chi tiết: ${data.detailLevel === 'advanced' ? 'Nâng cao – phân tích sâu' : 'Cơ bản – súc tích'}

[EXAMPLE]
Hook mạnh → Nội dung có giá trị → CTA rõ ràng.

[INSTRUCTION]
1. Mở đầu bằng hook thu hút sự chú ý ngay từ câu đầu.
2. Trình bày nội dung rõ ràng, có cấu trúc, dễ đọc.
3. Kết bài bằng call-to-action ấn tượng.
${data.detailLevel === 'advanced' ? '4. Thêm số liệu, ví dụ thực tế và phân tích sâu.' : ''}`.trim();
  }

  if (data.category === 'coding') {
    return `[ROLE]
You are a Senior ${data.framework || 'React'} Developer with deep expertise in ${data.codeLanguage || 'JavaScript'}.

[TASK]
${data.requirement || 'Build'} the following feature: ${data.topic}

[CONTEXT]
- Language: ${data.codeLanguage || 'JavaScript'}
- Framework: ${data.framework || 'React'}
- Output Language: ${data.language === 'en' ? 'Full English' : 'Vietnamese explanation + English code'}

[EXAMPLE]
Clean, modular code with proper error handling and concise comments.

[INSTRUCTION]
1. Write clean, production-ready code.
2. Add proper error handling.
3. Include comments explaining key logic.
${data.detailLevel === 'advanced' ? '4. Add performance optimization notes and edge case handling.' : ''}`.trim();
  }

  if (data.category === 'image') {
    return `${data.topic}, ${data.style || 'cinematic'}, ultra detailed, professional lighting, 8k resolution, sharp focus, masterpiece quality, volumetric lighting, depth of field --ar ${data.aspectRatio || '16:9'} --v 6 --style raw --stylize 100

Negative prompt: blurry, low quality, distorted, watermark, text overlay, amateur, ugly`.trim();
  }

  return `Tạo prompt AI chuyên nghiệp cho: ${data.topic}`;
}

export function calculateScore(data: FormData): { clarity: number; structure: number; creativity: number } {
  const hasDetails = data.detailLevel === 'advanced';
  const hasSpecifics = !!(data.tone || data.codeLanguage || data.style);
  const topicLength = data.topic?.length || 0;

  return {
    clarity: Math.min(97, 72 + (topicLength > 20 ? 12 : 0) + (hasSpecifics ? 10 : 0) + (hasDetails ? 5 : 0)),
    structure: Math.min(97, 68 + (hasDetails ? 18 : 6) + (hasSpecifics ? 8 : 0)),
    creativity: Math.min(97, 65 + (hasSpecifics ? 15 : 5) + (hasDetails ? 10 : 0) + (topicLength > 30 ? 7 : 0)),
  };
}

export function generateVariants(basePrompt: string, variant: 'persuasive' | 'technical' | 'emotional'): string {
  const suffixes: Record<string, string> = {
    persuasive: '\n\n[TONE BOOST – Persuasive]\nTăng tính thuyết phục: dùng ngôn ngữ tạo cảm giác cấp bách, nhấn mạnh lợi ích rõ ràng, thêm social proof và CTA mạnh có thể đo lường được.',
    technical: '\n\n[TONE BOOST – Technical]\nTăng tính kỹ thuật: thêm thuật ngữ chuyên ngành, số liệu cụ thể, references đến best practices và standards công nghiệp.',
    emotional: '\n\n[TONE BOOST – Emotional]\nThêm emotional trigger: kết nối cảm xúc với người đọc, dùng storytelling, tạo empathy và shared identity.',
  };
  return basePrompt + suffixes[variant];
}
