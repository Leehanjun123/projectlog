# 🎯 ProjectLog 수익화 설정 체크리스트

모든 프리미엄 기능이 구현 완료되었습니다! 이제 설정만 하면 바로 수익화를 시작할 수 있습니다.

---

## ✅ 1단계: Supabase SQL 마이그레이션 실행

### 방법:
1. **Supabase Dashboard 접속**: https://supabase.com/dashboard
2. **프로젝트 선택**: `demjkxevtdnnxvwrbrst`
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New query** 버튼 클릭
5. `supabase-subscription-migration.sql` 파일 내용 **전체** 복사
6. SQL Editor에 붙여넣기
7. **Run** 버튼 클릭 (또는 Cmd+Enter)

### 실행 결과:
- profiles 테이블에 구독 관련 컬럼 추가
- subscriptions 테이블 생성
- usage_tracking 테이블 생성
- 구독 체크 함수들 생성

### ✅ 완료 확인:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name LIKE '%subscription%';
```

위 쿼리를 실행해서 subscription 관련 컬럼들이 보이면 성공!

---

## ✅ 2단계: Supabase Service Role Key 가져오기

### 방법:
1. Supabase Dashboard에서 **Settings** → **API** 클릭
2. **Service Role** 섹션 찾기
3. `service_role` key 우측의 **Reveal** 클릭
4. **Copy** 버튼으로 키 복사
5. `.env.local` 파일에 붙여넣기:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ...복사한키...
```

⚠️ **주의**: 이 키는 절대 GitHub에 커밋하지 마세요!

---

## ✅ 3단계: Stripe 계정 설정

### A. Stripe 계정 생성
1. https://stripe.com 접속
2. **Sign up** 클릭
3. 이메일로 가입 및 인증
4. Dashboard 접속

### B. API 키 가져오기
1. Stripe Dashboard → 우측 상단 **Developers** 클릭
2. 왼쪽 메뉴에서 **API keys** 클릭
3. 다음 두 키 복사:
   - **Publishable key** (pk_test_로 시작)
   - **Secret key** (sk_test_로 시작) - **Reveal test key** 클릭 필요

`.env.local`에 추가:
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### C. 제품 및 가격 생성

#### 월간 구독 ($9/월):
1. Stripe Dashboard → 좌측 **Products** 클릭
2. 우측 상단 **Add product** 클릭
3. 제품 정보 입력:
   - **Name**: `ProjectLog Pro - Monthly`
   - **Description**: `Unlimited projects, unlimited updates, AI insights, and premium badge`
4. Pricing 설정:
   - **Standard pricing** 선택
   - **Price**: `9.00 USD`
   - **Billing period**: `Monthly`
   - **Payment type**: `Recurring`
5. 우측 하단 **Add product** 클릭
6. 생성된 제품 페이지에서 **Pricing** 섹션의 Price ID 복사 (price_로 시작)

`.env.local`에 추가:
```bash
STRIPE_PRICE_ID_MONTHLY=price_...
```

#### 연간 구독 ($90/년) - 선택사항:
1. 같은 제품 페이지에서 **Pricing** 섹션으로 스크롤
2. **Add another price** 클릭
3. Pricing 설정:
   - **Price**: `90.00 USD`
   - **Billing period**: `Yearly`
4. **Add price** 클릭
5. Price ID 복사

`.env.local`에 추가:
```bash
STRIPE_PRICE_ID_YEARLY=price_...
```

---

## ✅ 4단계: Stripe Webhook 설정

### 로컬 테스트용 (개발):
1. 터미널 열기
2. Stripe CLI가 설치되어 있지 않다면:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```
3. Stripe 로그인:
   ```bash
   stripe login
   ```
   브라우저에서 승인
4. Webhook 포워딩 시작:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
5. 출력된 webhook signing secret (whsec_로 시작) 복사
6. `.env.local`에 추가:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 프로덕션용:
1. Stripe Dashboard → **Developers** → **Webhooks**
2. **Add endpoint** 클릭
3. Endpoint URL 입력:
   ```
   https://your-production-domain.com/api/stripe/webhook
   ```
4. **Select events** 클릭하여 다음 선택:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. **Add endpoint** 클릭
6. Signing secret 복사하여 프로덕션 환경 변수에 추가

---

## ✅ 5단계: 환경 변수 최종 확인

`.env.local` 파일이 다음과 같이 설정되어 있는지 확인:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://demjkxevtdnnxvwrbrst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...기존키...
SUPABASE_SERVICE_ROLE_KEY=eyJ...서비스롤키...  # ✅ 2단계에서 복사

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe (✅ 3단계, 4단계에서 복사)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...  # 선택사항

# OpenAI (나중에 AI 기능 추가할 때)
OPENAI_API_KEY=your_openai_api_key_here
```

---

## ✅ 6단계: 테스트

### A. 개발 서버 시작
```bash
npm run dev
```

### B. Webhook 포워딩 시작 (별도 터미널)
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### C. 테스트 시나리오

#### 1️⃣ 제한 테스트 (Free 사용자)
- http://localhost:3000/login 접속 및 로그인
- 프로젝트 3개 생성 시도 → 3개째는 업그레이드 화면 표시되어야 함
- 하루에 업데이트 5개 작성 시도 → 5개째는 제한 메시지 표시되어야 함

#### 2️⃣ 구독 테스트
1. http://localhost:3000/pricing 접속
2. **Upgrade to Pro** 버튼 클릭
3. Stripe Checkout 페이지로 이동
4. 테스트 카드 정보 입력:
   - 카드 번호: `4242 4242 4242 4242`
   - 만료일: 미래 날짜 (예: `12/34`)
   - CVC: 아무 3자리 (예: `123`)
   - 이름: 아무 이름
   - 이메일: 아무 이메일
5. **Subscribe** 클릭
6. Dashboard로 리다이렉트 확인
7. 구독 상태 확인:
   - Supabase에서 profiles 테이블 확인
   - subscription_tier가 'pro'로 변경
   - subscription_status가 'active'로 변경

#### 3️⃣ Pro 기능 테스트
- 프로젝트 4개, 5개, ... 무제한 생성 가능 확인
- 하루에 업데이트 10개, 20개, ... 무제한 작성 가능 확인
- 피드에서 사용자 이름 옆에 "PRO" 배지 표시 확인
- 프로필 페이지에서 "⭐ PRO" 배지 표시 확인

#### 4️⃣ Webhook 확인
- Webhook 포워딩 터미널에서 다음 이벤트 로그 확인:
  ```
  ✓ [200] POST /api/stripe/webhook [checkout.session.completed]
  ```

---

## 🎉 완료!

모든 단계가 완료되면 다음이 가능합니다:

### Free 사용자:
- ✅ 3개 프로젝트
- ✅ 하루 5개 업데이트
- ✅ 기본 기능 사용

### Pro 사용자 ($9/월):
- ✅ 무제한 프로젝트
- ✅ 무제한 업데이트
- ✅ Pro 배지
- ✅ AI 인사이트 (준비 중)

---

## 🐛 문제 해결

### 1. "Webhook signature verification failed"
- `.env.local`의 `STRIPE_WEBHOOK_SECRET`이 올바른지 확인
- `stripe listen` 명령어를 다시 실행하여 새로운 secret 받기

### 2. "Service role key not found"
- `.env.local`의 `SUPABASE_SERVICE_ROLE_KEY` 확인
- 개발 서버 재시작 (`npm run dev`)

### 3. 구독 후에도 제한이 걸림
- Supabase에서 profiles 테이블 확인:
  ```sql
  SELECT id, email, subscription_tier, subscription_status
  FROM profiles
  WHERE email = 'your-test-email@example.com';
  ```
- subscription_tier가 'pro', subscription_status가 'active'인지 확인

### 4. Checkout 페이지가 안 열림
- `.env.local`의 Stripe 키들 확인
- 브라우저 콘솔에서 에러 확인
- API 로그 확인

---

## 📊 다음 단계

### 프로덕션 배포:
1. Vercel/Railway/기타 플랫폼에 환경 변수 추가
2. `NEXT_PUBLIC_APP_URL`을 실제 도메인으로 변경
3. Stripe에서 프로덕션 Webhook 엔드포인트 추가
4. 실제 결제 모드로 전환 (Test mode → Live mode)

### 추가 기능:
- [ ] 구독 취소 기능
- [ ] Stripe Customer Portal 연동
- [ ] 이메일 알림
- [ ] 결제 영수증 발송
- [ ] AI 인사이트 기능 실제 구현

---

**목표: $500 MRR in 6 months** 🚀

모든 준비가 끝났습니다! 이제 첫 Pro 구독자를 받을 준비가 되었어요! 💰
