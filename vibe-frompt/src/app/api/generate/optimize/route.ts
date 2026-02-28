import { NextRequest } from 'next/server';
import { callGroqText } from '@/server/ai/aiClient';

export async function POST(req: NextRequest) {
    try {
        const { strategy, layout } = await req.json();

        const prompt = `Bạn là chuyên gia CRO (Conversion Rate Optimization) hàng đầu.

Brand: "${strategy.brandName || 'Brand'}"
Mục tiêu: ${strategy.goals?.join(', ') || 'Lead generation'}
Đối tượng: ${strategy.targetAudience?.join(', ') || 'Người dùng Việt Nam'}
Phong cách: ${strategy.style || 'Holographic'}
Màu chủ đạo: ${strategy.primaryColor || '#00f5ff'}
Layout hiện tại: ${layout.layoutType || 'actionFirst'}
Sections hiện tại: ${layout.sections?.map((s: any) => s.type).join(', ') || 'hero, features, cta'}

Hãy đề xuất tối ưu cho landing page này. Trả về JSON đúng schema sau:
{
  "headline": "Headline mạnh mẽ, dưới 12 từ, có đề cập lợi ích cốt lõi",
  "subheadline": "Mô tả bổ sung 1-2 câu, nêu rõ pain point được giải quyết",
  "ctaText": "CTA text ngắn gọn, hành động rõ ràng (tối đa 5 từ)",
  "sectionOrder": ["hero", "benefits", "features", "testimonials", "ctaFinal"],
  "tips": ["Tip 1 cụ thể", "Tip 2 cụ thể", "Tip 3 cụ thể"]
}

CHỈ trả về JSON. KHÔNG giải thích.`;

        const text = await callGroqText(prompt, 0.65);
        if (!text) return Response.json({ error: 'AI không phản hồi.' }, { status: 503 });

        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const result = JSON.parse(cleaned);
        return Response.json(result);
    } catch (e) {
        console.error('[api/generate/optimize]', e);
        return Response.json({ error: 'Lỗi xử lý.' }, { status: 500 });
    }
}
