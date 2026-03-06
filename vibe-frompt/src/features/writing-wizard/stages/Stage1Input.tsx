'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Stage1InputProps {
  onAnalyze: (rawInput: string, language: string) => void;
  defaultLanguage: string;
}

// ─── Kho dữ liệu local (instant fallback khi AI đang tải) ─────
// Đây là kho nền để hiển thị NGAY khi AI chưa trả về
const LOCAL_BANK: string[] = [
  // 🤖 AI & Công nghệ
  'AI thay thế con người — thực tế hay viễn tưởng',
  'AI trong giáo dục Việt Nam — cơ hội và thách thức',
  'Tác động của AI đến thị trường lao động 2025',
  'ChatGPT và cuộc cách mạng viết lách số',
  'Machine learning cho người không biết code',
  'Metaverse — tương lai hay bong bóng kinh tế',
  'Robotics và tự động hoá trong sản xuất Việt Nam',
  'Cybersecurity trong thời đại số — bảo vệ dữ liệu',
  'Big Data và ứng dụng trong doanh nghiệp Việt',
  'Blockchain ứng dụng vào chuỗi cung ứng',

  // 📚 Giáo dục (Mở rộng)
  'Cải cách giáo dục Việt Nam — góc nhìn chuyên gia',
  'STEM education và tương lai học sinh Việt Nam',
  'Học online vs học offline — ưu nhược điểm thực tế',
  'Gamification trong giáo dục — kết quả thực tế',
  'Trường đại học có còn cần thiết trong kỷ nguyên AI',
  'Kỹ năng mềm quan trọng hơn bằng cấp hay không',
  'Phương pháp Montessori ứng dụng tại Việt Nam',
  'EdTech startup Việt Nam — bức tranh 2025',
  'Giáo dục tài chính cho học sinh từ sớm',
  'Học nghề vs học đại học — lựa chọn nào thực tế hơn',
  'Kỹ năng tư duy phản biện trong giáo dục phổ thông',
  'Project-based learning và hiệu quả thực tế',
  'Đại học quốc tế tại Việt Nam — có đáng học không',
  'Microlearning — học theo module nhỏ hiệu quả hơn',
  'Học coding từ cấp tiểu học — xu hướng toàn cầu',
  'Học bổng du học — chiến lược chuẩn bị từ sớm',
  'Tiếng Anh học thuật (IELTS/TOEFL) — lộ trình thực tế',
  'Hệ thống giáo dục Finland — bài học cho Việt Nam',
  'Cha mẹ nên đồng hành cùng con học thế nào',
  'Giáo viên trước áp lực đổi mới phương pháp dạy',
  'Chương trình VNEN — thành công hay thất bại',
  'Học cùng AI tutor — trải nghiệm thực tế ra sao',

  // 📈 Marketing & Kinh doanh
  'Content marketing 0 đồng cho startup Việt Nam',
  'Personal branding trên LinkedIn từ con số 0',
  'TikTok marketing cho thương hiệu B2B',
  'Email marketing vẫn hiệu quả hơn social media',
  'SEO 2025 — những thứ đã thay đổi hoàn toàn',
  'Chiến lược growth hacking cho startup giai đoạn đầu',
  'Influencer marketing — ROI thực sự là bao nhiêu',
  'Xây dựng community trước khi bán hàng',
  'Quảng cáo Facebook vs TikTok vs Google — so sánh thực tế',
  'D2C brand Việt Nam — câu chuyện thành công',

  // 🧠 Sức khoẻ & Lifestyle
  'Sức khoẻ tâm thần Gen Z — con số đáng lo ngại',
  'Burnout và cách phục hồi bền vững',
  'Work-life balance trong kỷ nguyên remote work',
  'Thói quen sáng giúp tăng năng suất cả ngày',
  'Mindfulness cho người bận rộn — thực hành thực tế',
  'Sleep hacking — cải thiện giấc ngủ bằng khoa học',
  'Dinh dưỡng và hiệu suất làm việc trí tuệ',
  'Digital detox — thực tế có thể làm được không',
  'Dopamine detox và nghiện mạng xã hội',
  'Chạy bộ và những lợi ích tâm lý ít ai biết',

  // 💰 Tài chính & Đầu tư
  'Đầu tư chứng khoán cho người mới — từ đầu',
  'Quản lý tài chính cá nhân nguyên tắc 50-30-20',
  'Passive income — những mô hình thực sự hoạt động',
  'Crypto bear market — bài học và cơ hội',
  'Quản lý dòng tiền cho freelancer độc lập',
  'Tiết kiệm và đầu tư khi lương dưới 10 triệu',
  'FIRE movement — về hưu sớm có khả thi tại Việt Nam',
  'Bất động sản vs chứng khoán — phân tích 2025',
  'Startup funding — VC, angel và crowdfunding',

  // 🌏 Xã hội & Văn hoá
  'Gen Z vs Millennials — giá trị sống khác nhau thế nào',
  'Văn hoá làm việc startup vs tập đoàn lớn',
  'Du lịch bền vững — không chỉ là trend',
  'Kinh tế sáng tạo và cơ hội người trẻ Việt Nam',
  'Biến đổi khí hậu — trách nhiệm cá nhân và doanh nghiệp',
  'Bình đẳng giới trong môi trường làm việc Việt Nam',
  'Nông thôn mới — cơ hội khởi nghiệp ở vùng quê',
  'Văn hoá đọc sách đang chết hay đang chuyển đổi',

  // ✍️ Content Creation
  'Cách viết hook thu hút trong 3 giây đầu',
  'Storytelling trong marketing — nghệ thuật kể chuyện bán hàng',
  'Video short-form — TikTok Reels YouTube Shorts so sánh',
  'Newsletter — kênh content underrated nhất 2025',
  'Cách viết bài SEO chuẩn E-E-A-T mới nhất',
  'Podcast marketing — cách bắt đầu từ số 0',
  'Thread dài trên Twitter/LinkedIn — nghệ thuật giữ người đọc',
  'Cách tạo nội dung viral mà không cần may mắn',
];

// ─── Trending khi ô trống ─────────────────────────────────────
const TRENDING_TOPICS = [
  { icon: '🤖', label: 'AI & Công nghệ', query: 'AI thay thế con người' },
  { icon: '📚', label: 'Giáo dục', query: 'cải cách giáo dục Việt Nam' },
  { icon: '📈', label: 'Marketing 2025', query: 'xu hướng marketing digital 2025' },
  { icon: '🧠', label: 'Sức khoẻ tâm thần', query: 'sức khoẻ tâm thần Gen Z' },
  { icon: '💰', label: 'Tài chính cá nhân', query: 'đầu tư tài chính cá nhân từ đầu' },
  { icon: '✍️', label: 'Content Creation', query: 'cách viết hook thu hút cho mạng xã hội' },
];

// ─── Instant local suggestions (trong khi AI tải) ────────────
function getLocalSuggestions(query: string): string[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length > 1);

  return LOCAL_BANK
    .map(s => {
      const sl = s.toLowerCase();
      let score = 0;
      if (sl.startsWith(q)) score += 120;
      if (words.every(w => sl.includes(w))) score += 60;
      score += words.filter(w => sl.includes(w)).length * 18;
      if (sl.includes(q)) score += 35;
      return { s, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(x => x.s);
}

export default function Stage1Input({ onAnalyze, defaultLanguage }: Stage1InputProps) {
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState(defaultLanguage || 'vi');

  // Suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiPowered, setIsAiPowered] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const canAnalyze = input.trim().length >= 3;

  // ─── Handler chính khi user gõ ────────────────────────────
  const handleInput = useCallback((value: string) => {
    setInput(value);
    setActiveSuggestion(-1);
    setIsAiPowered(false);

    const q = value.trim();

    if (q.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsAiLoading(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    // 1. Hiện ngay từ local bank (instant <1ms)
    const localResults = getLocalSuggestions(q);
    setSuggestions(localResults);
    setShowSuggestions(true);
    setIsAiLoading(q.length >= 2); // Chỉ gọi AI khi đủ ký tự

    // 2. Debounce 480ms rồi gọi AI để ghi đè bằng kết quả thông minh hơn
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (q.length < 2) {
      setIsAiLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const abort = new AbortController();
      abortRef.current = abort;
      setIsAiLoading(true);

      try {
        const res = await fetch('/api/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q, language }),
          signal: abort.signal,
        });

        if (!res.ok) throw new Error('API error');
        const data = await res.json() as { suggestions: string[] };

        if (!abort.signal.aborted && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
          setIsAiPowered(true);
        }
      } catch (e: unknown) {
        if (e instanceof Error && e.name !== 'AbortError') {
          console.warn('[suggest] AI fallback to local', e.message);
        }
      } finally {
        if (!abort.signal.aborted) setIsAiLoading(false);
      }
    }, 480);
  }, [language]);

  // ─── Keyboard navigation ──────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey && canAnalyze) {
      onAnalyze(input.trim(), language);
      return;
    }
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Tab') {
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        e.preventDefault();
        applySelection(suggestions[activeSuggestion]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const applySelection = (value: string) => {
    setInput(value);
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    setIsAiLoading(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();
    textareaRef.current?.focus();
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return (
    <div style={{
      background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(123,47,255,0.2)',
      borderRadius: 24, padding: '36px 32px', backdropFilter: 'blur(30px)',
      boxShadow: '0 0 60px rgba(123,47,255,0.08)',
    }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(123,47,255,0.1), rgba(0,245,255,0.05))',
        border: '1px solid rgba(123,47,255,0.2)', borderRadius: 14,
        padding: '14px 18px', marginBottom: 28,
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <span style={{ fontSize: 22 }}>🔍</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#7b2fff', marginBottom: 3 }}>
            GIAI ĐOẠN 1 — NHẬN ĐẦU VÀO THÔ
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            Nhập bất kỳ ý tưởng nào — từ khoá, câu ngắn, hay yêu cầu cụ thể.<br />
            AI <strong style={{ color: '#7b2fff' }}>hiểu ngữ nghĩa</strong> và gợi ý thông minh theo ngữ cảnh. Dùng ↑↓ chọn, Tab nhận.
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>

        {/* Main input + Autocomplete wrapper */}
        <div ref={wrapperRef} style={{ position: 'relative' }}>
          <label style={{
            display: 'block', fontSize: 12, fontWeight: 700,
            color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: 10,
          }}>
            Ý tưởng / Chủ đề / Yêu cầu <span style={{ color: '#7b2fff' }}>*</span>
          </label>

          <div style={{ position: 'relative' }}>
            <textarea
              ref={textareaRef}
              className="input-cyber"
              rows={3}
              value={input}
              onChange={e => handleInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              placeholder="Gõ bất kỳ ý tưởng nào... AI sẽ gợi ý thông minh theo ngữ nghĩa..."
              style={{ resize: 'vertical', fontSize: 15, lineHeight: 1.6, paddingRight: 48 }}
            />

            {/* Status icon góc phải */}
            <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
              {/* AI loading spinner */}
              <AnimatePresence>
                {isAiLoading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    style={{
                      width: 22, height: 22, borderRadius: '50%',
                      border: '2px solid rgba(123,47,255,0.2)',
                      borderTop: '2px solid #7b2fff',
                      animation: 'spin 0.7s linear infinite',
                    }}
                    title="AI đang tìm kiếm..."
                  />
                )}
              </AnimatePresence>
              {/* Clear button */}
              <AnimatePresence>
                {input.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => {
                      setInput('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                      setIsAiLoading(false);
                      setIsAiPowered(false);
                      if (debounceRef.current) clearTimeout(debounceRef.current);
                      if (abortRef.current) abortRef.current.abort();
                      textareaRef.current?.focus();
                    }}
                    style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s', lineHeight: 1, padding: 0,
                    }}
                    title="Xóa để nhập lại"
                  >
                    ×
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* ─── AI Suggestion Dropdown ─────────────────── */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scaleY: 0.9 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -10, scaleY: 0.9 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                    zIndex: 999, transformOrigin: 'top',
                    background: 'rgba(6,2,22,0.97)',
                    border: `1px solid ${isAiPowered ? 'rgba(123,47,255,0.5)' : 'rgba(123,47,255,0.25)'}`,
                    borderRadius: 16, overflow: 'hidden',
                    boxShadow: `0 16px 48px rgba(0,0,0,0.7), 0 0 ${isAiPowered ? '20px' : '0px'} rgba(123,47,255,0.15)`,
                    backdropFilter: 'blur(30px)',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                  }}
                >
                  {/* Dropdown header */}
                  <div style={{
                    padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isAiLoading ? (
                        <>
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: '#7b2fff',
                            animation: 'pulse 1s ease infinite',
                          }} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#7b2fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            AI đang phân tích ngữ nghĩa...
                          </span>
                        </>
                      ) : isAiPowered ? (
                        <>
                          <span style={{ fontSize: 12 }}>✨</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#7b2fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Gợi ý AI · Theo ngữ nghĩa
                          </span>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: 12 }}>💡</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Gợi ý nhanh
                          </span>
                        </>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
                      {suggestions.length > 0 ? `${suggestions.length} gợi ý · ↑↓ chọn · Tab nhận` : 'Đang tải...'}
                    </span>
                  </div>

                  {/* Suggestion items */}
                  {suggestions.length === 0 && isAiLoading ? (
                    // Loading skeleton
                    <div style={{ padding: '12px 14px', display: 'grid', gap: 8 }}>
                      {[1, 2, 3].map(i => (
                        <div key={i} style={{
                          height: 16, borderRadius: 6,
                          background: 'rgba(123,47,255,0.08)',
                          width: `${70 + i * 8}%`,
                          animation: 'pulse 1.2s ease infinite',
                        }} />
                      ))}
                    </div>
                  ) : (
                    suggestions.map((s, i) => {
                      const isActive = i === activeSuggestion;
                      // Highlight phần match
                      const q = input.toLowerCase().trim();
                      const sl = s.toLowerCase();
                      const matchIdx = sl.indexOf(q);

                      return (
                        <motion.button
                          key={`${s}-${i}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onMouseDown={e => { e.preventDefault(); applySelection(s); }}
                          onMouseEnter={() => setActiveSuggestion(i)}
                          style={{
                            width: '100%', textAlign: 'left',
                            padding: '11px 14px', cursor: 'pointer', border: 'none',
                            background: isActive ? 'rgba(123,47,255,0.2)' : 'transparent',
                            borderLeft: `3px solid ${isActive ? '#7b2fff' : 'transparent'}`,
                            color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                            fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                            transition: 'all 0.1s',
                            display: 'flex', alignItems: 'center', gap: 10,
                          }}
                        >
                          {/* Icon */}
                          <span style={{
                            width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                            background: isActive
                              ? (isAiPowered ? 'rgba(123,47,255,0.35)' : 'rgba(0,245,255,0.15)')
                              : 'rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, transition: 'all 0.15s',
                          }}>
                            {isActive ? '→' : (isAiPowered ? '✨' : '💡')}
                          </span>

                          {/* Text with highlight */}
                          <span style={{ flex: 1, lineHeight: 1.45 }}>
                            {matchIdx >= 0 && q.length > 0 ? (
                              <>
                                {s.slice(0, matchIdx)}
                                <strong style={{ color: isAiPowered ? '#c4a0ff' : '#00f5ff' }}>
                                  {s.slice(matchIdx, matchIdx + q.length)}
                                </strong>
                                {s.slice(matchIdx + q.length)}
                              </>
                            ) : s}
                          </span>

                          {/* Tab hint */}
                          {isActive && (
                            <span style={{
                              fontSize: 9, color: 'rgba(123,47,255,0.6)',
                              border: '1px solid rgba(123,47,255,0.3)',
                              borderRadius: 4, padding: '1px 5px', flexShrink: 0,
                            }}>
                              Tab ↵
                            </span>
                          )}
                        </motion.button>
                      );
                    })
                  )}

                  {/* Footer chú thích */}
                  {isAiPowered && (
                    <div style={{
                      padding: '7px 14px', borderTop: '1px solid rgba(255,255,255,0.05)',
                      fontSize: 10, color: 'rgba(123,47,255,0.5)',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <span>✨</span>
                      <span>Powered by Groq AI · Hiểu ngữ nghĩa · Tham chiếu xu hướng thực tế</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
              Ctrl+Enter phân tích nhanh
              {isAiLoading && (
                <span style={{ color: 'rgba(123,47,255,0.5)', marginLeft: 8 }}>
                  · AI đang tìm gợi ý phù hợp...
                </span>
              )}
              {isAiPowered && !isAiLoading && suggestions.length > 0 && (
                <span style={{ color: 'rgba(123,47,255,0.6)', marginLeft: 8 }}>
                  · ✨ {suggestions.length} gợi ý AI
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: input.length > 0 ? '#7b2fff' : 'rgba(255,255,255,0.2)' }}>
              {input.length} ký tự
            </div>
          </div>
        </div>

        {/* Language toggle */}
        <div>
          <label style={{
            display: 'block', fontSize: 12, fontWeight: 700,
            color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: 10,
          }}>
            Ngôn Ngữ Output
          </label>
          <div className="toggle-container" style={{ width: 'fit-content' }}>
            <button className={`toggle-option ${language === 'vi' ? 'active' : ''}`} onClick={() => setLanguage('vi')}>
              🇻🇳 Tiếng Việt
            </button>
            <button className={`toggle-option ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>
              🇺🇸 English
            </button>
          </div>
        </div>

        {/* Bottom section: Trending (khi trống) hoặc Quick chips (khi đang gõ) */}
        <AnimatePresence mode="wait">
          {!input.trim() ? (
            <motion.div
              key="trending"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                🔥 Chủ đề đang hot — click để bắt đầu nhanh
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {TRENDING_TOPICS.map((t, i) => (
                  <motion.button
                    key={t.label}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => { setInput(t.query); textareaRef.current?.focus(); handleInput(t.query); }}
                    style={{
                      padding: '10px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.55)',
                      transition: 'all 0.2s', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget;
                      el.style.borderColor = 'rgba(123,47,255,0.4)';
                      el.style.background = 'rgba(123,47,255,0.08)';
                      el.style.color = '#c4a0ff';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget;
                      el.style.borderColor = 'rgba(255,255,255,0.08)';
                      el.style.background = 'rgba(255,255,255,0.03)';
                      el.style.color = 'rgba(255,255,255,0.55)';
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{t.icon}</span>
                    <span style={{ lineHeight: 1.3 }}>{t.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : suggestions.length > 0 ? (
            <motion.div
              key="chips"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                ⚡ Chọn nhanh — click để điền vào ô
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {suggestions.slice(0, 5).map((s) => (
                  <motion.button
                    key={s}
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => applySelection(s)}
                    style={{
                      padding: '6px 13px', borderRadius: 50, fontSize: 12, fontWeight: 500,
                      cursor: 'pointer',
                      border: `1px solid ${isAiPowered ? 'rgba(123,47,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      background: isAiPowered ? 'rgba(123,47,255,0.07)' : 'rgba(255,255,255,0.04)',
                      color: isAiPowered ? 'rgba(200,180,255,0.8)' : 'rgba(255,255,255,0.5)',
                      transition: 'all 0.2s',
                      maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget;
                      el.style.borderColor = '#7b2fff';
                      el.style.background = 'rgba(123,47,255,0.18)';
                      el.style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget;
                      el.style.borderColor = isAiPowered ? 'rgba(123,47,255,0.3)' : 'rgba(255,255,255,0.1)';
                      el.style.background = isAiPowered ? 'rgba(123,47,255,0.07)' : 'rgba(255,255,255,0.04)';
                      el.style.color = isAiPowered ? 'rgba(200,180,255,0.8)' : 'rgba(255,255,255,0.5)';
                    }}
                  >
                    {isAiPowered ? '✨' : '💡'} {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Analyze button */}
        <motion.button
          whileHover={{ scale: canAnalyze ? 1.02 : 1 }}
          whileTap={{ scale: canAnalyze ? 0.97 : 1 }}
          onClick={() => canAnalyze && onAnalyze(input.trim(), language)}
          disabled={!canAnalyze}
          style={{
            width: '100%', padding: '18px', fontSize: 16, fontWeight: 800,
            borderRadius: 14, border: 'none', cursor: canAnalyze ? 'pointer' : 'not-allowed',
            background: canAnalyze
              ? 'linear-gradient(135deg, #7b2fff, #00f5ff)'
              : 'rgba(255,255,255,0.06)',
            color: canAnalyze ? '#fff' : 'rgba(255,255,255,0.25)',
            boxShadow: canAnalyze ? '0 4px 24px rgba(123,47,255,0.4)' : 'none',
            transition: 'all 0.3s', letterSpacing: '0.02em',
          }}
        >
          🔍 Phân Tích & Đề Xuất Hướng Đi →
        </motion.button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}
