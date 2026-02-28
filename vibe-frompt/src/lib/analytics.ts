export type AnalyticsEvent =
  | 'lpb_step1_completed'
  | 'lpb_layout_chosen'
  | 'lpb_prompt_generated'
  | 'lpb_prompt_copied'
  | 'lpb_ai_strategy_generated'
  | 'project_saved';

export function track(event: AnalyticsEvent, payload?: Record<string, any>) {
  try {
    if (typeof window === 'undefined') return;
    // Vercel Analytics hoặc các tool khác có thể hook vào đây.
    // eslint-disable-next-line no-console
    console.log('[analytics]', event, payload || {});
  } catch {
    // ignore
  }
}

