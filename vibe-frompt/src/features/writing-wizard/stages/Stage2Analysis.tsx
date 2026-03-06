'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types matching the new rich API response ─────────────────
interface DirectionItem {
  id: string;
  label: string;
  name: string;
  full_topic?: string;
  why_this_direction?: string;
  content_type?: string;
  relevance_score?: number;
  audience_fit?: string;
  description: string;
  match: number;
  type: string;
}

interface DetectedSignals {
  format: string | null;
  level: string | null;
  domain: string;
  audience: string;
}

interface Stage2AnalysisProps {
  rawInput: string;
  directions: DirectionItem[];
  detectedSignals?: DetectedSignals;
  webTrendsSummary?: string;
  onChoose: (direction: DirectionItem) => void;
  onBack: () => void;
}

// ─── Animated relevance bar ───────────────────────────────────
function RelevanceBar({ value, color }: { value: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(value), 250); return () => clearTimeout(t); }, [value]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3, width: `${width}%`,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          transition: 'width 0.85s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 8px ${color}55`,
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 800, color, minWidth: 32 }}>{value}%</span>
      {/* Block indicator */}
      <div style={{ display: 'flex', gap: 1.5 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{
            width: 5, height: 8, borderRadius: 2,
            background: i < Math.round(value / 10) ? color : 'rgba(255,255,255,0.08)',
            transition: `background ${0.3 + i * 0.04}s ease 0.2s`,
            boxShadow: i < Math.round(value / 10) ? `0 0 4px ${color}` : 'none',
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Detected signals as tags ─────────────────────────────────
function SignalTag({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 50,
      background: `${color}10`, border: `1px solid ${color}30`,
      fontSize: 11, fontWeight: 600,
    }}>
      <span style={{ color: `${color}99` }}>{label}:</span>
      <span style={{ color }}>{value}</span>
    </div>
  );
}

const DIRECTION_COLORS = ['#00f5ff', '#7b2fff', '#ff00cc'];
const DIRECTION_ICONS = ['🅐', '🅑', '🅒'];
const CONTENT_TYPE_COLORS: Record<string, string> = {
  'Blog': '#00f5ff', 'Essay': '#00f5ff',
  'Video': '#ff6633', 'Script': '#ff6633',
  'Exercise Sheet': '#7b2fff', 'Report': '#7b2fff',
  'Thread': '#ffd700', 'Social Post': '#ffd700',
  'Email': '#ff00cc',
};

export default function Stage2Analysis({
  rawInput, directions, detectedSignals, webTrendsSummary, onChoose, onBack,
}: Stage2AnalysisProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const hasSignals = detectedSignals && (
    detectedSignals.format || detectedSignals.level ||
    detectedSignals.domain !== 'Chung' || detectedSignals.audience
  );

  return (
    <div style={{ display: 'grid', gap: 18 }}>

      {/* ─── Source preservation banner ─── */}
      <div style={{
        background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.15)',
        borderRadius: 16, padding: '16px 20px',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#00f5ff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          🔍 GIAI ĐOẠN 2 — PHÂN TÍCH & ĐỀ XUẤT HƯỚNG ĐI
        </div>

        {/* Original idea preserved */}
        <div style={{
          background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.12)',
          borderRadius: 9, padding: '8px 12px', marginBottom: 10,
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', flexShrink: 0, marginTop: 1 }}>📌 Ý tưởng gốc:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.5 }}>"{rawInput}"</span>
        </div>

        {/* Detected signals */}
        {hasSignals && detectedSignals && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>
              🧩 Tín hiệu AI phát hiện:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {detectedSignals.format && <SignalTag label="Định dạng" value={detectedSignals.format} color="#7b2fff" />}
              {detectedSignals.level && <SignalTag label="Cấp độ" value={detectedSignals.level} color="#ffd700" />}
              {detectedSignals.domain && detectedSignals.domain !== 'Chung' && <SignalTag label="Lĩnh vực" value={detectedSignals.domain} color="#00f5ff" />}
              {detectedSignals.audience && <SignalTag label="Đối tượng" value={detectedSignals.audience} color="#ff00cc" />}
              {(detectedSignals as any).hidden_standards?.map((std: string, i: number) => (
                <SignalTag key={i} label="Tiêu chuẩn" value={std} color="#ffd700" />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ─── Web trends panel ─── */}
      {webTrendsSummary && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.15)',
            borderRadius: 12, padding: '12px 16px',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}
        >
          <span style={{ fontSize: 16, flexShrink: 0 }}>📊</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Xu hướng thực tế liên quan
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
              {webTrendsSummary}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Direction note ─── */}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
        🧩 AI đề xuất <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{directions.length} hướng triển khai</strong> — <em>ý tưởng gốc được giữ nguyên 100%</em>, chỉ thêm góc độ tiếp cận:
      </div>

      {/* ─── Direction Cards ─── */}
      <div style={{ display: 'grid', gap: 12 }}>
        {directions.map((dir, i) => {
          const color = DIRECTION_COLORS[i] ?? '#00f5ff';
          const isSelected = selected === dir.label;
          const isExpanded = expanded === dir.label;
          const ctColor = CONTENT_TYPE_COLORS[dir.content_type ?? dir.type] ?? color;

          return (
            <motion.div
              key={dir.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.1 }}
              style={{
                background: isSelected ? `${color}0d` : 'rgba(0,0,0,0.4)',
                border: `1px solid ${isSelected ? color : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 18, overflow: 'hidden',
                boxShadow: isSelected ? `0 0 28px ${color}22, 0 4px 20px rgba(0,0,0,0.4)` : '0 4px 16px rgba(0,0,0,0.3)',
                transition: 'all 0.25s',
                cursor: 'pointer',
              }}
              onClick={() => setSelected(dir.label)}
            >
              <div style={{ padding: '20px 22px' }}>
                {/* Card header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  {/* Letter badge */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                    background: `${color}18`, border: `1.5px solid ${color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, color,
                  }}>
                    {dir.label}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Direction name + content type badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: isSelected ? color : '#fff' }}>
                        {DIRECTION_ICONS[i]} {dir.name}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 50,
                        background: `${ctColor}18`, color: ctColor, border: `1px solid ${ctColor}33`,
                        flexShrink: 0,
                      }}>
                        {dir.content_type ?? dir.type}
                      </span>
                    </div>

                    {/* full_topic — the full preserved original + angle */}
                    <div style={{
                      fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
                      fontStyle: 'italic', marginBottom: 10,
                    }}>
                      → {dir.full_topic ?? dir.description}
                    </div>

                    {/* Relevance score bar */}
                    <div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>
                        📊 Độ phù hợp
                      </div>
                      <RelevanceBar value={dir.match ?? dir.relevance_score ?? 80} color={color} />
                    </div>
                  </div>
                </div>

                {/* Expand toggle */}
                <button
                  onClick={e => { e.stopPropagation(); setExpanded(isExpanded ? null : dir.label); }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    fontSize: 11, color: 'rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', gap: 5,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = color; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)'; }}
                >
                  {isExpanded ? '▲ Ẩn bớt' : '▼ Xem lý do AI đề xuất'}
                </button>

                {/* Expandable: why + audience */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        marginTop: 12, padding: '12px 14px', borderRadius: 10,
                        background: `${color}08`, border: `1px solid ${color}18`,
                        display: 'grid', gap: 8,
                      }}>
                        {dir.why_this_direction && (
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: `${color}aa`, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                              💡 Lý do AI đề xuất
                            </div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                              {dir.why_this_direction}
                            </div>
                          </div>
                        )}
                        {dir.audience_fit && (
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: `${color}aa`, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                              👥 Phù hợp nhất với
                            </div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                              {dir.audience_fit}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: 12, display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 12, fontWeight: 700, color,
                      borderTop: `1px solid ${color}22`, paddingTop: 12,
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
                    Đã chọn hướng này ✓
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Actions ─── */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onBack}
          style={{
            padding: '14px 22px', borderRadius: 12, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)',
            transition: 'all 0.2s',
          }}
        >
          ← Quay lại
        </button>
        <motion.button
          whileHover={{ scale: selected ? 1.02 : 1 }}
          whileTap={{ scale: selected ? 0.97 : 1 }}
          onClick={() => {
            const dir = directions.find(d => d.label === selected);
            if (dir) onChoose(dir);
          }}
          disabled={!selected}
          style={{
            flex: 1, padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 800,
            cursor: selected ? 'pointer' : 'not-allowed', border: 'none',
            background: selected ? 'linear-gradient(135deg, #7b2fff, #00f5ff)' : 'rgba(255,255,255,0.06)',
            color: selected ? '#fff' : 'rgba(255,255,255,0.25)',
            boxShadow: selected ? '0 4px 24px rgba(123,47,255,0.4)' : 'none',
            transition: 'all 0.3s',
          }}
        >
          Tiếp theo — Làm rõ chi tiết →
        </motion.button>
      </div>
    </div>
  );
}
