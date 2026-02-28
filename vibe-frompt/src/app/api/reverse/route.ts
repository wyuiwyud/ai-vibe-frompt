import { NextRequest } from 'next/server';

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

    // Phase D v1 (stub): chưa crawl/vision thật, chỉ trả về cấu trúc gợi ý.
    const suggested = {
      inferredBrandName: 'Reverse Brand',
      primaryColor: '#00f5ff',
      productType: 'SaaS',
      goals: ['Lead generation'],
      targetAudience: ['Người Việt Nam'],
      style: 'Holographic',
      layoutTypeGuess: 'actionFirst',
      sections: [
        { type: 'hero' },
        { type: 'benefits' },
        { type: 'testimonials' },
        { type: 'pricing' },
        { type: 'ctaFinal' },
      ],
      notes:
        'Stub reverse mode: implement real web/image analysis với Groq/Gemini ở phase sau.',
    };

    return Response.json(suggested, { status: 200 });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return Response.json(
      { error: 'Reverse mode gặp lỗi. Thử lại sau.' },
      { status: 500 }
    );
  }
}

