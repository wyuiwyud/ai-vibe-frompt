import { NextRequest } from 'next/server';
import { callGroqText } from '@/server/ai/aiClient';

// ─────────────────────────────────────────────────────────────
// VIBE FROMPT — Smart Suggestion API
// Dùng Groq AI để gợi ý chủ đề viết lách dựa trên ngữ nghĩa,
// không phải keyword matching đơn thuần.
// ─────────────────────────────────────────────────────────────

// Cache đơn giản trong memory (reset khi server restart)
const suggestionCache = new Map<string, { suggestions: string[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

export async function POST(req: NextRequest) {
  try {
    const { query, language } = await req.json() as { query: string; language?: string };

    if (!query || query.trim().length < 1) {
      return Response.json({ suggestions: [] }, { status: 200 });
    }

    const cacheKey = `${query.trim().toLowerCase()}_${language ?? 'vi'}`;

    // Trả cache nếu còn mới
    const cached = suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return Response.json({ suggestions: cached.suggestions, fromCache: true });
    }

    const lang = language === 'en' ? 'English' : 'Tiếng Việt';
    const isVi = language !== 'en';

    const prompt = `Bạn là chuyên gia Content Strategy với kiến thức sâu về thị trường nội dung ${isVi ? 'Việt Nam' : 'quốc tế'}.

Người dùng đang gõ ý tưởng viết lách: "${query}"

Nhiệm vụ: Đề xuất ĐÚNG 6 chủ đề/ý tưởng viết lách CỤ THỂ và THỰC TẾ bằng ${lang}.

Yêu cầu:
- Hiểu NGỮ NGHĨA của input, không chỉ match từ
- Tham chiếu xu hướng thực tế ${isVi ? '(thị trường Việt Nam, Google Trends VN, Facebook insights VN)' : '(Google Trends, HubSpot, Content Marketing Institute)'}
- Gợi ý đa dạng: từ góc độ khác nhau (phân tích, storytelling, how-to, case study, data-driven...)
- Mỗi gợi ý: cụ thể, có thể dùng làm title bài viết ngay
- Độ dài mỗi gợi ý: 6-15 từ
- Phủ rộng các hướng: B2C, B2B, học thuật, đại chúng

Trả về ĐÚNG JSON format, KHÔNG có ký tự khác:
{
  "suggestions": [
    "Gợi ý 1 cụ thể bằng ${lang}",
    "Gợi ý 2 cụ thể bằng ${lang}",
    "Gợi ý 3 cụ thể bằng ${lang}",
    "Gợi ý 4 cụ thể bằng ${lang}",
    "Gợi ý 5 cụ thể bằng ${lang}",
    "Gợi ý 6 cụ thể bằng ${lang}"
  ]
}

CHỈ trả về JSON. KHÔNG có markdown, KHÔNG có giải thích.`;

    const aiText = await callGroqText(prompt, 0.75);

    let suggestions: string[] = [];

    if (aiText) {
      try {
        const cleaned = aiText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        const parsed = JSON.parse(cleaned) as { suggestions: string[] };
        if (Array.isArray(parsed.suggestions)) {
          suggestions = parsed.suggestions.filter(s => typeof s === 'string' && s.length > 3).slice(0, 6);
        }
      } catch (e) {
        // Parse thất bại — thử extract bằng regex
        const matches = aiText.match(/"([^"]{6,80})"/g);
        if (matches) {
          suggestions = matches.map(m => m.replace(/"/g, '')).slice(0, 6);
        }
      }
    }

    // Nếu AI thất bại, trả fallback từ kho local
    if (suggestions.length === 0) {
      suggestions = getFallbackSuggestions(query, isVi);
    }

    // Lưu cache
    suggestionCache.set(cacheKey, { suggestions, ts: Date.now() });

    return Response.json({ suggestions, fromCache: false });
  } catch (err) {
    console.error('[suggest] error', err);
    return Response.json({ suggestions: [], error: 'Internal error' }, { status: 500 });
  }
}

// ─── Fallback khi Groq không khả dụng ───────────────────────
function getFallbackSuggestions(query: string, isVi: boolean): string[] {
  const q = query.toLowerCase();

  if (isVi) {
    if (q.includes('ai') || q.includes('trí tuệ') || q.includes('robot')) {
      return [
        'AI thay thế con người — thực tế hay viễn tưởng trong 5 năm tới',
        'Cách tận dụng AI để tăng năng suất làm việc gấp 3 lần',
        'AI và giáo dục Việt Nam — cơ hội nào cho thế hệ tiếp theo',
        'Những nghề nghiệp AI không thể thay thế trong thập kỷ này',
        'ChatGPT và cuộc cách mạng sáng tạo nội dung tại Việt Nam',
        'Đạo đức AI — ranh giới nào chúng ta cần thiết lập ngay bây giờ',
      ];
    }
    if (q.includes('marketing') || q.includes('quảng') || q.includes('thương hiệu')) {
      return [
        'Chiến lược content marketing 0 đồng hiệu quả cho startup Việt',
        'Personal branding trên LinkedIn — từ 0 đến 10.000 followers',
        'TikTok marketing cho thương hiệu B2B — có đáng đầu tư không',
        'Email marketing vẫn hoạt động tốt hơn social media — đây là lý do',
        'Xây dựng community trước khi bán hàng — mô hình mới của 2025',
        'Data-driven marketing — cách đọc số liệu để ra quyết định đúng',
      ];
    }
    return [
      `${query} — góc nhìn từ chuyên gia hàng đầu Việt Nam`,
      `Tất cả những gì bạn chưa biết về ${query}`,
      `${query} 2025 — xu hướng và cơ hội không nên bỏ lỡ`,
      `Bắt đầu với ${query} từ con số 0 — hướng dẫn thực tế`,
      `${query} cho người mới — những sai lầm phổ biến nhất`,
      `Case study thực tế về ${query} tại thị trường Việt Nam`,
    ];
  }

  return [
    `The complete beginner's guide to ${query}`,
    `${query} trends to watch in 2025`,
    `How top experts approach ${query} differently`,
    `${query} mistakes most people make (and how to fix them)`,
    `Data-driven insights on ${query} you need to know`,
    `The future of ${query} — what the research says`,
  ];
}
