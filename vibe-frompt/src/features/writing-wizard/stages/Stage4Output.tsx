'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { copyToClipboard } from '@/lib/utils';

interface Stage4OutputProps {
  prompt: string;
  scores: { clarity: number; structure: number; creativity: number };
  onRegenerate: () => void;
  onContinue: () => void;
  onEdit: () => void;
  onReset: () => void;
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 300); return () => clearTimeout(t); }, [value]);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value}%</span>
      </div>
      <div className="score-bar">
        <div className="score-fill" style={{
          width: `${w}%`,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className="toast">{message}</div>;
}

export default function Stage4Output({ prompt, scores, onRegenerate, onContinue, onEdit, onReset }: Stage4OutputProps) {
  const [toast, setToast] = useState('');
  const avg = Math.round((scores.clarity + scores.structure + scores.creativity) / 3);

  // Chatbot State
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [userMsg, setUserMsg] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(prompt);
    setToast('✨ Đã copy VIBE Prompt vào clipboard!');
  };

  const handleSendMessage = async () => {
    if (!userMsg.trim() || isChatLoading) return;
    const newHistory = [...chatHistory, { role: 'user' as const, content: userMsg }];
    setChatHistory(newHistory);
    setUserMsg('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/write-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stage4_chat',
          vibePrompt: prompt,
          chatHistory: newHistory,
          userMessage: userMsg,
        }),
      });
      const data = await res.json();
      setChatHistory([...newHistory, { role: 'assistant', content: data.assistant_response }]);
    } catch (e) {
      console.error('[Stage4] chat error', e);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,245,255,0.06), rgba(123,47,255,0.04))',
        border: '1px solid rgba(0,245,255,0.15)', borderRadius: 16, padding: '18px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#00f5ff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            ✅ GIAI ĐOẠN 4 — VIBE PROMPT ĐÃ SẴN SÀNG
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            Framework RTCE+I · Self-critique loop · Writing Intelligence v2.0
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>Điểm chất lượng</div>
          <div className="badge badge-gold" style={{ fontSize: 20, fontWeight: 900 }}>{avg}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) min(260px, 40%)', gap: 20, alignItems: 'start' }}>
        {/* Left: Prompt content */}
        <div>
          <div className="code-block" style={{ maxHeight: 420, overflowY: 'auto', fontSize: 13.5, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
            {prompt}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
            <span>{prompt.length} ký tự</span>
            <span>Copy và dán vào ChatGPT / Claude / Gemini</span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleCopy}
              className="btn-magnetic"
              style={{ flex: 1, padding: '13px', fontSize: 14, minWidth: 120 }}
            >
              📋 Copy Prompt
            </motion.button>
            <button
              onClick={onRegenerate}
              className="btn-ghost"
              style={{ padding: '13px 18px', fontSize: 14 }}
            >
              🔄 Tạo lại
            </button>
            <button
              onClick={onEdit}
              className="btn-ghost"
              style={{ padding: '13px 18px', fontSize: 14 }}
            >
              ✏️ Chỉnh sửa
            </button>
          </div>

          {/* --- CHATBOT ASSISTANT INTEGRATION --- */}
          <div style={{ marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #ff00cc, #00f5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Trợ lý AI Đồng hành</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Tương tác trực tiếp với VIBE Prompt</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (!isChatOpen && chatHistory.length === 0 && !userMsg) {
                    setUserMsg('Dựa vào prompt trên, hãy viết cho tôi một bản nháp hoàn chỉnh ngay bây giờ.');
                  }
                  setIsChatOpen(!isChatOpen);
                }}
                style={{ 
                  padding: '6px 14px', borderRadius: 50, background: isChatOpen ? 'rgba(255,255,255,0.05)' : 'rgba(0,245,255,0.1)', 
                  border: '1px solid rgba(0,245,255,0.3)', color: '#00f5ff', fontSize: 10, fontWeight: 800, cursor: 'pointer' 
                }}
              >
                {isChatOpen ? 'THU GỌN' : 'MỞ CHAT'}
              </button>
            </div>

            <AnimatePresence>
              {isChatOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ 
                    maxHeight: 400, overflowY: 'auto', padding: '16px', 
                    background: 'rgba(0,0,0,0.25)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 12
                  }}>
                    {chatHistory.length === 0 && (
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                        Khởi động AI hoàn tất. Bạn có thể yêu cầu: "Viết cho tôi 3 câu mở đầu dựa trên prompt trên" hoặc "Hãy đóng vai chuyên gia và trả lời..."
                      </div>
                    )}
                    {chatHistory.map((msg, i) => (
                      <div key={i} style={{ 
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: msg.role === 'user' ? '85%' : '100%', 
                        padding: msg.role === 'user' ? '12px 16px' : '0px', 
                        borderRadius: 14,
                        background: msg.role === 'user' ? '#7b2fff22' : 'transparent',
                        border: msg.role === 'user' ? '1px solid #7b2fff44' : 'none',
                        color: msg.role === 'user' ? '#fff' : 'rgba(255,255,255,0.9)',
                        fontSize: 13, lineHeight: 1.6
                      }}>
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-invert max-w-none" style={{ fontSize: 13, background: 'rgba(0,245,255,0.03)', padding: '16px', borderRadius: 12, border: '1px solid rgba(0,245,255,0.1)' }} dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n(.*)/g, '<br/>$1') }} />
                        ) : (
                          msg.content
                        )}
                      </div>
                    ))}
                    {isChatLoading && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingLeft: 4 }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #00f5ff33', borderTop: '2px solid #00f5ff', animation: 'spin 1s linear infinite' }} />
                        <div style={{ fontSize: 10, color: '#00f5ff', fontWeight: 600 }}>ĐANG SOẠN THẢO...</div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <input 
                      value={userMsg}
                      onChange={(e) => setUserMsg(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="vd: Viết 1 phần mở bài, Tạo 3 câu hỏi trắc nghiệm..."
                      style={{ 
                        flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12, padding: '14px 16px', fontSize: 13, color: '#fff', outline: 'none'
                      }}
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={isChatLoading || !userMsg.trim()}
                      style={{ 
                        padding: '0 24px', borderRadius: 12, background: 'linear-gradient(135deg, #ff00cc, #00f5ff)', 
                        border: 'none', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                        opacity: (isChatLoading || !userMsg.trim()) ? 0.5 : 1
                      }}
                    >
                      GỬI ĐI
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Scores + actions */}
        <div style={{ display: 'grid', gap: 14 }}>
          {/* Score meter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)',
              borderRadius: 16, padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>🏆</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#ffd700' }}>Điểm Prompt</span>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <ScoreBar label="Độ rõ ràng" value={scores.clarity} color="#00f5ff" />
              <ScoreBar label="Cấu trúc" value={scores.structure} color="#7b2fff" />
              <ScoreBar label="Sáng tạo" value={scores.creativity} color="#ff00cc" />
            </div>
          </motion.div>

          {/* Meta-review CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onContinue}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, fontSize: 13, fontWeight: 800,
              cursor: 'pointer', border: '1px solid rgba(123,47,255,0.4)',
              background: 'rgba(123,47,255,0.12)', color: '#7b2fff',
              boxShadow: '0 0 20px rgba(123,47,255,0.15)',
              transition: 'all 0.2s',
            }}
          >
            🔬 Xem Meta-Review →
          </motion.button>

          {/* Tip */}
          <div style={{
            padding: '12px', background: 'rgba(0,245,255,0.04)',
            border: '1px solid rgba(0,245,255,0.1)', borderRadius: 10,
            fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6,
          }}>
            💡 <strong style={{ color: '#00f5ff' }}>Tip:</strong> Dán prompt vào ChatGPT / Claude / Gemini để nhận kết quả viết lách ngay lập tức.
          </div>

          {/* Reset */}
          <button
            onClick={onReset}
            style={{
              padding: '10px', borderRadius: 10, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', border: '1px solid rgba(255,255,255,0.07)',
              background: 'transparent', color: 'rgba(255,255,255,0.3)',
              transition: 'all 0.2s',
            }}
          >
            ↩️ Bắt đầu lại
          </button>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}
