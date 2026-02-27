// ============================================
// VIBE FROMPT — Prompt Template Engine
// ============================================

export type Category = 'writing' | 'coding' | 'image' | 'data';

export interface FormData {
  category: Category;
  topic: string;
  language: string;
  length: string;
  creativity: number;
  detailLevel: string;
  // Writing
  tone?: string;
  format?: string;
  audience?: string;
  // Coding
  codeLanguage?: string;
  framework?: string;
  requirement?: string;
  pattern?: string;
  // Image
  model?: string;
  aspectRatio?: string;
  version?: string;
  style?: string;
  // Data
  fileType?: string;
  task?: string;
  output?: string;
}

function getLengthLabel(length: string): string {
  const map: Record<string, string> = {
    short: 'ngắn gọn (100-200 từ)',
    medium: 'vừa phải (300-500 từ)',
    long: 'chi tiết (700-1000 từ)',
  };
  return map[length] || length;
}

function getCreativityLabel(c: number): string {
  const labels = ['', 'Rất ổn định', 'Ổn định', 'Cân bằng', 'Sáng tạo', 'Rất sáng tạo'];
  return labels[c] || 'Cân bằng';
}

export function buildPrompt(data: FormData): string {
  const lengthLabel = getLengthLabel(data.length);
  const creativityLabel = getCreativityLabel(data.creativity);
  const detailNote = data.detailLevel === 'advanced'
    ? 'Phân tích sâu, có ví dụ minh họa thực tế, trích dẫn số liệu nếu cần.'
    : 'Trình bày rõ ràng, súc tích, dễ hiểu.';

  if (data.category === 'writing') {
    return `Bạn là một chuyên gia viết nội dung người Việt Nam.

📌 CHỦ ĐỀ: ${data.topic}

🎯 YÊU CẦU CHI TIẾT:
- Giọng văn: ${data.tone || 'Chuyên nghiệp'}
- Định dạng: ${data.format || 'Đoạn văn'}
- Đối tượng độc giả: ${data.audience || 'Đại chúng'}
- Ngôn ngữ: ${data.language === 'vi' ? 'Tiếng Việt' : 'English'}
- Độ dài: ${lengthLabel}
- Mức sáng tạo: ${creativityLabel}

📝 HƯỚNG DẪN:
${detailNote}
Cấu trúc rõ ràng với tiêu đề phụ nếu phù hợp.
Đảm bảo nội dung thu hút và phù hợp với văn phong Việt Nam.
Kết bài bằng một call-to-action hoặc câu kết ấn tượng.`;
  }

  if (data.category === 'coding') {
    return `You are a senior ${data.framework || 'software'} developer with expertise in ${data.codeLanguage || 'JavaScript'}.

📌 TASK: ${data.topic}

🛠️ SPECIFICATIONS:
- Programming Language: ${data.codeLanguage || 'JavaScript'}
- Framework: ${data.framework || 'None'}
- Requirement Type: ${data.requirement || 'Create New'}
- Architecture Pattern: ${data.pattern || 'Clean Architecture'}
- Response Language: ${data.language === 'vi' ? 'Vietnamese explanation + English code' : 'English'}

📝 INSTRUCTIONS:
${detailNote}
1. Start with a brief explanation of the approach
2. Provide clean, production-ready code with comments
3. Follow ${data.pattern || 'Clean Architecture'} best practices
4. Include error handling where appropriate
5. Add usage example at the end

Creativity level: ${creativityLabel}`;
  }

  if (data.category === 'image') {
    return `${data.topic}, ${data.style || 'cinematic'}, ultra detailed, professional lighting, masterpiece quality, 8k resolution, sharp focus

Style keywords: ${data.style || 'realistic'}, volumetric lighting, depth of field, professional composition, color grading

Technical parameters:
--ar ${data.aspectRatio || '16:9'} --v ${data.version || '6'} --style raw --quality 2 --stylize ${data.creativity * 150}

Negative prompt: blurry, low quality, distorted, watermark, text overlay, amateur`;
  }

  if (data.category === 'data') {
    return `Bạn là một chuyên gia phân tích dữ liệu.

📌 DATASET: ${data.topic}

📊 NHIỆM VỤ: ${data.task || 'Phân tích tổng quan'}

🔧 YÊU CẦU:
- Loại file: ${data.fileType || 'CSV'}
- Output format: ${data.output || 'Insight + Visualization'}
- Ngôn ngữ báo cáo: ${data.language === 'vi' ? 'Tiếng Việt' : 'English'}
- Mức độ chi tiết: ${data.detailLevel === 'advanced' ? 'Chuyên sâu' : 'Tổng quan'}

📝 HƯỚNG DẪN:
${detailNote}
1. Mô tả tổng quan về dataset
2. Xác định các patterns và anomalies chính
3. Cung cấp insights có giá trị thực tế
4. Đề xuất các bước tiếp theo
5. Nếu cần code: sử dụng Python (pandas, matplotlib/plotly)

Creativity: ${creativityLabel}`;
  }

  return `Prompt cho: ${data.topic}`;
}

export function generateVariants(basePrompt: string, variant: 'persuasive' | 'technical' | 'emotional'): string {
  const suffixes: Record<string, string> = {
    persuasive: '\n\n[TONE MODIFIER] Làm cho nội dung thuyết phục hơn: sử dụng các từ ngữ tạo cảm giác cấp bách, nhấn mạnh lợi ích rõ ràng, thêm social proof và calls-to-action mạnh mẽ.',
    technical: '\n\n[TONE MODIFIER] Tăng tính kỹ thuật: thêm thuật ngữ chuyên ngành, số liệu cụ thể, references đến best practices và standards công nghiệp.',
    emotional: '\n\n[TONE MODIFIER] Thêm emotional trigger: kết nối với cảm xúc của người đọc, sử dụng storytelling, tạo empathy và resonance cảm xúc mạnh.',
  };
  return basePrompt + suffixes[variant];
}

export function calculateScore(data: FormData): { clarity: number; structure: number; creativity: number } {
  const hasDetails = data.detailLevel === 'advanced';
  const hasSpecifics =
    (data.tone || data.codeLanguage || data.model || data.fileType) !== undefined;

  return {
    clarity: Math.min(100, 75 + (data.topic.length > 20 ? 10 : 0) + (hasSpecifics ? 10 : 0) + (hasDetails ? 5 : 0)),
    structure: Math.min(100, 70 + (hasDetails ? 15 : 5) + (data.creativity >= 3 ? 10 : 5)),
    creativity: Math.min(100, 60 + data.creativity * 8 + (hasDetails ? 5 : 0)),
  };
}
