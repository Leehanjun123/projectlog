# 💰 ProjectLog 수익화 시스템

**Build in Public** 플랫폼을 위한 완전한 수익화 솔루션이 구현되었습니다!

---

## ✨ 구현된 기능

### 🎯 Free 티어
- ✅ 3개 프로젝트
- ✅ 하루 5개 업데이트
- ✅ 마크다운 지원
- ✅ 커뮤니티 피드
- ✅ 좋아요 & 댓글

### 💎 Pro 티어 ($9/월)
- ✅ **무제한** 프로젝트
- ✅ **무제한** 업데이트
- ✅ **Pro 배지** (프로필 & 피드)
- ✅ AI 인사이트 (준비 중)
- ✅ 우선 지원

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────┐
│           Next.js Frontend              │
│  ┌──────────┐  ┌───────────┐           │
│  │ Pricing  │  │ Dashboard │           │
│  │  Page    │→ │  + CTA    │           │
│  └────┬─────┘  └───────────┘           │
│       │                                  │
│       ↓                                  │
│  ┌──────────────────────────┐           │
│  │  Stripe Checkout         │           │
│  └────┬─────────────────────┘           │
└───────┼──────────────────────────────────┘
        │
        ↓
┌──────────────────────────────────────────┐
│         Stripe (결제 처리)               │
│                                          │
│  ┌────────────────────────────┐         │
│  │  Subscription Events        │         │
│  │  • checkout.session.        │         │
│  │    completed                │         │
│  │  • customer.subscription.   │         │
│  │    updated/deleted          │         │
│  │  • invoice.payment_failed   │         │
│  └────┬───────────────────────┘         │
└───────┼──────────────────────────────────┘
        │
        ↓ Webhook
┌──────────────────────────────────────────┐
│      /api/stripe/webhook                 │
│                                          │
│  • 구독 상태 업데이트                   │
│  • profiles 테이블 갱신                 │
│  • subscriptions 이력 저장              │
└────┬─────────────────────────────────────┘
     │
     ↓
┌──────────────────────────────────────────┐
│         Supabase Database                │
│                                          │
│  ┌──────────────────────────┐           │
│  │  profiles                 │           │
│  │  • subscription_tier      │           │
│  │  • subscription_status    │           │
│  │  • stripe_customer_id     │           │
│  └──────────────────────────┘           │
│                                          │
│  ┌──────────────────────────┐           │
│  │  subscriptions            │           │
│  │  (이력 & 상세 정보)      │           │
│  └──────────────────────────┘           │
│                                          │
│  ┌──────────────────────────┐           │
│  │  usage_tracking           │           │
│  │  (일일 사용량)            │           │
│  └──────────────────────────┘           │
│                                          │
│  ┌──────────────────────────┐           │
│  │  Functions                │           │
│  │  • is_pro_user()          │           │
│  │  • can_create_project()   │           │
│  │  • can_create_update()    │           │
│  └──────────────────────────┘           │
└──────────────────────────────────────────┘
```

---

## 📁 파일 구조

```
projectlog/
├── 📘 QUICK_START.md                    # ⭐ 5분 빠른 시작
├── 📘 SETUP_CHECKLIST.md                # 상세 설정 가이드
├── 📘 STRIPE_SETUP_GUIDE.md             # Stripe 전문 가이드
├── 📘 MONETIZATION_PLAN.md              # 수익화 전략
├── 📘 PREMIUM_FEATURES_COMPLETE.md      # 프리미엄 기능 목록
│
├── 🗄️ supabase-subscription-migration.sql  # DB 마이그레이션
├── 🔧 setup-stripe-local.sh             # 로컬 설정 스크립트
│
├── app/
│   ├── pricing/
│   │   └── page.tsx                     # 💰 Pricing 페이지
│   │
│   ├── dashboard/
│   │   └── page.tsx                     # 📊 Dashboard (+ Upgrade CTA)
│   │
│   ├── ai-insights/
│   │   └── page.tsx                     # 🤖 AI 준비 중 페이지
│   │
│   ├── settings/subscription/
│   │   └── page.tsx                     # ⚙️ 구독 관리
│   │
│   ├── projects/
│   │   ├── new/
│   │   │   └── page.tsx                 # ✅ 3개 제한 체크
│   │   └── [id]/new-update/
│   │       └── page.tsx                 # ✅ 5개/일 제한 체크
│   │
│   └── api/
│       ├── check-limits/
│       │   └── route.ts                 # 🚦 제한 체크 API
│       └── stripe/
│           ├── checkout/
│           │   └── route.ts             # 💳 Checkout 세션
│           └── webhook/
│               └── route.ts             # 🔔 Webhook 처리
│
├── components/
│   └── update-card.tsx                  # ⭐ Pro 배지 표시
│
└── lib/
    └── subscription.ts                  # 🛠️ 구독 유틸리티
```

---

## 🚀 설정 방법

### Option 1: 빠른 시작 (추천)

```bash
# 1. 가이드 열기
cat QUICK_START.md

# 2. 자동 스크립트 실행
./setup-stripe-local.sh

# 3. 테스트
npm run dev
```

### Option 2: 수동 설정

```bash
# 상세 가이드 참고
cat SETUP_CHECKLIST.md
```

---

## 🧪 테스트 방법

### 1. Free 사용자 제한 테스트

```bash
# 프로젝트 4개 생성 시도
# → 3개 후 업그레이드 화면

# 업데이트 6개 작성 시도
# → 5개 후 제한 메시지
```

### 2. Pro 구독 플로우 테스트

```bash
1. /pricing → "Upgrade to Pro" 클릭
2. Stripe Checkout 페이지 이동
3. 테스트 카드: 4242 4242 4242 4242
4. 결제 완료 → Dashboard 리다이렉트
5. Pro 배지 확인
6. 무제한 생성 확인
```

---

## 📊 데이터베이스 스키마

### profiles 테이블 (추가된 컬럼)

```sql
subscription_tier        TEXT      -- 'free' | 'pro'
subscription_status      TEXT      -- 'active' | 'inactive' | 'canceled' | 'past_due'
subscription_end_date    TIMESTAMP -- 구독 종료일
stripe_customer_id       TEXT      -- Stripe Customer ID
stripe_subscription_id   TEXT      -- Stripe Subscription ID
```

### subscriptions 테이블 (새로 생성)

```sql
id                       UUID      PRIMARY KEY
user_id                  UUID      REFERENCES auth.users(id)
stripe_customer_id       TEXT      NOT NULL
stripe_subscription_id   TEXT      NOT NULL
stripe_price_id          TEXT      NOT NULL
status                   TEXT      NOT NULL
current_period_start     TIMESTAMP NOT NULL
current_period_end       TIMESTAMP NOT NULL
cancel_at_period_end     BOOLEAN   DEFAULT false
canceled_at              TIMESTAMP
created_at               TIMESTAMP DEFAULT now()
updated_at               TIMESTAMP DEFAULT now()
```

### usage_tracking 테이블 (새로 생성)

```sql
id                       UUID      PRIMARY KEY
user_id                  UUID      REFERENCES auth.users(id)
date                     DATE      NOT NULL DEFAULT CURRENT_DATE
updates_count            INTEGER   DEFAULT 0
projects_count           INTEGER   DEFAULT 0
created_at               TIMESTAMP DEFAULT now()
updated_at               TIMESTAMP DEFAULT now()
UNIQUE(user_id, date)
```

---

## 🔧 환경 변수

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=           # ⚠️ 필수 (Webhook용)

# Stripe
STRIPE_SECRET_KEY=                   # ⚠️ 필수
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # ⚠️ 필수
STRIPE_WEBHOOK_SECRET=               # ⚠️ 필수 (로컬: stripe listen)
STRIPE_PRICE_ID_MONTHLY=             # ⚠️ 필수
STRIPE_PRICE_ID_YEARLY=              # 선택사항

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎯 수익화 전략

### 목표: $500 MRR in 6 months

```
Month 1-2: 베타 테스트, 피드백 수집
  → 목표: 10 Pro subscribers ($90)

Month 3-4: 마케팅 시작, 커뮤니티 성장
  → 목표: 30 Pro subscribers ($270)

Month 5-6: SEO 최적화, 파트너십
  → 목표: 56 Pro subscribers ($500)
```

### 전환 최적화

- ✅ 명확한 Free vs Pro 비교
- ✅ 제한 도달 시 즉시 업그레이드 유도
- ✅ Dashboard에 CTA 배치
- ✅ Pro 배지로 사회적 증거
- ✅ 14일 환불 보장 (Stripe 기본)

---

## 🐛 문제 해결

### "Webhook signature verification failed"

```bash
# Webhook secret 재생성
stripe listen --forward-to localhost:3000/api/stripe/webhook
# 새로운 secret을 .env.local에 업데이트
```

### 구독 후에도 제한이 걸림

```sql
-- Supabase에서 확인
SELECT id, email, subscription_tier, subscription_status
FROM profiles
WHERE email = 'your-test-email@example.com';

-- 수동으로 Pro 설정 (테스트용)
UPDATE profiles
SET subscription_tier = 'pro',
    subscription_status = 'active'
WHERE email = 'your-test-email@example.com';
```

### Service Role Key 에러

```bash
# .env.local 확인
cat .env.local | grep SUPABASE_SERVICE_ROLE_KEY

# 개발 서버 재시작
npm run dev
```

---

## 📈 다음 단계

### 즉시 가능:
- [ ] 프로덕션 배포 (Vercel/Railway)
- [ ] 실제 Stripe 제품 생성
- [ ] 마케팅 시작
- [ ] 첫 Pro 구독자 획득!

### 추가 기능 (선택):
- [ ] Stripe Customer Portal 연동
- [ ] 구독 취소 플로우
- [ ] 이메일 알림 (결제 성공/실패)
- [ ] AI 인사이트 실제 구현
- [ ] 연간 구독 할인 (2개월 무료)

---

## 🎉 완료!

모든 코드가 준비되었습니다. 이제 설정만 하면 수익을 시작할 수 있습니다!

### 📚 가이드 읽는 순서:
1. **QUICK_START.md** ← 여기서 시작!
2. SETUP_CHECKLIST.md (문제 발생 시)
3. STRIPE_SETUP_GUIDE.md (Stripe 상세)
4. MONETIZATION_PLAN.md (전략)

---

**🚀 Let's build in public and make money!** 💰
