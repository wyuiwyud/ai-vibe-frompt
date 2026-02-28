import { NextRequest } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ─── Gemini Vision (best, supports base64 natively) ──────────────────────────
async function analyzeWithGeminiVision(imageBase64: string, mimeType: string): Promise<Record<string, string> | null> {
    if (!GEMINI_API_KEY) return null;

    const MODELS = ['gemini-1.5-flash', 'gemini-1.5-flash-latest'];

    const prompt = `You are an expert image analyst and AI prompt engineer. Analyze this image carefully and return ONLY a valid JSON object with exactly these 4 keys. Be very detailed and use professional photography/art terminology:

{
  "subject": "Detailed description of the main subject: appearance, pose, expression, clothing, features, mood, characteristics",
  "environment": "Background setting, location, depth, atmosphere, props, spatial elements, lighting sources",  
  "cinematography": "Camera angle, shot type (close-up/medium/wide/establishing), focal length estimate, depth of field, bokeh, exposure style",
  "style": "Color palette, dominant colors, lighting style (golden hour/studio/cinematic/natural), texture, art direction, mood, film grain, color grading tone"
}

Return ONLY raw JSON. No markdown. No backticks. No explanation text. Just the JSON object.`;

    for (const model of MODELS) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { inline_data: { mime_type: mimeType, data: imageBase64 } },
                            { text: prompt },
                        ],
                    }],
                    generationConfig: { temperature: 0.1, maxOutputTokens: 1000 },
                }),
            });

            if (!res.ok) {
                const errBody = await res.text();
                console.error(`[GeminiVision] ${model} → ${res.status}:`, errBody.slice(0, 150));
                continue;
            }

            const data = await res.json();
            const raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();
            console.log(`[GeminiVision] ✅ ${model} OK (${raw.length} chars)`);
            return parseComponents(raw);
        } catch (e) {
            console.error(`[GeminiVision] ${model} exception:`, e);
        }
    }
    return null;
}

// ─── Groq Text Fallback (user provides description, AI generates 4 cinematic layers) ──
async function analyzeWithGroqText(description: string): Promise<Record<string, string> | null> {
    if (!GROQ_API_KEY || !description) return null;

    const prompt = `You are an elite AI image prompt engineer and cinematographer. Based on this image description, generate 4 detailed cinematic analysis layers.

Image description: "${description}"

Return ONLY a valid JSON object with exactly these 4 keys. Use professional photography, cinematography, and art direction terminology. Be specific and detailed:

{
  "subject": "Vivid description of the main subject/character/object: specific appearance details, pose, expression, clothing/texture, mood, notable features",
  "environment": "Detailed background and setting: location type, depth layers, atmospheric conditions, props, spatial composition, ambient elements",
  "cinematography": "Technical camera details: specific shot type (extreme close-up/medium/wide/aerial), focal length (35mm/85mm/etc), depth of field (shallow bokeh/deep focus), lighting angle, exposure style",
  "style": "Complete visual style: exact color palette (hex codes if possible), primary lighting style (Rembrandt/golden hour/cinematic 3-point/neon/natural), color grading tone, texture quality, overall artistic direction"
}

Return ONLY the raw JSON. No explanation. No markdown.`;

    try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.4,
                max_tokens: 900,
            }),
        });

        if (!res.ok) {
            const errBody = await res.text();
            console.error(`[GroqText] ${res.status}:`, errBody.slice(0, 150));
            return null;
        }

        const data = await res.json();
        const raw = (data?.choices?.[0]?.message?.content ?? '').trim();
        console.log(`[GroqText] ✅ llama-3.3-70b OK (${raw.length} chars)`);
        return parseComponents(raw);
    } catch (e) {
        console.error('[GroqText] exception:', e);
        return null;
    }
}

// ─── JSON helpers ─────────────────────────────────────────────────────────────
function parseComponents(raw: string): Record<string, string> {
    try {
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        // Validate has all 4 keys
        if (parsed.subject && parsed.environment && parsed.cinematography && parsed.style) {
            return parsed;
        }
    } catch { /* fall through */ }

    return {
        subject: extractField(raw, 'subject'),
        environment: extractField(raw, 'environment'),
        cinematography: extractField(raw, 'cinematography'),
        style: extractField(raw, 'style'),
    };
}

function extractField(text: string, field: string): string {
    const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`, 'i');
    return text.match(regex)?.[1] ?? '';
}

// ─── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as {
            imageBase64?: string;
            mimeType?: string;
            description?: string;  // Text description fallback
            mode?: 'vision' | 'text';
        };

        // MODE 1: Text description → Groq text analysis (always works)
        if (body.mode === 'text' || (!body.imageBase64 && body.description)) {
            if (!body.description) {
                return Response.json({ error: 'Cần có mô tả hình ảnh.' }, { status: 400 });
            }
            const components = await analyzeWithGroqText(body.description);
            if (components) return Response.json({ components, mode: 'text' }, { status: 200 });
            return Response.json({ error: 'Không thể tạo phân tích. Vui lòng thử lại.' }, { status: 503 });
        }

        // MODE 2: Image base64 → Gemini Vision (requires quota)
        if (!body.imageBase64) {
            return Response.json({ error: 'Thiếu imageBase64 hoặc description.' }, { status: 400 });
        }

        const mimeType = body.mimeType || 'image/jpeg';
        const sizeKB = Math.round(body.imageBase64.length / 1024);
        console.log(`[Vision] Analyzing image (${sizeKB}KB base64)`);

        // Try Gemini Vision first
        const components = await analyzeWithGeminiVision(body.imageBase64, mimeType);

        if (components && Object.values(components).some(v => v.length > 10)) {
            return Response.json({ components, mode: 'vision' }, { status: 200 });
        }

        // Gemini Vision failed → tell client to switch to text mode
        return Response.json(
            {
                error: 'vision_unavailable',
                message: 'AI Vision đang bận (quota). Hãy mô tả hình ảnh bằng text để phân tích ngay.',
                fallbackMode: 'text',
            },
            { status: 503 }
        );
    } catch (err) {
        console.error('[vision route] error:', err);
        return Response.json({ error: 'Lỗi hệ thống.' }, { status: 500 });
    }
}
