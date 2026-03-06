import { NextRequest } from 'next/server';
import { callGroqText } from '@/server/ai/aiClient';

// ────────────────────────────────────────────────────────────
// VIBE FROMPT — Writing Intelligence Wizard API (v4.0)
// Actions: analyze | clarify | clarify_confirm | generate
// clarify: Steps A→B→C→D (self-verification pipeline)
// clarify_confirm: Step E (refined answer after user choice)
// generate: 4-phase deep prompt generation
// ────────────────────────────────────────────────────────────

interface WizardBody {
  action: 'analyze' | 'clarify' | 'clarify_confirm' | 'generate';
  rawInput?: string;
  direction?: { name: string; description: string; full_topic?: string; type: string; content_type?: string };
  purpose?: string;
  keywords?: string;
  language?: string;
  // clarify_confirm extras
  chosenOptionId?: string;
  chosenOptionLabel?: string;
  clarifyContext?: string; // serialized JSON of step A-D results
}

// ─── Shared types ─────────────────────────────────────────────
export interface DirectionItem {
  id: string;
  label: string;
  name: string;
  full_topic: string;
  why_this_direction: string;
  content_type: string;
  relevance_score: number;
  audience_fit: string;
  description: string;
  match: number;
  type: string;
}

export interface AnalyzeResult {
  original_idea_preserved: string;
  detected_signals: {
    format: string | null;
    level: string | null;
    domain: string;
    audience: string;
  };
  web_trends_summary: string;
  directions: DirectionItem[];
}

export interface PhaseData {
  phase1_signals: {
    detected_tokens: Array<{ token: string; meaning: string; category: string; confirmed: boolean }>;
    format_confirmed: string;
    level_confirmed: string | null;
    domain_confirmed: string;
    audience_confirmed: string;
  };
  phase2_self_check: {
    draft_sample: string;
    format_check: string;
    level_check: string;
    accuracy_check: string;
    confidence_score: number;
    gaps_detected: string[];
  };
  phase3_enrichment: {
    trend_direction: 'rising' | 'stable' | 'declining';
    content_gap: string;
    best_platform: string;
    rising_related_keywords: string[];
    competitor_content_summary: string;
    recommended_angle: string;
  };
}

// ─── STAGE 2: Analyze raw input → 3 directions ──────────────
async function analyzeInput(rawInput: string): Promise<AnalyzeResult> {
  const prompt = `You are an intelligent content direction advisor integrated into a content creation platform.

## YOUR CORE RULE (NEVER VIOLATE):
The user's original idea is SACRED. You must PRESERVE the FULL original phrase 
as the base of every suggested direction. NEVER fragment, strip, or decompose 
the original idea into isolated keywords.

## INPUT:
Original idea: "${rawInput}"

## TASK — Generate 3 content directions:
For each direction:
1. KEEP the original idea 100% intact as the topic foundation
2. ADD a content angle/lens on top of it (not replace parts of it)
3. Provide web trend justification for the FULL original phrase
4. Explain WHY this direction fits the original intent

## SPECIAL INTELLIGENCE REQUIRED:
Before generating directions, analyze the original idea for:
- Format signals (e.g., "dạng câu trả lời ngắn", "short answer", "multiple choice") → FORMAT constraints, preserve in ALL directions
- Level signals (e.g., "lớp 12", "THPT", "đại học") → Educational context, keep intact
- Domain signals (e.g., "ăn mòn kim loại", "phản ứng hóa học") → Core subject, never split
- Audience signals (e.g., "học sinh", "giáo viên") → Use for direction targeting

## EXAMPLE OF WRONG vs RIGHT:
❌ WRONG: Original "Bài tập hóa học 12 về ăn mòn kim loại dạng câu trả lời ngắn"
  Direction A: "Bài tập hóa học" ← STRIPPED (WRONG)
✅ RIGHT:
  Direction A: "Bài tập hóa học 12 về ăn mòn kim loại dạng câu trả lời ngắn — Bộ đề luyện thi THPT Quốc gia"
  Direction B: "Bài tập hóa học 12 về ăn mòn kim loại dạng câu trả lời ngắn — Hướng dẫn giải chi tiết cho giáo viên"
  Direction C: "Bài tập hóa học 12 về ăn mòn kim loại dạng câu trả lời ngắn — So sánh xu hướng đề thi 2020–2025"

Return ONLY this JSON (no markdown, no explanation):
{
  "original_idea_preserved": "${rawInput}",
  "detected_signals": {
    "format": "<detected format type or null>",
    "level": "<educational level or null>",
    "domain": "<subject domain — inferred from input>",
    "audience": "<target audience — inferred from input>"
  },
  "web_trends_summary": "<2-3 sentences about trending content formats/demand for this FULL topic>",
  "directions": [
    {
      "id": "A",
      "label": "A",
      "name": "<short angle name — 3-5 words>",
      "full_topic": "<EXACT original idea> — <added angle>",
      "why_this_direction": "<1-2 sentences: why this angle + trend data>",
      "content_type": "Blog | Video | Report | Essay | Exercise Sheet | Thread | Email | Script",
      "relevance_score": 93,
      "audience_fit": "<who this serves best — specific profile>",
      "description": "<1 sentence summary of this direction>",
      "match": 93,
      "type": "Blog | Video | Report | Essay | Exercise Sheet | Thread | Email | Script"
    },
    {
      "id": "B", "label": "B",
      "name": "...", "full_topic": "...", "why_this_direction": "...",
      "content_type": "...", "relevance_score": 82, "audience_fit": "...",
      "description": "...", "match": 82, "type": "..."
    },
    {
      "id": "C", "label": "C",
      "name": "...", "full_topic": "...", "why_this_direction": "...",
      "content_type": "...", "relevance_score": 71, "audience_fit": "...",
      "description": "...", "match": 71, "type": "..."
    }
  ]
}`;

  const text = await callGroqText(prompt, 0.65);

  const parsed = extractJson(text);
  if (parsed && parsed.directions && Array.isArray(parsed.directions) && parsed.directions.length > 0) {
    parsed.directions = parsed.directions.map((d: any) => ({
      ...d,
      match: d.match ?? d.relevance_score ?? 80,
      type: d.type ?? d.content_type ?? 'Blog',
      description: d.description ?? d.why_this_direction ?? '',
    }));
    return parsed;
  }

  // Fallback — preserves original idea
  const fallbackAngle = (angle: string, type: string, score: number, audience: string): DirectionItem => ({
    id: angle, label: angle,
    name: angle === 'A' ? 'Phân tích chuyên sâu' : angle === 'B' ? 'Hướng dẫn thực hành' : 'Góc nhìn sáng tạo',
    full_topic: `${rawInput} — ${angle === 'A' ? 'Phân tích toàn diện & xu hướng' : angle === 'B' ? 'Hướng dẫn từng bước cho người thực hành' : 'Góc nhìn phản biện & tương lai'}`,
    why_this_direction: `Hướng ${angle} phù hợp với ${audience} đang tìm kiếm nội dung về chủ đề này.`,
    content_type: type, relevance_score: score,
    audience_fit: audience, description: `Triển khai "${rawInput}" theo hướng ${angle === 'A' ? 'phân tích' : angle === 'B' ? 'thực hành' : 'sáng tạo'}`,
    match: score, type,
  });

  return {
    original_idea_preserved: rawInput,
    detected_signals: { format: null, level: null, domain: 'General', audience: 'Người dùng Việt Nam' },
    web_trends_summary: `Nội dung về "${rawInput}" đang được tìm kiếm nhiều. Định dạng blog phân tích và hướng dẫn thực tế nhận được lượng tương tác cao nhất.`,
    directions: [
      fallbackAngle('A', 'Blog', 92, 'Người đọc muốn hiểu sâu về chủ đề'),
      fallbackAngle('B', 'Exercise Sheet', 81, 'Người học, giáo viên, thực hành viên'),
      fallbackAngle('C', 'Essay', 69, 'Người nghiên cứu, tư duy phân tích'),
    ],
  };
}

// ─── STAGE 3→4: 4-Phase Deep Prompt Generation ──────────────
async function generatePrompt(
  rawInput: string,
  direction: { name: string; description: string; full_topic?: string; type: string; content_type?: string },
  purpose: string,
  keywords: string,
  language: string
): Promise<{
  prompt: string;
  metaReview: string;
  scores: { clarity: number; structure: number; creativity: number };
  phaseData?: PhaseData;
}> {
  const lang = language === 'en' ? 'English' : 'Tiếng Việt';
  const isVi = language !== 'en';
  const contentType = direction.content_type ?? direction.type ?? 'Blog';
  const fullTopic = direction.full_topic ?? `${rawInput} — ${direction.name}`;

  // ── GROQ CALL 1: Phase 1 + 2 + 3 (analysis pipeline) ──────
  const analysisPrompt = `You are an intelligent content analysis engine (Stage 3).
Analyze the original idea through 3 phases. Return ONLY valid JSON — no markdown, no commentary.

INPUTS:
- original_idea: "${rawInput}"
- selected_direction: "${fullTopic}"
- content_type: "${contentType}"
- selected_goal: "${purpose || 'Brand Authority'}"
- custom_keywords: "${keywords || 'none'}"
- output_language: "${lang}"

PHASE 1 — SIGNAL DETECTION:
Scan the original idea. For each signal token, identify: exact text, confirmed real-world meaning, category (FORMAT|LEVEL|DOMAIN|AUDIENCE|STYLE), confirmed (true/false).
Then produce: format_confirmed, level_confirmed (or null), domain_confirmed, audience_confirmed.

Format signals include: "dạng câu trả lời ngắn", "trắc nghiệm", "tự luận", "short answer", "multiple choice", "thread", "viral"
Level signals include: "lớp 12", "THPT", "đại học", "Olympic", grade/education references

PHASE 2 — AI SELF-ANSWER TEST:
Generate a brief draft sample (2-3 items/sentences) in the confirmed format.
Self-evaluate: format_check (pass/fail + reason), level_check, accuracy_check, confidence_score (0-100), gaps_detected.

PHASE 3 — TREND & CONTEXT ENRICHMENT:
Based on knowledge of content trends:
trend_direction: "rising"|"stable"|"declining"
content_gap: what's missing in existing content
best_platform: optimal platform for this content type
rising_related_keywords: 3-5 trending adjacent terms
competitor_content_summary: what typically exists
recommended_angle: unique angle not covered elsewhere

Return ONLY this JSON:
{
  "phase1_signals": {
    "detected_tokens": [{"token":"<text>","meaning":"<confirmed>","category":"FORMAT|LEVEL|DOMAIN|AUDIENCE|STYLE","confirmed":true}],
    "format_confirmed": "<format>",
    "level_confirmed": "<level or null>",
    "domain_confirmed": "<domain>",
    "audience_confirmed": "<audience>"
  },
  "phase2_self_check": {
    "draft_sample": "<2-3 items>",
    "format_check": "pass — <reason>",
    "level_check": "pass — <reason>",
    "accuracy_check": "pass — <reason>",
    "confidence_score": 88,
    "gaps_detected": ["<gap1>","<gap2>"]
  },
  "phase3_enrichment": {
    "trend_direction": "rising",
    "content_gap": "<gap>",
    "best_platform": "<platform>",
    "rising_related_keywords": ["<kw1>","<kw2>","<kw3>"],
    "competitor_content_summary": "<summary>",
    "recommended_angle": "<angle>"
  }
}`;

  let phaseData: PhaseData | undefined;
  const analysisText = await callGroqText(analysisPrompt, 0.55);
  const parsedAnalysis = extractJson(analysisText);
  if (parsedAnalysis && parsedAnalysis.phase1_signals && parsedAnalysis.phase2_self_check && parsedAnalysis.phase3_enrichment) {
    phaseData = parsedAnalysis;
  }

  // ── GROQ CALL 2: Phase 4 — Deep Prompt Generation ──────────
  const p1 = phaseData?.phase1_signals;
  const p2 = phaseData?.phase2_self_check;
  const p3 = phaseData?.phase3_enrichment;

  const purposeInstructions: Record<string, string> = {
    'SEO & Traffic': 'Tối ưu SEO: heading H2/H3 chứa từ khoá mục tiêu, meta description suggestion, internal linking instruction, schema markup notes.',
    'Viral / Engagement': 'Tối ưu viral: hook 3 giây đầu phải arresting, pattern interrupt mỗi 100 từ, emotional trigger, shareable one-liner insight.',
    'Brand Authority': 'Xây authority: dẫn chứng chuyên gia có tên tuổi, case study thực tế có số liệu, perspective flip độc đáo, counter-narrative.',
    'Chuyển đổi (Sales/Lead)': 'Tối ưu conversion: AIDA structure, pain point cụ thể, social proof 2+ dạng, urgency element, CTA A/B options.',
  };
  const purposeNote = purposeInstructions[purpose] ?? 'Tối ưu cho mục tiêu người dùng đã chọn.';

  const deepPromptGen = `You are VIBE Writing Intelligence creating a master writing prompt using 4-phase analysis results.

CONFIRMED ANALYSIS (from Phase 1–3):
- Original idea (SACRED, preserve exactly): "${rawInput}"
- Full topic with direction: "${fullTopic}"
- Confirmed format: ${p1?.format_confirmed ?? contentType}
- Confirmed level: ${p1?.level_confirmed ?? 'General'}
- Domain: ${p1?.domain_confirmed ?? 'General content'}
- Target audience: ${p1?.audience_confirmed ?? 'Vietnamese readers'}
- Content type: ${contentType}
- Goal: ${purpose || 'Brand Authority'}
- Output language: ${lang}${keywords ? `\n- User keywords/brand: ${keywords}` : ''}${p2?.gaps_detected?.length ? `\n- Known gaps to address: ${p2.gaps_detected.join(', ')}` : ''}${p3?.content_gap ? `\n- Content gap opportunity: ${p3.content_gap}` : ''}${p3?.recommended_angle ? `\n- Recommended unique angle: ${p3.recommended_angle}` : ''}${p3?.best_platform ? `\n- Best platform: ${p3.best_platform}` : ''}${p3?.rising_related_keywords?.length ? `\n- Rising related keywords: ${p3.rising_related_keywords.join(', ')}` : ''}

Generate ONE complete master writing prompt in ${lang} using this EXACT structure:

[ROLE]
Define an ultra-specific expert role (domain + years + specific specialty). Match confirmed domain "${p1?.domain_confirmed ?? contentType}".

[TASK]
Precise task: content type = "${p1?.format_confirmed ?? contentType}", topic = "${fullTopic}", goal = ${purpose}.
Include the unique angle: ${p3?.recommended_angle ?? 'authoritative, differentiated perspective'}.

[CONTEXT]
• Target audience: ${p1?.audience_confirmed ?? 'Vietnamese readers interested in the topic'}
• Publishing platform: ${p3?.best_platform ?? 'Website / LinkedIn'}
• Tone: [specific tone matching audience "${p1?.audience_confirmed}" and goal "${purpose}"]
• Format: [exact structure for confirmed format type "${p1?.format_confirmed ?? contentType}"]
• Language: ${lang}
• Length: [specific word/item count matching "${p1?.format_confirmed ?? contentType}"]
• Keywords: ${keywords || p3?.rising_related_keywords?.join(', ') || '(select most relevant)'}
• Goal: ${purpose || 'Brand Authority'}
• Content gap to fill: ${p3?.content_gap ?? 'comprehensive, high-quality treatment'}

[EXAMPLE — EXPECTED OUTPUT]
Sample opening/first item: "${p2?.draft_sample ? p2.draft_sample.split('\n')[0] : '[Hook/example matching confirmed format]'}"
Structure:
  → Section 1: [specific to confirmed format "${p1?.format_confirmed ?? contentType}"]
  → Section 2: [main content matched to audience needs]
  → Section 3: [fill content gap: ${p3?.content_gap ?? 'depth and specificity'}]
  → Closing: [CTA / conclusion aligned with ${purpose}]

[INSTRUCTION — NON-NEGOTIABLE]
1. ${p1?.format_confirmed ? `Strictly follow "${p1.format_confirmed}" format — do not mix with other formats.` : 'Follow the confirmed content format precisely.'}
2. Address these gaps explicitly: ${p2?.gaps_detected?.join('; ') ?? 'maintain depth and specificity'}.
3. Leverage rising keywords naturally: ${p3?.rising_related_keywords?.join(', ') ?? '(relevant to topic)'}.
4. ${purposeNote}
5. Never open with clichés like "Trong thế giới ngày nay..." or generic phrases.
6. ${p3?.recommended_angle ? `Unique angle to maintain throughout: ${p3.recommended_angle}` : 'Maintain a unique, differentiated perspective.'}

[ITERATE — SELF-CHECK LOOP]
After the first draft:
• Check: Does the opening match format "${p1?.format_confirmed ?? contentType}"? If weak → rewrite.
• Check: Are "${p1?.audience_confirmed ?? 'target audience'}" needs fully met? If not → add specifics.
• Check: Is the content gap "${p3?.content_gap ?? 'depth'}" addressed? If not → strengthen.
• Output the best version after self-correction.

${isVi ? 'IMPORTANT: Write the entire prompt in Tiếng Việt.' : 'IMPORTANT: Write the entire prompt in English.'}
OUTPUT: Final master prompt only. No meta-commentary. No markdown outside the structure.`;

  const promptText = await callGroqText(deepPromptGen, 0.78);

  // Score — boosted by phase data quality
  const hasKeywords = keywords.length > 5;
  const hasPurpose = purpose.length > 3;
  const topicLen = rawInput.length;
  const phaseBonus = phaseData ? 8 : 0;
  const confidenceBonus = p2?.confidence_score ? Math.round((p2.confidence_score - 70) / 10) : 0;

  const scores = {
    clarity: Math.min(97, 76 + (topicLen > 20 ? 8 : 0) + (hasKeywords ? 6 : 0) + (hasPurpose ? 4 : 0) + phaseBonus + confidenceBonus),
    structure: Math.min(97, 80 + (hasPurpose ? 10 : 0) + (hasKeywords ? 5 : 0) + phaseBonus),
    creativity: Math.min(97, 72 + (topicLen > 30 ? 7 : 0) + (hasKeywords ? 8 : 0) + (hasPurpose ? 7 : 0) + phaseBonus + confidenceBonus),
  };

  // Meta review (Stage 5)
  const metaReviewPrompt = `You are a Prompt Engineering Expert. Evaluate this writing prompt generated by the VIBE 4-Phase pipeline.

PROMPT:
${promptText || '[Generation failed]'}

Return ONLY JSON:
{
  "checks": {"role":true,"task":true,"context":true,"example":true,"instruction":true},
  "frameworks": ["RTCE+I Framework","4-Phase Analysis Pipeline","Self-critique loop","Content Gap Strategy"],
  "suggestions": ["<suggestion 1>","<suggestion 2>"],
  "summary": "<1-2 sentence assessment>"
}`;

  const metaText = await callGroqText(metaReviewPrompt, 0.5);
  const parsedMeta = extractJson(metaText);

  const finalPrompt = (promptText && promptText.length > 100)
    ? promptText
    : buildFallbackWritingPrompt(rawInput, direction, purpose, keywords, lang, p3?.recommended_angle);

  return { prompt: finalPrompt, metaReview: metaText || '', scores, phaseData };
}

// ─── Fallback prompt ─────────────────────────────────────────
function buildFallbackWritingPrompt(
  topic: string,
  direction: { name: string; description: string; type: string; full_topic?: string },
  purpose: string,
  keywords: string,
  lang: string,
  uniqueAngle?: string
): string {
  const fullTopic = direction.full_topic ?? `${topic} — ${direction.name}`;
  return `[ROLE]
Bạn là chuyên gia Content Creator & Senior Copywriter với 10+ năm kinh nghiệm tạo nội dung ${direction.type} chuyên sâu và có ảnh hưởng lớn trên thị trường kỹ thuật số.

[TASK]
Viết ${direction.type} về: "${fullTopic}"
${uniqueAngle ? `Góc độ độc đáo: ${uniqueAngle}` : ''}
Mục tiêu: ${purpose || 'Brand Authority'}

[CONTEXT]
• Đối tượng đọc: Người dùng Việt Nam quan tâm đến chủ đề này
• Ngữ cảnh xuất bản: Website / LinkedIn / Facebook
• Tông giọng: Chuyên nghiệp nhưng gần gũi, dễ hiểu
• Định dạng: Hook → Thân bài có cấu trúc → CTA
• Ngôn ngữ: ${lang}
• Độ dài: 800-1200 từ
${keywords ? `• Từ khoá trọng tâm: ${keywords}` : ''}

[EXAMPLE — OUTPUT MONG ĐỢI]
Hook mẫu: "Bạn có biết rằng [số liệu gây ngạc nhiên liên quan đến ${topic}]?"
Cấu trúc mẫu:
  → Phần 1 — Đặt vấn đề: tại sao chủ đề này quan trọng
  → Phần 2 — Phân tích / Giải pháp: 3-4 điểm chính có dẫn chứng
  → Phần 3 — Takeaway: bài học & hành động cụ thể
  → Kết bài: CTA phù hợp với mục tiêu ${purpose}

[INSTRUCTION — YÊU CẦU BẮT BUỘC]
1. Mở đầu bằng hook mạnh (câu hỏi kích thích, số liệu impact, hoặc story ngắn).
2. Mỗi đoạn không quá 4 câu — scannable, không lan man.
3. Đưa vào ít nhất 2-3 số liệu hoặc ví dụ thực tế có nguồn tin cậy.
4. Kết bài bằng CTA rõ ràng, cụ thể, dễ hành động.
5. Tuyệt đối không mở đầu bằng "Trong thế giới ngày nay..." hay các clichés sáo rỗng.
6. Sau khi viết xong, tự cải thiện phần hook và kết bài trước khi xuất.

[ITERATE — VÒNG PHẢN HỒI]
Viết bản đầu → Tự đánh giá hook → Kiểm tra từng đoạn → Cải thiện → Xuất kết quả tốt nhất.`.trim();
}

// ─── Stage 3: Step A→B→C→D Self-Verification Pipeline ───────
async function runClarify(
  rawInput: string,
  chosenDirection: string,
  contentType: string,
  goal: string,
  keywords: string,
  language: string
): Promise<object> {
  const lang = language === 'en' ? 'English' : 'Tiếng Việt';

  const prompt = `You are the Phase 3 Intelligence Engine in an AI content creation platform.
You just received original_idea and chosen direction. Your mission: self-verify your understanding
BEFORE producing content. Run all steps and return a single JSON response.

INPUTS:
- original_idea: "${rawInput}"
- chosen_direction: "${chosenDirection}"
- content_type: "${contentType}"
- optimization_goal: "${goal || 'Brand Authority'}"
- custom_keywords: "${keywords || 'none'}"
- output_language: "${lang}"

━━━ STEP A — PRELIMINARY ANSWER (unverified) ━━━
Generate an immediate preliminary title and outline based on current understanding.
Label it clearly as unverified. State your current_understanding and confidence (0-100%).

━━━ STEP B — SELF-DOUBT ━━━
Scan ALL terms in original_idea. For each term that might be:
- A specialized jargon / technical term
- An official format standard (e.g., "dạng câu trả lời ngắn" = THPT short-answer format)
- A policy/org/domain-specific term
- Something AI commonly misinterprets
Flag it with: assumed_meaning, why_might_be_wrong, needs_web_search (true/false).

━━━ STEP C — KNOWLEDGE-BASED VERIFICATION ━━━
For each term with needs_web_search=true, verify using your knowledge:
- What does it actually mean officially/technically?
- Was your assumption correct?
- Why would the user use this exact term?

━━━ STEP D — CLARIFICATION OPTIONS ━━━
If ANY assumption was wrong (understanding_was_correct=false):
Generate 2-4 clickable option buttons for the user to choose their actual intent.
Each option must clearly reflect a DIFFERENT interpretation/direction grounded in the research.

If all assumptions were correct: set options to [] (skip to ready_for_phase5=true directly).

Return ONLY this JSON (no markdown, no extra text):
{
  "step_a": {
    "label": "Phản hồi ban đầu — chưa xác minh",
    "preliminary_answer": {
      "title": "<draft title>",
      "outline": ["<point 1>", "<point 2>", "<point 3>"],
      "current_understanding": "<what AI currently thinks original_idea means>",
      "confidence": "<0-100%>"
    }
  },
  "step_b": {
    "terms_to_verify": [
      {
        "term": "<exact term from original_idea>",
        "assumed_meaning": "<what AI assumes it means>",
        "why_might_be_wrong": "<reason AI is uncertain>",
        "needs_web_search": true
      }
    ]
  },
  "step_c": {
    "research_results": [
      {
        "term": "<term>",
        "what_i_assumed": "<assumption>",
        "what_is_actually_true": "<verified truth>",
        "source": "<knowledge source>",
        "understanding_was_correct": true,
        "what_changed": "<if wrong: what changed>",
        "why_user_likely_used_this_term": "<user intent>"
      }
    ]
  },
  "step_d": {
    "has_corrections": false,
    "options": [
      {
        "option_id": "R1",
        "label": "<short label for button>",
        "what_this_means": "<how content will be shaped if user picks this>",
        "grounded_in": "<which research finding led to this option>"
      }
    ],
    "ready_for_phase5": false
  }
}`;

  const text = await callGroqText(prompt, 0.6);
  const parsed = extractJson(text);
  if (!parsed) {
    console.error('[write-wizard] clarify parse error: extractJson returned null');
    return {
      step_a: { label: 'Phản hồi ban đầu', preliminary_answer: { title: rawInput, outline: ['Chưa phân tích được', 'Thử lại'], current_understanding: rawInput, confidence: '50%' } },
      step_b: { terms_to_verify: [] },
      step_c: { research_results: [] },
      step_d: { has_corrections: false, options: [], ready_for_phase5: true },
    };
  }
  return parsed;
}

// ─── Stage 3: Step E — Refined answer after user's choice ────
async function runClarifyConfirm(
  rawInput: string,
  chosenDirection: string,
  chosenOptionId: string,
  chosenOptionLabel: string,
  clarifyContext: string,
  language: string
): Promise<object> {
  const lang = language === 'en' ? 'English' : 'Tiếng Việt';

  const prompt = `You are the Phase 3 Intelligence Engine. The user just chose clarification option "${chosenOptionId}: ${chosenOptionLabel}".

CONTEXT:
- original_idea: "${rawInput}"
- chosen_direction: "${chosenDirection}"
- user_selected_option: "${chosenOptionId} — ${chosenOptionLabel}"
- previous_analysis: ${clarifyContext}
- output_language: "${lang}"

TASK — STEP E:
Now that you know what the user actually means, produce a refined, confident answer that is
CLEARLY BETTER than Step A. It must incorporate the research findings and the user's choice.

Rules:
- original_idea must be preserved 100% — never fragment it
- The outline must be more specific and actionable than Step A
- delta_from_step_A must clearly explain how this differs from the unverified draft
- confidence must be higher than Step A's confidence

Return ONLY this JSON:
{
  "step": "E",
  "confirmed_understanding": "<Now what AI understands original_idea truly means>",
  "refined_answer": {
    "title": "<updated, specific title reflecting user's choice>",
    "outline": ["<detailed point 1>", "<detailed point 2>", "<detailed point 3>", "<detailed point 4>"],
    "delta_from_step_A": "<specific differences from the preliminary draft>",
    "confidence": "<0-100% — must be higher than Step A>"
  },
  "confirmed_signals": {
    "format_confirmed": "<confirmed content format>",
    "audience_confirmed": "<confirmed target audience>",
    "unique_angle": "<the angle chosen by user that makes this content stand out>"
  },
  "ready_for_phase5": true
}`;

  const text = await callGroqText(prompt, 0.65);
  const parsed = extractJson(text);
  if (!parsed) {
    console.error('[write-wizard] clarify_confirm parse error: extractJson returned null');
    return {
      step: 'E',
      confirmed_understanding: `${rawInput} — ${chosenOptionLabel}`,
      refined_answer: { title: `${rawInput} — ${chosenOptionLabel}`, outline: ['Phân tích chuyên sâu', 'Hướng dẫn thực hành', 'Takeaway & CTA'], delta_from_step_A: 'Đã tinh chỉnh theo lựa chọn của bạn', confidence: '85%' },
      confirmed_signals: { format_confirmed: 'Blog', audience_confirmed: 'Người dùng Việt Nam', unique_angle: chosenOptionLabel },
      ready_for_phase5: true,
    };
  }
  return parsed;
}

// ─── Helper: Robust JSON Extraction ──────────────────────────
function extractJson(text: string) {
  try {
    // 1. Clean markdown code blocks
    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
    // 2. Try to find the first '{' and last '}'
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[write-wizard] JSON extraction failed', e);
    return null;
  }
}

// ─── Route Handler ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WizardBody;

    if (!body.action) {
      return Response.json({ error: 'Missing action' }, { status: 400 });
    }

    if (body.action === 'analyze') {
      if (!body.rawInput) {
        return Response.json({ error: 'Missing rawInput' }, { status: 400 });
      }
      const result = await analyzeInput(body.rawInput);
      return Response.json(result, { status: 200 });
    }

    if (body.action === 'clarify') {
      if (!body.rawInput || !body.direction) {
        return Response.json({ error: 'Missing rawInput or direction' }, { status: 400 });
      }
      const result = await runClarify(
        body.rawInput,
        body.direction.full_topic ?? `${body.rawInput} — ${body.direction.name}`,
        body.direction.content_type ?? body.direction.type ?? 'Blog',
        body.purpose ?? 'Brand Authority',
        body.keywords ?? '',
        body.language ?? 'vi'
      );
      return Response.json(result, { status: 200 });
    }

    if (body.action === 'clarify_confirm') {
      if (!body.rawInput || !body.direction || !body.chosenOptionId) {
        return Response.json({ error: 'Missing required fields for clarify_confirm' }, { status: 400 });
      }
      const result = await runClarifyConfirm(
        body.rawInput,
        body.direction.full_topic ?? `${body.rawInput} — ${body.direction.name}`,
        body.chosenOptionId,
        body.chosenOptionLabel ?? body.chosenOptionId,
        body.clarifyContext ?? '{}',
        body.language ?? 'vi'
      );
      return Response.json(result, { status: 200 });
    }

    if (body.action === 'generate') {
      if (!body.rawInput || !body.direction) {
        return Response.json({ error: 'Missing rawInput or direction' }, { status: 400 });
      }
      const result = await generatePrompt(
        body.rawInput,
        body.direction,
        body.purpose ?? 'Brand Authority',
        body.keywords ?? '',
        body.language ?? 'vi'
      );
      return Response.json(result, { status: 200 });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('[write-wizard] error', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

