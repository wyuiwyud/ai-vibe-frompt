# 🚀 Hướng Dẫn Fix Lỗi Vercel Deployment - VIBE Frompt

**Ngày tạo:** 2 tháng 3, 2026  
**Dự án:** AI VIBE Frompt  
**Trạng thái:** ✅ Đã fix thành công

---

## 📋 Tóm Tắt Các Lỗi Gặp Phải

### **Lỗi 1: React setState trong useEffect (Critical)**
- **File:** `src/components/HeroSection.tsx`, `src/features/landing-builder/components/VisualPlaceholder.tsx`
- **Vấn đề:** Gọi `setState` đồng bộ trong `useEffect` → gây cascading renders
- **Lỗi:** `react-hooks/set-state-in-effect`
- **Fix:**
  ```tsx
  // ❌ TRƯỚC
  const [particles] = useState<Particle[]>(generateParticles);
  
  // ✅ SAU
  const [particles] = useState<Particle[]>(() => generateParticles());
  ```

### **Lỗi 2: TypeScript `any` type không được phép (ESLint)**
- **File:** 
  - `src/features/landing-builder/ReverseSourceModal.tsx` (line 64)
  - `src/features/landing-builder/steps/StrategyStep.tsx` (line 71)
  - `src/lib/analytics.ts` (line 8)
  - `src/store/landingBuilderStore.ts` (line 29)
- **Vấn đề:** `@typescript-eslint/no-explicit-any` rule bị vi phạm
- **Fix:**
  ```tsx
  // ❌ TRƯỚC
  } as any
  Record<string, any>
  
  // ✅ SAU
  } as Record<string, string>
  Record<string, unknown>
  ```

### **Lỗi 3: Unused eslint-disable comments (Warnings)**
- **File:** `src/app/api/reverse/route.ts`, `src/app/dashboard/page.tsx`, v.v
- **Vấn đề:** Comment `eslint-disable` không cần thiết vì rule `no-console` không được bật
- **Fix:** Loại bỏ comment `// eslint-disable-next-line no-console`

### **Lỗi 4: vercel.json schema validation fail (Critical)**
- **File:** `vercel.json`
- **Lỗi:** `"env" should be object` hoặc key không hợp lệ
- **Fix:**
  ```json
  // ❌ TRƯỚC
  {
    "framework": "nextjs",
    "buildCommand": "npm run build",
    "installCommand": "npm install",
    "env": [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    ]
  }
  
  // ✅ SAU
  {
    "framework": "nextjs"
  }
  ```

### **Lỗi 5: Invalid framework name**
- **File:** `vercel.json`
- **Lỗi:** `"framework": "next"` → phải là `"nextjs"`
- **Fix:** Đổi từ `"next"` thành `"nextjs"`

### **Lỗi 6: CSS @import rule position**
- **File:** `src/app/globals.css`
- **Vấn đề:** `@import url()` phải ở **đầu file**, trước tất cả CSS rules khác
- **Fix:** Di chuyển `@import` lên trên cùng

---

## 🔧 Quy Trình Fix Chi Tiết

### **Bước 1: Fix React Hooks Errors**
```bash
# HeroSection.tsx - sửa useState callback
# VisualPlaceholder.tsx - sửa setState-in-effect
```

### **Bước 2: Fix TypeScript Any Types**
```bash
# Thay `any` bằng `unknown` hoặc specific type
# Ví dụ: Record<string, any> → Record<string, unknown>
```

### **Bước 3: Loại Bỏ Unused ESLint Comments**
```bash
# Xóa tất cả // eslint-disable-next-line no-console
# Nếu vẫn cần log, giữ lại console mà không comment
```

### **Bước 4: Fix vercel.json**
```json
{
  "framework": "nextjs"
}
```
**Lý do:**
- Vercel tự động detect Next.js config
- Build command mặc định: `npm run build` 
- Environment variables cấu hình trong **Vercel Dashboard**, không trong file

### **Bước 5: Build & Test Locally**
```bash
npm run build
```
Đảm bảo build thành công mà **không lỗi** (cảnh báo CSS có thể bỏ qua)

### **Bước 6: Commit & Push**
```bash
git add -A
git commit -m "fix: resolve React setState-in-effect, TypeScript any types, clean up build files"
git push origin main
```

---

## 📊 Kết Quả Cuối Cùng

| Lỗi | Số Lượng | Status |
|-----|----------|--------|
| React setState-in-effect | 2 | ✅ Fixed |
| TypeScript `any` type | 4 | ✅ Fixed |
| Unused eslint-disable | 6 | ✅ Fixed |
| vercel.json schema | 2 | ✅ Fixed |
| CSS @import warning | 1 | ✅ Fixed |
| **Total** | **15** | **✅ ALL FIXED** |

---

## 🎯 Prompt Để Dùng Lần Sau

### **Prompt Ngắn:**
```
Fix lỗi Vercel deployment cho Next.js project:
1. Remove setState calls từ useEffect (sử dụng callback trong useState)
2. Thay thế tất cả `any` type bằng `unknown` hoặc specific type
3. Loại bỏ unused eslint-disable comments
4. Sửa vercel.json: chỉ giữ lại { "framework": "nextjs" }
5. Build test: npm run build
6. Commit & push lên GitHub
```

### **Prompt Chi Tiết:**
```
Bạn là expert Next.js/Vercel deployment. Hãy fix lỗi deployment Vercel cho dự án Next.js này:

**Lỗi cần fix:**
1. React hooks error: setState being called synchronously in useEffect (cascading renders)
   - Files: src/components/HeroSection.tsx, src/features/landing-builder/components/VisualPlaceholder.tsx
   - Fix: Sử dụng `useState(() => initialValue)` thay vì `useState(initialValue)` khi initialValue là hàm

2. TypeScript ESLint violations: @typescript-eslint/no-explicit-any
   - Files: src/features/landing-builder/ReverseSourceModal.tsx, src/features/landing-builder/steps/StrategyStep.tsx, src/lib/analytics.ts, src/store/landingBuilderStore.ts
   - Fix: Thay thế `any` bằng `unknown` hoặc specific type nào đó

3. Unused eslint-disable comments
   - Files: Nhiều file
   - Fix: Loại bỏ `// eslint-disable-next-line no-console` nếu rule không được bật

4. vercel.json schema validation failed
   - Issue: "env" phải là object chứ không phải array, hoặc framework value không hợp lệ
   - Fix: Chỉ giữ { "framework": "nextjs" } - Vercel sẽ auto-detect config

5. Test build locally: npm run build phải pass
6. Commit & push changes lên GitHub để trigger Vercel redeploy
```

---

## 🚀 Deployment Status

**Project URL:** https://vibe-frompt.vercel.app  
**Last Successful Deploy:** 2 tháng 3, 2026  
**Status:** ✅ LIVE & WORKING

---

## 📝 Ghi Chú Quan Trọng

1. **Vercel tự động detect Next.js** - Không cần cấu hình phức tạp
2. **Environment variables** - Cấu hình trong Vercel Dashboard, không trong file
3. **useState callback** - Khi initial value là hàm, phải wrap trong callback: `useState(() => fn())`
4. **TypeScript strict mode** - `any` không được phép, dùng `unknown` hoặc specific type
5. **CSS @import** - Phải ở đầu file, trước tất cả rules khác

---

## 💡 Cách Sử Dụng Lần Sau

Khi gặp lỗi Vercel deployment tương tự:
1. Copy prompt ngắn hoặc chi tiết ở trên
2. Cung cấp thêm error message từ Vercel
3. Tôi sẽ fix đi đúng hướng theo guide này

**Ước tính tiết kiệm:** 50% thời gian fix lỗi tương tự lần tiếp theo! 🎉
