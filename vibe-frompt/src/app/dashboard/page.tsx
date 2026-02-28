'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

interface ProjectRow {
  id: string;
  title: string | null;
  brand_name: string | null;
  main_color: string | null;
  product_type: string | null;
  created_at: string | null;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const load = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('projects')
          .select(
            'id, title, brand_name, main_color, product_type, created_at'
          )
          .order('created_at', { ascending: false });
        if (error) throw error;
        setProjects(data || []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="min-h-screen bg-animated px-4 pt-24 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-2xl font-bold">Dashboard</h1>
        <p className="mb-6 text-sm text-white/60">
          Lần tới khi bạn vào lại, dùng Supabase Auth để mở các landing page đã
          lưu.
        </p>

        {loading ? (
          <p className="text-sm text-white/60">Đang tải project của bạn…</p>
        ) : !supabase ? (
          <p className="text-sm text-red-400">
            Supabase chưa được cấu hình. Thêm NEXT_PUBLIC_SUPABASE_URL và
            NEXT_PUBLIC_SUPABASE_ANON_KEY để dùng dashboard.
          </p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-white/60">
            Chưa có dự án nào. Hãy sinh prompt và bấm &quot;Lưu dự án&quot; ở
            bước Execution.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-black/60 p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-full border border-white/10"
                      style={{ background: p.main_color || '#00f5ff' }}
                    />
                    <h2 className="text-sm font-semibold">
                      {p.title || p.brand_name || 'Dự án không tên'}
                    </h2>
                  </div>
                  <span className="text-[10px] text-white/40">
                    {p.created_at && isMounted
                      ? new Date(p.created_at).toLocaleDateString('vi-VN')
                      : ''}
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  Sản phẩm:{' '}
                  <span className="text-white">
                    {p.product_type || 'Landing page'}
                  </span>
                </p>
                <p className="mt-2 text-[11px] text-white/45">
                  Chức năng mở lại project sẽ được nối với wizard trong các bước
                  tiếp theo của roadmap.
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

