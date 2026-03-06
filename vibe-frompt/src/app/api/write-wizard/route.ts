import { NextRequest } from 'next/server';
import { callGroqText, callGroqChat } from '@/server/ai/aiClient';

// ────────────────────────────────────────────────────────────
// VIBE FROMPT — Writing Intelligence Wizard API (v4.0)
// Actions: analyze | clarify | clarify_confirm | generate
// clarify: Steps A→B→C→D (self-verification pipeline)
// clarify_confirm: Step E (refined answer after user choice)
// generate: 4-phase deep prompt generation
// ────────────────────────────────────────────────────────────

interface WizardBody {
  action: 'analyze' | 'clarify' | 'clarify_confirm' | 'clarify_chat' | 'clarify_reanalysis' | 'stage4_chat' | 'generate';
  rawInput?: string;
  direction?: { name: string; description: string; full_topic?: string; type: string; content_type?: string };
  purpose?: string;
  keywords?: string;
  language?: string;
  userOverrides?: string; // New for V5
  // clarify_confirm extras
  chosenOptionId?: string;
  chosenOptionLabel?: string;
  clarifyContext?: string; // serialized JSON of step A-D results
  chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  userMessage?: string;
  context?: string;
  vibePrompt?: string; // New for Stage 4 Chat
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
    hidden_standards?: string[];
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
    hidden_standards?: string[];
    technical_constraints?: string[];
    scenario_identity?: string | null;
    scenario_blueprint?: string | null;
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
    "format": "<định dạng phát hiện được hoặc null>",
    "level": "<cấp độ giáo dục hoặc null>",
    "domain": "<lĩnh vực — suy luận từ đầu vào>",
    "audience": "<đối tượng mục tiêu — suy luận từ đầu vào>",
    "hidden_standards": ["<danh sách các bộ quy chuẩn/tiêu chuẩn ẩn nếu có, VD: THPT 2025 Phần III>"]
  },
  "web_trends_summary": "<2-3 câu về xu hướng nội dung/nhu cầu cho chủ đề đầy đủ này bằng tiếng Việt, phân tích sâu các từ khóa cụ thể>",
  "directions": [
    {
      "id": "A",
      "label": "A",
      "name": "<tên hướng đi ngắn gọn — 3-5 từ>",
      "full_topic": "<GIỮ NGUYÊN ý tưởng gốc> — <thêm góc nhìn mới>",
      "why_this_direction": "<1-2 câu: lý do chọn hướng này dựa trên phân tích từ khóa & dữ liệu cộng đồng>",
      "content_type": "Blog | Video | Báo cáo | Tiểu luận | Phiếu bài tập | Thread | Email | Kịch bản",
      "relevance_score": 93,
      "audience_fit": "<ai sẽ thấy nội dung này hữu ích nhất — hồ sơ cụ thể>",
      "description": "<1 câu tóm tắt hướng đi này bằng tiếng Việt>",
      "match": 93,
      "type": "Blog | Video | Báo cáo | Tiểu luận | Phiếu bài tập | Thread | Email | Kịch bản"
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
}

IMPORTANT: All values (name, why_this_direction, audience_fit, description, web_trends_summary, etc.) MUST be in VIETNAMESE.
Pay special attention to "Hidden Standards" (e.g. if the user says "trả lời ngắn" in a Vietnamese exam context, they MUST be treated as requesting the NEW 2025 THPT Exam Part III format with specific rounding, negative number, and bubble-filling rules). Detect and flag these!`;

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
    detected_signals: { format: null, level: null, domain: 'Chung', audience: 'Người dùng Việt Nam', hidden_standards: [] },
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
  language: string,
  context?: string
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
  let phaseData: PhaseData | undefined;

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

Return ONLY this JSON in VIETNAMESE:
{
  "phase1_signals": {
    "detected_tokens": [{"token":"<văn bản>","meaning":"<ý nghĩa thực tế>","category":"FORMAT|LEVEL|DOMAIN|AUDIENCE|STYLE","confirmed":true}],
    "format_confirmed": "<định dạng bằng tiếng Việt>",
    "level_confirmed": "<cấp độ giáo dục hoặc null>",
    "domain_confirmed": "<lĩnh vực>",
    "audience_confirmed": "<đối tượng mục tiêu>",
    "hidden_standards": ["<danh sách tiêu chuẩn ẩn phát hiện được>"],
    "technical_constraints": ["<danh sách quy định kỹ thuật cụ thể>"]
  },
  "phase2_self_check": {
    "draft_sample": "<2-3 đầu mục mẫu bằng tiếng Việt>",
    "format_check": "đạt — <lý do>",
    "level_check": "đạt — <lý do>",
    "accuracy_check": "đạt — <lý do>",
    "confidence_score": 88,
    "gaps_detected": ["<lỗ hổng 1>","<lỗ hổng 2>"]
  },
  "phase3_enrichment": {
    "trend_direction": "rising",
    "content_gap": "<phần nội dung còn thiếu trên thị trường>",
    "best_platform": "<nền tảng tối ưu>",
    "rising_related_keywords": ["<từ khoá 1>","<từ khoá 2>","<từ khoá 3>"],
    "competitor_content_summary": "<tóm tắt nội dung đối thủ>",
    "recommended_angle": "<góc độ độc đáo đề xuất>"
  }
}

IMPORTANT: EVERY FIELD MUST BE IN VIETNAMESE.`;

  // ── GROQ CALL 1: Phase 1 + 2 + 3 (analysis pipeline) ──────
  // If we have context from Stage 3, use it!
  if (context) {
    try {
      const ctx = JSON.parse(context);
      // Case 1: Step E (ConfirmData)
      if (ctx.step === 'E') {
        const conf = ctx as any;
        const confSignals = conf.confirmed_signals;
        phaseData = {
          phase1_signals: {
            detected_tokens: [],
            format_confirmed: confSignals?.format_confirmed || contentType,
            level_confirmed: null,
            domain_confirmed: 'Xác nhận từ người dùng',
            audience_confirmed: confSignals?.audience_confirmed || 'Người dùng Việt Nam',
            hidden_standards: conf.hidden_standards || [],
            technical_constraints: conf.technical_constraints || [],
            scenario_identity: confSignals?.selected_scenario_lens?.identity || null,
            scenario_blueprint: confSignals?.selected_scenario_lens?.blueprint || null
          },
          phase2_self_check: {
            draft_sample: conf.refined_answer?.outline?.join('\n') || '',
            format_check: 'pass', level_check: 'pass', accuracy_check: 'pass',
            confidence_score: parseInt(conf.refined_answer?.confidence || '90'),
            gaps_detected: []
          },
          phase3_enrichment: {
            trend_direction: 'stable', content_gap: '', best_platform: '', rising_related_keywords: [],
            competitor_content_summary: '', recommended_angle: confSignals?.unique_angle || ''
          }
        };
      }
      // Case 3: ClarifyData (Steps A-D)
      else if (ctx.step_a) {
        const research = ctx.step_c?.research_results || [];
        const hiddenStandards: string[] = [];
        const allConstraints: string[] = [];
        
        research.forEach((r: any) => {
          if (r.user_manual_override) {
            allConstraints.push(`[USER OVERRIDE for ${r.term}]: ${r.user_manual_override}`);
          } else if (r.user_selected_lens_index !== undefined) {
            const lens = r.micro_lenses[r.user_selected_lens_index];
            if (lens) {
              hiddenStandards.push(`${r.term} (${lens.label}): ${lens.description}`);
              if (lens.technical_constraints) allConstraints.push(...lens.technical_constraints);
            }
          } else {
            // Fallback for non-V4 data or no selection
            const lens = r.micro_lenses?.[0];
            if (lens) {
               hiddenStandards.push(`${r.term}: ${lens.description}`);
               if (lens.technical_constraints) allConstraints.push(...lens.technical_constraints);
            }
          }
        });

        phaseData = {
          phase1_signals: {
            detected_tokens: [],
            format_confirmed: contentType,
            level_confirmed: null,
            domain_confirmed: 'Phân tích từ vựng vi mô',
            audience_confirmed: 'Người dùng Việt Nam',
            hidden_standards: hiddenStandards,
            technical_constraints: allConstraints
          },
          phase2_self_check: {
            draft_sample: ctx.step_a?.preliminary_answer?.outline?.join('\n') || '',
            format_check: 'pass', level_check: 'pass', accuracy_check: 'pass',
            confidence_score: 80, gaps_detected: []
          },
          phase3_enrichment: {
            trend_direction: 'rising', content_gap: '', best_platform: '', rising_related_keywords: [],
            competitor_content_summary: '', recommended_angle: ''
          }
        };
      }
    } catch (err) {
      console.error('[generatePrompt] Context parse error', err);
    }
  }

  if (!phaseData) {
    const analysisText = await callGroqText(analysisPrompt, 0.55);
    const parsedAnalysis = extractJson(analysisText);
    if (parsedAnalysis && parsedAnalysis.phase1_signals && parsedAnalysis.phase2_self_check && parsedAnalysis.phase3_enrichment) {
      phaseData = parsedAnalysis;
    }
  }

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
- Selected Scenario Identity: ${p1?.scenario_identity || 'Senior Expert'}
- Selected Blueprint: ${p1?.scenario_blueprint || 'Standard Professional Structure'}
- Output language: ${lang}${keywords ? `\n- User keywords/brand: ${keywords}` : ''}${p2?.gaps_detected?.length ? `\n- Known gaps to address: ${p2.gaps_detected.join(', ')}` : ''}${p3?.content_gap ? `\n- Content gap opportunity: ${p3.content_gap}` : ''}${p3?.recommended_angle ? `\n- Recommended unique angle: ${p3.recommended_angle}` : ''}${p3?.best_platform ? `\n- Best platform: ${p3.best_platform}` : ''}${p3?.rising_related_keywords?.length ? `\n- Rising related keywords: ${p3.rising_related_keywords.join(', ')}` : ''}

Generate ONE complete master writing prompt in ${lang} using this EXACT structure:

[ROLE]
Define an ultra-specific expert role: "${p1?.scenario_identity || `Domain Expert in ${p1?.domain_confirmed ?? contentType}`}".
${p1?.scenario_identity ? `Act STRICTLY as this persona: ${p1.scenario_identity}.` : ''}

[TASK]
Precise task: content type = "${p1?.format_confirmed ?? contentType}", topic = "${fullTopic}", goal = ${purpose}.
Blueprint to follow: "${p1?.scenario_blueprint || 'Standard structure'}".
Include the unique angle: ${p3?.recommended_angle ?? 'authoritative, differentiated perspective'}.

[CONTEXT]
• Hidden Standards detected: ${p1?.hidden_standards?.join(', ') || 'None identified'}
• Technical Constraints & User Commands: 
${p1?.technical_constraints?.map(c => `  - ${c}`).join('\n') || '  - Follow best practices'}
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
1. Strictly follow "${p1?.format_confirmed ?? contentType}" format — do not mix with other formats.
2. Strictly adhere to these Hidden Standards: ${p1?.hidden_standards?.join('; ') || 'Standard professional quality'}.
3. Implement these Technical Constraints & User Commands EXACTLY: ${p1?.technical_constraints?.map(c => `[CRITICAL] ${c}`).join('; ') || 'Standard formatting'}.
4. Address these gaps explicitly: ${p2?.gaps_detected?.join('; ') ?? 'maintain depth and specificity'}.
5. ${purposeNote}
6. Leverage rising keywords naturally: ${p3?.rising_related_keywords?.join(', ') ?? '(relevant to topic)'}.
7. Never open with clichés like "Trong thế giới ngày nay..." or generic phrases.
8. ${p3?.recommended_angle ? `Unique angle to maintain throughout: ${p3.recommended_angle}` : 'Maintain a unique, differentiated perspective.'}

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
  language: string,
  userOverrides?: string
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
- user_manual_interference: "${userOverrides || 'none'}"

━━━ CRITICAL CONSTRAINT ━━━
If the original_idea contains a clear "Format Signal" (e.g., "bài tập", "10 câu hỏi", "lesson plan"), ALL scenarios in STEP D MUST be variations of that EXACT format. 
Example: If user asks for "exercises", Scenario 1, 2, and 3 MUST be different types of exercises. DO NOT suggest "viral content" or "blog posts" if the format is "exercises".

If user_manual_interference is provided, it is a NON-NEGOTIABLE command. Recalibrate Step B, C, and D based on this interference immediately.

━━━ STEP A — PRELIMINARY ANSWER (unverified) ━━━
Generate an immediate preliminary title and outline based on current understanding.
Label it clearly as unverified. State your current_understanding and confidence (0-100%).

━━━ STEP B — KEYWORD & SENTENCE DEEP ANALYSIS ━━━
Analyze EACH keyword and the ENTIRE sentence structure for hidden professional or academic context. For each term that might be:
- A specialized jargon / technical term (e.g., "ăn mòn kim loại")
- An official format standard (e.g., "trả lời ngắn" = NEW 2025 THPT Exam Part III format)
- A community-shared prompt pattern (e.g., "RTCE", "AIDA")
- Something AI commonly misinterprets
Flag it with: assumed_meaning, why_might_be_wrong, needs_web_search=true.

━━━ STEP C — CROSS-WEB & COMMUNITY SEARCH SIMULATION ━━━
For each term with needs_web_search=true, act as a "Consultant" cross-referencing with official 2025 standards and professional prompt engineering communities:
- What does it actually mean officially/technically? (e.g., check if "ăn mòn kim loại" in a "trả lời ngắn" exam context refers to the specific Part III scoring format of the new 2025 THPT Exam).
- Was your assumption correct? (Identify specific academic or industry standard versions).
- Why would the user use this exact term? (Hidden Intent analysis — look for unspoken exam patterns or professional requirements).
- Extract EXACT technical constraints (e.g., scoring rules, character limits, bubble-filling requirements like "tô từ trái sang phải, bỏ trống ô phải").
- Identify the most effective Community Prompt Pattern (e.g., "Use RTCE Framework for this specific educational task").

━━━ STEP D — ULTRA DEEP DISCOVERY SCENARIOS ━━━
If you find that the user's intent could be interpreted in multiple professional or academic ways, generate 3 DISTINCT "Scenario Lenses".

🚨 FORMAT STICKINESS ENFORCEMENT 🚨
If the original_idea OR content_type implies a SPECIFIC FORMAT (e.g., "10 câu hỏi", "bài tập", "bài test", "đề thi"), ALL 3 scenarios MUST BE variations of that EXACT format.
- DO NOT suggest "Bài viết Viral", "Blog", or "Storytelling" if the user asked for exercises/tests.
- Instead, suggest variations like: "Đề thi chuẩn cấu trúc 2025", "Bài tập nâng cao Olympic", "Bài kiểm tra đánh giá năng lực cơ bản".

Each lens must include:
- A specific Expert Identity (who is writing this?)
- The specific Data/Standards it forces (what rules does it follow?)
- The best Prompt Blueprint it will use (e.g., RTCE, AIDA, Step-by-Step, Academic Thesis structure).

If all assumptions were consistent with only one scenario: generate 3 variations of that scenario with different depth levels.

Return ONLY this JSON in VIETNAMESE:
{
  "step_a": {
    "label": "Phản hồi ban đầu — chưa xác minh",
    "preliminary_answer": {
      "title": "<tiêu đề nháp>",
      "outline": ["<ý chính 1>", "<ý chính 2>", "<ý chính 3>"],
      "current_understanding": "<AI đang phân tích cả câu và phát hiện các tầng nghĩa ẩn bên dưới từ khóa>",
      "confidence": "<0-100%>"
    }
  },
  "step_b": {
    "terms_to_verify": [
      {
        "term": "<từ chính xác từ ý tưởng gốc>",
        "assumed_meaning": "<AI giả định từ này nghĩa là gì>",
        "why_might_be_wrong": "<rủi ro hiểu sai lăng kính dữ liệu người dùng cần>",
        "needs_web_search": true
      }
    ]
  },
  "step_c": {
    "research_results": [
      {
        "term": "<từ khoá>",
        "micro_lenses": [
          {
            "label": "<Tên lăng kính dữ liệu 1>",
            "description": "<mô tả chuyên sâu về kịch bản này>",
            "is_trend": <true/false>,
            "technical_constraints": ["<ràng buộc 1>", "<ràng buộc 2>"]
          },
          {
            "label": "<Tên lăng kính dữ liệu 2>",
            "description": "<mô tả kịch bản khác>",
            "is_trend": <true/false>,
            "technical_constraints": []
          }
        ],
        "source": "<nguồn dữ liệu mô phỏng>"
      }
    ]
  },
  "step_d": {
    "has_corrections": true,
    "options": [
      {
        "option_id": "Scenario_1",
        "label": "<Tên chuyên môn 1 (Phải tuân thủ tuyệt đối định dạng yêu cầu)>",
        "identity": "<Danh tính chuyên gia 1 (vd: Chuyên gia ra đề, Kỹ sư trưởng...)>",
        "what_this_means": "<Kịch bản cụ thể 1>",
        "blueprint": "<Cấu trúc Prompt tối ưu cho kịch bản 1>",
        "grounded_in": "<Nguồn dữ liệu phân tích>"
      },
      {
        "option_id": "Scenario_2",
        "label": "<Tên chuyên môn 2 (Phải tuân thủ tuyệt đối định dạng yêu cầu)>",
        "identity": "<Danh tính chuyên gia 2>",
        "what_this_means": "<Kịch bản cụ thể 2>",
        "blueprint": "<Cấu trúc Prompt tối ưu cho kịch bản 2>",
        "grounded_in": "<Nguồn dữ liệu phân tích>"
      },
      {
        "option_id": "Scenario_3",
        "label": "<Tên chuyên môn 3 (Phải tuân thủ tuyệt đối định dạng yêu cầu)>",
        "identity": "<Danh tính chuyên gia 3>",
        "what_this_means": "<Kịch bản cụ thể 3>",
        "blueprint": "<Cấu trúc Prompt tối ưu cho kịch bản 3>",
        "grounded_in": "<Nguồn dữ liệu phân tích>"
      }
    ],
    "ready_for_phase5": false,
    "community_pattern": "<Đề xuất định dạng/cấu trúc chung nhất từ cộng đồng>"
  }
}

IMPORTANT: Responses for title, outline, current_understanding, assumed_meaning, research_results, etc. MUST be in VIETNAMESE.`;

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

Return ONLY this JSON in VIETNAMESE:
{
  "step": "E",
  "confirmed_understanding": "<Bây giờ AI hiểu ý tưởng gốc thực sự nghĩa là gì>",
  "refined_answer": {
    "title": "<tiêu đề cụ thể, đã cập nhật theo lựa chọn của người dùng>",
    "outline": ["<ý chi tiết 1>", "<ý chi tiết 2>", "<ý chi tiết 3>", "<ý chi tiết 4>"],
    "delta_from_step_A": "<những điểm khác biệt cụ thể so với bản nháp ban đầu>",
    "confidence": "<0-100% — phải cao hơn Bước A>"
  },
  "confirmed_signals": {
    "format_confirmed": "<định dạng nội dung đã xác nhận>",
    "audience_confirmed": "<đối tượng mục tiêu đã xác nhận>",
    "unique_angle": "<góc nhìn độc đáo người dùng đã chọn giúp nội dung nổi bật>",
    "selected_scenario_lens": {
      "identity": "<danh tính chuyên gia>",
      "blueprint": "<cấu trúc prompt đã chọn>"
    }
  },
  "ready_for_phase5": true
}

IMPORTANT: All values must be in VIETNAMESE.`;

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
 
// ─── Stage 3: Chat Interactively with AI for refinement ──────
async function runClarifyChat(
  rawInput: string,
  clarifyContext: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string,
  language: string
): Promise<object> {
  const lang = language === 'en' ? 'English' : 'Tiếng Việt';
  
  const prompt = `You are the Interactive Clarification Assistant (Stage 3). Your goal is to help the user refine their content plan through conversation.
 
CONTEXT:
- Original idea: "${rawInput}"
- Current Clarification State: ${clarifyContext}
- Chat History: ${JSON.stringify(chatHistory)}
 
USER'S NEW MESSAGE: "${userMessage}"
 
INSTRUCTIONS:
1. Be helpful, professional, and ultra-knowledgeable about the detected standards (e.g. 2025 THPT exam) or community patterns.
2. If the user asks for more information or clarification on the AI's research, provide it.
3. If the user wants to change something about the plan, acknowledge it and explain how it will affect the final prompt.
4. Keep the original idea SACRED.
5. Answer in ${lang}.
 
Return ONLY JSON:
{
  "assistant_response": "<phản hồi của AI trợ lý bằng tiếng Việt>",
  "refined_signal_detected": "<nếu có sự thay đổi lớn về định hướng, hãy tóm tắt ở đây, nếu không thì để null>",
  "is_ready_to_finish": false
}`;
 
  const text = await callGroqText(prompt, 0.7);
  const parsed = extractJson(text);
  return parsed || { assistant_response: "Tôi có thể giúp gì thêm cho bạn trong việc tinh chỉnh nội dung này?", refined_signal_detected: null, is_ready_to_finish: false };
}

// ─── Stage 4: Integrated AI Assistant (Chatbot) ──────────────
async function runStage4Chat(
  vibePrompt: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string,
  language: string
): Promise<object> {
  const lang = language === 'en' ? 'English' : 'Tiếng Việt';
  
  const prompt = `You are an absolute Expert embodied by the following system instructions (VIBE Prompt). 
Your ONLY personality, rules, exact tone, styles, and constraints are defined by this VIBE Prompt below.

--- THE VIBE PROMPT (YOUR EXPERT SYSTEM PROMPT) ---
${vibePrompt}
---------------------------------------------------

CHAT CONTEXT:
Chat History: ${JSON.stringify(chatHistory)}
User's New Message: "${userMessage}"

INSTRUCTIONS:
1. You MUST act exactly as the expert described in the VIBE Prompt.
2. If the user asks you to "write", "draft", or "generate" content, DO IT immediately, applying all rules, hidden standards (like 2025 exams), and constraints found in the VIBE prompt.
3. Format your response beautifully in Markdown. Do NOT output JSON. Just output the raw Markdown response.
4. Answer in ${lang}.`;

  const text = await callGroqChat(prompt, 0.7);
  return { assistant_response: text || "Hệ thống đang bận, vui lòng thử lại sau." };
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
        body.language ?? 'vi',
        body.userOverrides // New for V5
      );
      return Response.json(result, { status: 200 });
    }

    if (body.action === 'clarify_reanalysis') {
      if (!body.rawInput || !body.direction) {
        return Response.json({ error: 'Missing rawInput or direction' }, { status: 400 });
      }
      const result = await runClarify(
        body.rawInput,
        body.direction.full_topic ?? `${body.rawInput} — ${body.direction.name}`,
        body.direction.content_type ?? body.direction.type ?? 'Blog',
        body.purpose ?? 'Brand Authority',
        body.keywords ?? '',
        body.language ?? 'vi',
        body.userOverrides
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

    if (body.action === 'clarify_chat') {
      if (!body.rawInput || !body.userMessage) {
        return Response.json({ error: 'Missing rawInput or userMessage' }, { status: 400 });
      }
      const result = await runClarifyChat(
        body.rawInput,
        body.clarifyContext ?? '{}',
        body.chatHistory ?? [],
        body.userMessage,
        body.language ?? 'vi'
      );
      return Response.json(result, { status: 200 });
    }

    if (body.action === 'stage4_chat') {
      if (!body.vibePrompt || !body.userMessage) {
        return Response.json({ error: 'Missing vibePrompt or userMessage' }, { status: 400 });
      }
      const result = await runStage4Chat(
        body.vibePrompt,
        body.chatHistory ?? [],
        body.userMessage,
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
        body.language ?? 'vi',
        body.context
      );
      return Response.json(result, { status: 200 });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('[write-wizard] error', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

