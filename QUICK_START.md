# ⚡ ProjectLog 수익화 빠른 시작 가이드

모든 코드 구현이 완료되었습니다! 이제 5분 안에 설정을 완료하고 테스트해보세요.

---

## 🎯 현재 상태

### ✅ 구현 완료된 기능:
- ✅ Free/Pro 티어 시스템
- ✅ 프로젝트 생성 제한 (Free: 3개, Pro: 무제한)
- ✅ 업데이트 생성 제한 (Free: 5개/일, Pro: 무제한)
- ✅ Stripe 결제 연동
- ✅ Webhook 처리
- ✅ Pricing 페이지
- ✅ Pro 배지 표시
- ✅ 구독 관리 페이지
- ✅ Dashboard Upgrade CTA
- ✅ AI 인사이트 준비 중 페이지

### ⏳ 설정 필요:
1. Supabase SQL 실행
2. Stripe 계정 및 제품 생성
3. 환경 변수 설정

---

## 🚀 5분 설정

### 1️⃣ Supabase SQL 실행 (1분)

```bash
# 1. Supabase Dashboard 접속
open https://supabase.com/dashboard

# 2. SQL Editor에서 다음 파일 내용 전체 복사 & 실행
# supabase-subscription-migration.sql
```

**또는**:
1. Supabase Dashboard → SQL Editor
2. `supabase-subscription-migration.sql` 파일 열기
3. 전체 복사 → 붙여넣기 → Run

---

### 2️⃣ Stripe 계정 설정 (2분)

```bash
# Stripe Dashboard 열기
open https://dashboard.stripe.com

# 1. 계정 생성 (없으면)
# 2. Developers → API keys에서:
#    - Publishable key (pk_test_...)
#    - Secret key (sk_test_...)
#    복사

# 3. Products에서:
#    - "ProjectLog Pro - Monthly" 생성
#    - $9/month, Recurring
#    - Price ID (price_...) 복사
```

---

### 3️⃣ 환경 변수 설정 (1분)

`.env.local` 파일 업데이트:

```bash
# Supabase (기존 값 유지)
NEXT_PUBLIC_SUPABASE_URL=https://demjkxevtdnnxvwrbrst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...기존값...

# ⬇️ 추가 필요 ⬇️
# Supabase Settings → API에서 복사
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (위에서 복사한 값)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID_MONTHLY=price_...

# 로컬 테스트용 (나중에 설정)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_YEARLY=price_...  # 선택사항

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 4️⃣ 로컬 테스트 (1분)

#### 터미널 1: 개발 서버
```bash
npm run dev
```

#### 터미널 2: Stripe Webhook (선택사항 - 구독 테스트 시 필요)
```bash
# Stripe CLI 설치 (한 번만)
brew install stripe/stripe-cli/stripe

# 로그인
stripe login

# Webhook 포워딩
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 출력된 webhook secret (whsec_...)을 .env.local에 추가
```

---

## 🧪 테스트 시나리오

### 시나리오 1: Free 사용자 제한 테스트

```bash
# 1. 로그인
open http://localhost:3000/login

# 2. 프로젝트 3개 생성
# → 4번째 프로젝트 생성 시도 시 업그레이드 화면 표시

# 3. 업데이트 5개 작성
# → 6번째 업데이트 작성 시도 시 제한 메시지 표시
```

### 시나리오 2: Pro 구독 테스트

```bash
# 1. Pricing 페이지 접속
open http://localhost:3000/pricing

# 2. "Upgrade to Pro" 클릭
# → Stripe Checkout 페이지 이동

# 3. 테스트 카드 입력:
#    카드번호: 4242 4242 4242 4242
#    만료일: 12/34
#    CVC: 123

# 4. Subscribe 클릭
# → Dashboard로 리다이렉트

# 5. 확인 사항:
#    - Profile에 "⭐ PRO" 배지
#    - Feed에 "PRO" 배지
#    - 프로젝트/업데이트 무제한 생성 가능
```

### 시나리오 3: Webhook 확인 (구독 후)

```bash
# Stripe Webhook 터미널에서 확인:
# ✓ [200] POST /api/stripe/webhook [checkout.session.completed]

# Supabase profiles 테이블 확인:
# subscription_tier = 'pro'
# subscription_status = 'active'
```

---

## 📋 빠른 체크리스트

- [ ] Supabase SQL 마이그레이션 실행
- [ ] Supabase Service Role Key 복사
- [ ] Stripe 계정 생성
- [ ] Stripe API 키 복사
- [ ] Stripe 제품 생성 (ProjectLog Pro)
- [ ] Price ID 복사
- [ ] `.env.local` 업데이트
- [ ] 개발 서버 시작 (`npm run dev`)
- [ ] Free 사용자 제한 테스트
- [ ] Pro 구독 테스트

---

## 🎯 다음 단계

설정이 완료되면:

1. **테스트 완료 후** → 프로덕션 배포
2. **Vercel/Railway 환경 변수** 설정
3. **Stripe Live Mode** 전환
4. **실제 제품 런칭** 🚀

---

## 📚 상세 가이드

더 자세한 설정이 필요하면:
- **SETUP_CHECKLIST.md** - 단계별 상세 가이드
- **STRIPE_SETUP_GUIDE.md** - Stripe 설정 전문
- **MONETIZATION_PLAN.md** - 수익화 전략

---

## 🐛 문제 발생 시

```bash
# 1. Webhook 에러
stripe listen --forward-to localhost:3000/api/stripe/webhook
# 새로운 secret을 .env.local에 업데이트

# 2. 환경 변수 확인
cat .env.local

# 3. 개발 서버 재시작
# Ctrl+C 후 npm run dev

# 4. 캐시 클리어
rm -rf .next
npm run dev
```

---

## 💡 자동 설정 스크립트

```bash
# 로컬 Stripe 설정 자동화
./setup-stripe-local.sh
```

---

**🎉 준비 완료! 첫 수익을 향해 달려봅시다!** 💰
