import { NextRequest } from 'next/server';
import { generateReaddyPrompt } from '@/server/ai/aiClient';
import type { LayoutState, StrategyState } from '@/store/landingBuilderStore';

interface GenerateBody {
  strategy: StrategyState;
  layout: LayoutState;
  refinement?: string;
}

export async function POST(req: NextRequest) {
  try {
    const json = (await req.json()) as Partial<GenerateBody>;

    if (!json.strategy || !json.layout) {
      return Response.json(
        { error: 'Thiếu dữ liệu strategy hoặc layout.' },
        { status: 400 }
      );
    }

    const result = await generateReaddyPrompt({
      strategy: json.strategy,
      layout: json.layout,
      refinement: json.refinement,
    });

    return Response.json(result, { status: 200 });
  } catch (err) {
    console.error('generate-readdy error', err);
    return Response.json(
      {
        error:
          'Không sinh được prompt Readdy. Thử lại sau hoặc dùng template tạm thời.',
      },
      { status: 500 }
    );
  }
}

