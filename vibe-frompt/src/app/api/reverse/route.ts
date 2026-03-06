import { NextRequest } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface ReverseBody {
  url?: string;
  imageBase64?: string;
}

export async function POST(req: NextRequest) {
  try {
    const json = (await req.json()) as ReverseBody;

    if (!json.url && !json.imageBase64) {
      return Response.json(
        { error: 'Cần cung cấp url hoặc imageBase64.' },
        { status: 400 }
      );
    }

    if (json.imageBase64 && GEMINI_API_KEY) {
      const prompt = `You are a brilliant Vietnamese marketing strategist and visual architect. 
Analyze the image provided and return a JSON object with the following strategy and visual components for a landing page:

{
  "inferredBrandName": "A catchy Vietnamese brand name based on the product (max 30 chars)",
  "primaryColor": "The most dominant highlight hex color (e.g. #ff00cc)",
  "productType": "The type of product/service (e.g. Trà Shan Tuyết Hà Giang, Mỹ phẩm thiên nhiên, Áo dài truyền thống)",
  "goals": ["Một mục tiêu kinh doanh chính (e.g. Lead generation, Tăng doanh số, Xây dựng thương hiệu)"],
  "targetAudience": ["Một đối tượng khách hàng phù hợp (e.g. GenZ 18-24, Khách quốc tế, Giới trẻ)"],
  "style": "The overall aesthetic (e.g. Truyền thống, Hiện đại, Minimalist, Cyberpunk)",
  "layoutTypeGuess": "actionFirst",
  "visualComponents": {
    "subject": "Detailed description in Vietnamese of the main subject/product...",
    "environment": "Detailed background/environment in Vietnamese...",
    "cinematography": "Lighting, angle, cinematography details...",
    "style": "Artistic style, color palette..."
  }
}

Return ONLY raw JSON, without backticks or markdown formatting. Ensure the text is naturally Vietnamese.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: 'image/jpeg', data: json.imageBase64 } },
              { text: prompt },
            ],
          }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1500 },
        }),
      });

      if (!res.ok) throw new Error('Gemini API Error');
      const data = await res.json();
      const raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return Response.json(parsed, { status: 200 });
    }

    // Fallback for URL or if no API Key (stub)
    const suggested = {
      inferredBrandName: 'Vietnamese Heritage',
      primaryColor: '#00f5ff',
      productType: 'Sản phẩm truyền thống',
      goals: ['Lead generation'],
      targetAudience: ['Người Việt Nam'],
      style: 'Holographic',
      layoutTypeGuess: 'actionFirst',
      visualComponents: null
    };

    return Response.json(suggested, { status: 200 });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: 'Reverse mode gặp lỗi. Thử lại sau.' },
      { status: 500 }
    );
  }
}

