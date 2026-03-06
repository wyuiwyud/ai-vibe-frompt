import { NextRequest } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ─── Gemini Vision (best, supports base64 natively) ──────────────────────────
async function analyzeWithGeminiVision(imageBase64: string, mimeType: string): Promise<Record<string, string> | null> {
    if (!GEMINI_API_KEY) return null;

    // Try newest models first — gemini-2.0-flash is free tier and more reliable
    const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];

    const prompt = `You are a professional visual analyst and prompt architect. Analyze this image and extract 6 core layers as JSON. Be extremely precise and use industry-standard terminology.

{
  "subject": "Mô tả chuyên sâu về nhân vật/vật thể: tỉ lệ, chất liệu, tư thế, cảm xúc, trang phục chi tiết",
  "environment": "Không gian, bối cảnh, chiều sâu trường ảnh, các lớp hậu cảnh, không khí",
  "layout": "Bố cục (Rule of thirds, centered, v.v.), tỷ lệ vàng, sự sắp xếp các khối hình học, tiêu điểm thị giác",
  "text": "Văn bản chính xác trong ảnh, nội dung slogan, logo, biểu tượng, các yếu tố đồ họa vector",
  "cinematography": "Góc máy chuyên môn, tiêu cự lens, phong cách ánh sáng, kỹ thuật phơi sáng (long exposure, v.v.)",
  "style": "Phong cách nghệ thuật (Retro, Futuristic, Impressonism, v.v.), bảng màu hex, mood lừng lẫy"
}

IMPORTANT: Respond in VIETNAMESE. Return ONLY raw JSON. No markdown. No backticks. No explanation text. Just the JSON object.`;

    for (const model of MODELS) {
        try {
            // Using v1beta for better model coverage
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
                console.error(`[GeminiVision] ${model} → ${res.status}:`, errBody);
                continue;
            }

            const data = await res.json();
            const raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();
            console.log(`[GeminiVision] ✅ ${model} OK (${raw.length} chars)`);
            return robustParse(raw);
        } catch (e) {
            console.error(`[GeminiVision] ${model} exception:`, e);
        }
    }
    return null;
}

async function generateFinalWithGeminiVision(imageBase64: string, mimeType: string, components: Record<string, string>): Promise<Record<string, string> | null> {
    if (!GEMINI_API_KEY) return null;
    const model = 'gemini-1.5-flash';

    const prompt = `You are a Senior Vision Strategist. Analyze this image and 6 descriptive layers:
- Subject: ${components.subject}
- Environment: ${components.environment}
- Layout: ${components.layout}
- Text: ${components.text}
- Cinematography: ${components.cinematography}
- Style: ${components.style}

Your mission:
1. Synthesize these layers into a master prompt that captures the original's SOUL and MESSAGE (INTENT).
2. Ensure text content and layout structure are primary constraints.
3. Elevate descriptions to "Professional Grade" (qualified, sophisticated terminology).

Respond in VIETNAMESE in JSON with keys: "master", "galaxy4d", "cinematic". Return ONLY raw JSON. No markdown. No backticks.`;

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
                generationConfig: { temperature: 0.2, maxOutputTokens: 2000 },
            }),
        });

        if (!res.ok) {
            console.error(`[GeminiStage2] Error ${res.status}`);
            return null;
        }
        const data = await res.json();
        const raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();
        return robustParse(raw);
    } catch (e) {
        console.error('[GeminiStage2] exception:', e);
        return null;
    }
}

// ─── Groq Vision Support ───────────────────────────────────────────────────────
async function analyzeWithGroqVision(imageBase64: string, mimeType: string): Promise<Record<string, string> | null> {
    if (!GROQ_API_KEY) return null;

    const dataUrl = `data:${mimeType};base64,${imageBase64}`;
    const prompt = `You are an expert image analyst. Extract 6 layers to JSON.
{
  "subject": "Chủ thể",
  "environment": "Bối cảnh",
  "layout": "Bố cục & Tỉ lệ",
  "text": "Văn bản & Ký hiệu",
  "cinematography": "Kỹ thuật máy ảnh",
  "style": "Phong cách & Màu sắc"
}
IMPORTANT: Respond in Vietnamese.`;

    // Try current Groq vision models (2025)
    const VISION_MODELS = ['llama-4-scout-17b-16e-instruct', 'llama-4-maverick-17b-128e-instruct', 'meta-llama/llama-4-scout-17b-16e-instruct'];

    for (const model of VISION_MODELS) {
        try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: prompt },
                                { type: 'image_url', image_url: { url: dataUrl } },
                            ],
                        },
                    ],
                    temperature: 0.2,
                    response_format: { type: 'json_object' },
                }),
            });

            if (!res.ok) {
                const errBody = await res.text();
                console.error(`[GroqVision] ${model} failed ${res.status}:`, errBody.slice(0, 200));
                continue;
            }

            const data = await res.json();
            const raw = (data?.choices?.[0]?.message?.content ?? '').trim();
            console.log(`[GroqVision] ✅ ${model} OK (${raw.length} chars)`);
            return robustParse(raw);
        } catch (e) {
            console.error(`[GroqVision] ${model} exception:`, e);
        }
    }
    return null;
}

async function generateFinalWithGroqVision(imageBase64: string, mimeType: string, components: Record<string, string>): Promise<Record<string, string> | null> {
    if (!GROQ_API_KEY) return null;

    const prompt = `You are a Master Prompt Strategist. Synthesize this image and its 6 descriptive layers:
- Subject: ${components.subject}
- Env: ${components.environment}
- Layout: ${components.layout}
- Text: ${components.text}
- Lens: ${components.cinematography}
- Style: ${components.style}

Elevate these into 3 high-standard professional prompts. Capture the GOAL and INTENT perfectly.
Respond in VIETNAMESE in JSON: {"master": "...", "galaxy4d": "...", "cinematic": "..."}`;

    try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-4-scout-17b-16e-instruct',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
                        ],
                    },
                ],
                temperature: 0.2,
                response_format: { type: 'json_object' },
            }),
        });

        if (!res.ok) {
            console.error(`[GroqStage2] Error ${res.status}`);
            return null;
        }
        const data = await res.json();
        const raw = (data?.choices?.[0]?.message?.content ?? '').trim();
        return robustParse(raw);
    } catch (e) {
        console.error('[GroqStage2] exception:', e);
        return null;
    }
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
                response_format: { type: 'json_object' },
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
        return robustParse(raw);
    } catch (e) {
        console.error('[GroqText] exception:', e);
        return null;
    }
}

// ─── JSON helpers ─────────────────────────────────────────────────────────────
function robustParse(raw: string): Record<string, string> | null {
    try {
        // Try direct parse first
        return JSON.parse(raw);
    } catch {
        try {
            // Find the first { and last }
            const first = raw.indexOf('{');
            const last = raw.lastIndexOf('}');
            if (first !== -1 && last !== -1) {
                const cleaned = raw.substring(first, last + 1);
                return JSON.parse(cleaned);
            }
        } catch (e) {
            console.error('[robustParse] Cleaned parse failed:', e);
        }
    }
    return null;
}

function extractField(text: string, field: string): string {
    const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`, 'i');
    return text.match(regex)?.[1] ?? '';
}

// ─── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    console.log('[Vision] POST request received');
    try {
        const body = await req.json() as {
            imageBase64?: string;
            mimeType?: string;
            description?: string;
            components?: Record<string, string>;
            mode?: 'vision' | 'text' | 'generate_final';
        };

        if (body.mode === 'generate_final') {
            if (!body.imageBase64 || !body.components) {
                return Response.json({ error: 'Thiếu dữ liệu để tạo prompt cuối.' }, { status: 400 });
            }
            const mimeType = body.mimeType || 'image/jpeg';
            console.log('[Vision] Stage 2: Synthesis starting...');

            let result = await generateFinalWithGroqVision(body.imageBase64, mimeType, body.components);
            if (!result) {
                console.log('[Vision] Groq Stage 2 failed, trying Gemini...');
                result = await generateFinalWithGeminiVision(body.imageBase64, mimeType, body.components);
            }

            if (result) return Response.json({ prompts: result }, { status: 200 });
            return Response.json({ error: 'Không thể tổng hợp prompt. Thử lại.' }, { status: 503 });
        }

        // MODE 2: Image base64 → Vision Engines
        if (!body.imageBase64) {
            return Response.json({ error: 'Thiếu imageBase64 hoặc description.' }, { status: 400 });
        }

        const mimeType = body.mimeType || 'image/jpeg';
        const sizeKB = Math.round(body.imageBase64.length / 1024);
        console.log(`[Vision] Analyzing image (${sizeKB}KB base64)`);

        // 1. Try Groq Vision first (as requested by user)
        console.log('[Vision] Attempting Groq Vision...');
        let components = await analyzeWithGroqVision(body.imageBase64, mimeType);

        // 2. Fallback to Gemini Vision if Groq fails
        if (!components || !Object.values(components).some(v => v.length > 5)) {
            console.log('[Vision] Groq failed or returned empty, trying Gemini fallback...');
            components = await analyzeWithGeminiVision(body.imageBase64, mimeType);
        }

        if (components && Object.values(components).some(v => v.length > 10)) {
            console.log('[Vision] Component analysis successful');
            return Response.json({ components, mode: 'vision' }, { status: 200 });
        }

        console.error('[Vision] All engines failed to return valid components');

        // All Vision Engines failed → tell client to switch to text mode
        return Response.json(
            {
                error: 'vision_unavailable',
                message: 'Phân tích hình ảnh hiện không khả dụng. Hãy mô tả hình ảnh bằng text để tiếp tục.',
                fallbackMode: 'text',
            },
            { status: 503 }
        );
    } catch (err) {
        console.error('[vision route] error:', err);
        return Response.json({ error: 'Lỗi hệ thống.' }, { status: 500 });
    }
}
