import { NextRequest } from 'next/server';
import { generatePromptForCategory } from '@/server/ai/aiClient';

interface GenerateBody {
    category: string;
    topic: string;
    options: Record<string, string>;
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as Partial<GenerateBody>;

        if (!body.category || !body.topic) {
            return Response.json(
                { error: 'Thiếu category hoặc topic.' },
                { status: 400 }
            );
        }

        const result = await generatePromptForCategory(
            body.category,
            body.topic,
            body.options ?? {}
        );

        return Response.json(result, { status: 200 });
    } catch (err) {
        console.error('[generate] error', err);
        return Response.json(
            { prompt: '', isAI: false, error: 'Lỗi tạo prompt. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}
