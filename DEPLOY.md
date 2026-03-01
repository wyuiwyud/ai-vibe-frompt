# Deploy VIBE Frompt lên Vercel

Ứng dụng Next.js nằm trong thư mục **`vibe-frompt`**. Để deploy thành công trên Vercel:

## Bước 1: Cấu hình Root Directory

1. Vào [Vercel Dashboard](https://vercel.com) → chọn project **vibe-frompt**
2. Vào **Settings** → **General**
3. Mục **Root Directory** chọn **Edit**, nhập: `vibe-frompt`
4. Lưu (Save)

## Bước 2: Deploy lại từ commit mới

- Lỗi *"This deployment can not be redeployed"* nghĩa là Vercel không cho redeploy cùng commit đã lỗi.
- Cần **đẩy một commit mới** lên branch `main` (ví dụ: sửa README, thêm comment, hoặc chạy `git commit --allow-empty -m "chore: trigger Vercel build"`) rồi push. Vercel sẽ tự build deployment mới.

## Bước 3 (tùy chọn): Biến môi trường

Nếu dùng Supabase, trong **Settings** → **Environment Variables** thêm:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Sau khi đặt Root Directory = `vibe-frompt` và deploy từ commit mới, build sẽ chạy đúng trong thư mục app và deploy thành công.
