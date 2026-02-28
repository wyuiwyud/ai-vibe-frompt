import { NextRequest } from 'next/server';
import { generateLandingStrategy } from '@/server/ai/aiClient';

export async function POST(req: NextRequest) {
    try {
        const { brandIdea } = await req.json();

        if (!brandIdea || brandIdea.length < 3) {
            return Response.json({ error: 'Ý tưởng quá ngắn.' }, { status: 400 });
        }

        const strategy = await generateLandingStrategy(brandIdea);

        if (!strategy) {
            return Response.json({ error: 'AI không thể tạo strategy lúc này.' }, { status: 503 });
        }

        return Response.json(strategy);
    } catch (err) {
        console.error('[api/generate/strategy] error:', err);
        return Response.json({ error: 'Lỗi hệ thống.' }, { status: 500 });
    }
}
