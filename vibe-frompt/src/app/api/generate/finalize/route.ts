import { NextRequest } from 'next/server';
import { callGroqText } from '@/server/ai/aiClient';

export async function POST(req: NextRequest) {
    try {
        const { strategy, layout } = await req.json();

        const prompt = `Bạn là chuyên gia CRO (Conversion Rate Optimization) và Landing Page chuyên nghiệp với 10+ năm kinh nghiệm.

Hãy đánh giá toàn bộ landing page dưới đây và trả về JSON phân tích chuyên sâu.

=== DỮ LIỆU LANDING PAGE ===
Brand: "${strategy.brandName || 'Chưa đặt'}"
Màu chủ đạo: ${strategy.primaryColor}
Sản phẩm: ${strategy.productType || 'Chưa xác định'}
Mục tiêu: ${strategy.goals?.join(', ') || 'Chưa chọn'}
Đối tượng: ${strategy.targetAudience?.join(', ') || 'Chưa chọn'}
Phong cách: ${strategy.style || 'Chưa chọn'}
Layout archetype: ${layout.layoutType || 'Chưa chọn'}
Headline: "${layout.hero?.headline || 'Chưa có'}"
Subheadline: "${layout.hero?.subheadline || 'Chưa có'}"
CTA Text: "${layout.hero?.ctaText || 'Chưa có'}"
Sections: ${layout.sections?.map((s: any) => s.type).join(', ') || 'Chưa có section nào'}
Số sections: ${layout.sections?.length || 0}
Font: ${layout.typography?.font || 'Inter'}
=== KẾT THÚC DỮ LIỆU ===

Trả về ĐÚNG JSON schema sau, không giải thích gì thêm:
{
  "score": <số nguyên 0-100 đánh giá tổng thể khả năng chuyển đổi>,
  "grade": "<A+ / A / B+ / B / C / D>",
  "summary": "<1-2 câu nhận xét tổng thể bằng tiếng Việt>",
  "checklist": [
    {
      "label": "<Tiêu chí đánh giá>",
      "status": <true/false>,
      "points": <điểm tiêu chí này chiếm, tổng = 100>,
      "tip": "<Gợi ý cải thiện cụ thể bằng tiếng Việt>"
    }
  ],
  "strengths": ["<Điểm mạnh 1>", "<Điểm mạnh 2>"],
  "improvements": ["<Cải thiện ưu tiên 1>", "<Cải thiện ưu tiên 2>", "<Cải thiện ưu tiên 3>"]
}

Checklist phải có đúng 5 tiêu chí, tổng points = 100. Đánh giá dựa trên dữ liệu thực tế được cung cấp, không đoán mò.`;

        const text = await callGroqText(prompt, 0.5);
        if (!text) return Response.json({ error: 'AI không phản hồi.' }, { status: 503 });

        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const result = JSON.parse(cleaned);
        return Response.json(result);
    } catch (e) {
        console.error('[api/generate/finalize]', e);
        return Response.json({ error: 'Lỗi xử lý.' }, { status: 500 });
    }
}
