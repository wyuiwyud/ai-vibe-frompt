import { NextRequest } from 'next/server';
import { generateReaddyPrompt, generateLandingDirections, refineLandingPlan } from '@/server/ai/aiClient';
import type { LayoutState, StrategyState, ChatMessage } from '@/features/landing-builder/types';

interface GenerateBody {
  mode?: 'get_directions' | 'generate_final' | 'refine_strategy';
  strategy: StrategyState;
  layout: LayoutState;
  refinement?: string;
  chatHistory?: ChatMessage[];
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

    if (json.mode === 'get_directions') {
      const directions = await generateLandingDirections(json.strategy);
      return Response.json({ directions }, { status: 200 });
    }

    if (json.mode === 'refine_strategy') {
      const response = await refineLandingPlan(json.chatHistory || [], json.strategy);
      return Response.json({ response }, { status: 200 });
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

