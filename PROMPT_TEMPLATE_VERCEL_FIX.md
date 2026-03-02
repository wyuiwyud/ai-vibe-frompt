# 🎯 PROMPT TEMPLATE - Lỗi Vercel Deployment (VIBE Frompt)

## Sử dụng khi cần fix lỗi Vercel deployment lần sau

---

### **PROMPT NGẮN (Nhanh):**

```
Bạn là Copilot expert Next.js. Tôi gặp lỗi Vercel deployment cho project vibe-frompt.

Hãy fix theo các bước:
1. Fix React setState-in-effect: Thay useState(func) → useState(() => func())
2. Remove `any` type: Thay bằng `unknown` hoặc specific type
3. Xóa unused eslint-disable comments
4. vercel.json: Chỉ giữ { "framework": "nextjs" }
5. Test: npm run build
6. Commit & push GitHub

Lỗi từ Vercel: [PASTE ERROR MESSAGE TỪ VERCEL ĐÂY]
```

---

### **PROMPT CHI TIẾT (Toàn Diện):**

```
Tôi có dự án Next.js (ai-vibe-frompt) bị lỗi deployment trên Vercel. 
Đây là các vấn đề cần fix:

**1. React Hooks Error - setState in effect:**
- Symptom: "Calling setState synchronously within an effect can trigger cascading renders"
- Files: src/components/HeroSection.tsx, src/features/landing-builder/components/VisualPlaceholder.tsx
- Fix method:
  * Trước: const [x] = useState(generateParticles);
  * Sau: const [x] = useState(() => generateParticles());

**2. TypeScript Errors - no-explicit-any:**
- Symptom: "Unexpected any. Specify a different type."
- Files: ReverseSourceModal.tsx, StrategyStep.tsx, analytics.ts, landingBuilderStore.ts
- Fix: 
  * Là thay `any` → `unknown`
  * Hoặc dùng specific type ví dụ `Record<string, string>`

**3. ESLint Warnings - unused eslint-disable:**
- Symptom: "Unused eslint-disable directive"
- Fix: Xóa hết `// eslint-disable-next-line no-console`

**4. vercel.json Schema Error:**
- Symptom: "env should be object" hoặc "framework must be one of..."
- Current: { "framework": "nextjs", "buildCommand": ..., "env": [...] }
- Fix: { "framework": "nextjs" }

**5. Local build test:**
- Chạy: npm run build
- Đảm bảo: ✅ Compiled successfully

**6. Deploy:**
- git add -A
- git commit -m "fix: resolve Vercel deployment errors"
- git push origin main

Hãy sửa từng lỗi, test build, sau đó commit & push. 
Vercel sẽ auto-redeploy khi nhận push.

Error logs: [PASTE LOGS ĐÂY NẾU CÓ]
```

---

### **QUICK FIX CHECKLIST:**

```
☐ Kiểm tra useState - có callback chứ?
  ✅ useState(() => generateParticles())
  ❌ useState(generateParticles)

☐ Kiểm tra `any` type
  ✅ Record<string, unknown>
  ❌ Record<string, any>

☐ Kiểm tra eslint-disable comments
  ✅ Xóa hết unused ones
  ❌ Giữ lại comments thừa

☐ Kiểm tra vercel.json
  ✅ { "framework": "nextjs" }
  ❌ Có buildCommand, installCommand, env array

☐ Test build
  ✅ npm run build → "Compiled successfully"
  ❌ Lỗi compile

☐ Commit & push
  ✅ git push origin main
  ❌ Chưa push lên GitHub
```

---

### **USEFUL COMMANDS:**

```bash
# Check build
npm run build

# Check git status
git status

# Commit all changes
git add -A
git commit -m "fix: resolve Vercel deployment errors"

# Push to GitHub (trigger Vercel redeploy)
git push origin main

# Check git log
git log --oneline -5
```

---

## 📚 Tham Khảo Chi Tiết

Xem file: `VERCEL_DEPLOYMENT_FIX_GUIDE.md` trong project root

---

**Created:** 2 tháng 3, 2026  
**For:** ai-vibe-frompt project  
**Status:** ✅ All issues resolved & deployed
```