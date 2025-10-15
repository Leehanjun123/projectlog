# 🔔 Stripe Webhook 설정 가이드

## 로컬 개발 환경 Webhook 설정

### 방법 1: Stripe CLI 사용 (추천)

#### 1단계: Stripe CLI 설치

```bash
# Homebrew로 설치
brew install stripe/stripe-cli/stripe

# 설치 확인
stripe --version
```

#### 2단계: Stripe 로그인

```bash
stripe login
```

브라우저가 열리면 Stripe 계정으로 로그인합니다.

#### 3단계: Webhook 포워딩 시작

**새 터미널 창**을 열고 다음 명령어를 실행:

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

출력 예시:
```
> Ready! Your webhook signing secret is whsec_1a2b3c4d5e6f... (^C to quit)
```

#### 4단계: Webhook Secret 복사

터미널에 출력된 `whsec_...` 로 시작하는 값을 복사합니다.

#### 5단계: .env.local 업데이트

```bash
STRIPE_WEBHOOK_SECRET=whsec_1a2b3c4d5e6f...  # 복사한 값 붙여넣기
```

#### 6단계: 개발 서버 재시작

```bash
# 기존 서버 종료 (Ctrl+C)
npm run dev
```

### 방법 2: Stripe Dashboard 사용 (프로덕션)

#### 1단계: Stripe Dashboard 접속

```
https://dashboard.stripe.com/test/webhooks
```

#### 2단계: Endpoint 추가

1. "Add endpoint" 버튼 클릭
2. Endpoint URL 입력:
   - 로컬: `http://localhost:3001/api/stripe/webhook` (ngrok 사용 시)
   - 프로덕션: `https://your-domain.com/api/stripe/webhook`

#### 3단계: 이벤트 선택

다음 이벤트를 체크:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

#### 4단계: Endpoint 생성

"Add endpoint" 클릭

#### 5단계: Signing Secret 복사

생성된 Endpoint 페이지에서 "Signing secret"을 클릭하여 복사

#### 6단계: .env.local 업데이트

```bash
STRIPE_WEBHOOK_SECRET=whsec_...  # 복사한 값
```

---

## 테스트 방법

### 1. Webhook 이벤트 수동 테스트

Stripe CLI로 테스트 이벤트 전송:

```bash
# checkout.session.completed 이벤트 테스트
stripe trigger checkout.session.completed
```

### 2. 실제 결제 플로우 테스트

1. `http://localhost:3001/pricing` 접속
2. "Upgrade to Pro" 클릭
3. 테스트 카드 정보 입력:
   - 카드번호: `4242 4242 4242 4242`
   - 만료일: `12/34`
   - CVC: `123`
4. "Subscribe" 클릭
5. Dashboard로 리다이렉트 확인
6. Profile에 "PRO" 배지 확인

### 3. Webhook 로그 확인

**터미널 1 (Stripe CLI)**:
```
✓ Received event checkout.session.completed
→ POST /api/stripe/webhook [200]
```

**터미널 2 (Next.js 서버)**:
```
✅ User abc123... upgraded to Pro
```

**Supabase 확인**:
```sql
SELECT email, subscription_tier, subscription_status
FROM profiles
WHERE email = 'your-email@example.com';
```

---

## 문제 해결

### Webhook signature verification failed

**원인**: Webhook Secret이 잘못되었거나 만료됨

**해결**:
1. Stripe CLI 재시작:
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```
2. 새로운 secret을 `.env.local`에 업데이트
3. 개발 서버 재시작

### User not upgraded after payment

**원인**: Webhook이 실행되지 않았거나 실패함

**해결**:
1. Stripe CLI 터미널 확인 - 이벤트가 수신되었는지 확인
2. Next.js 서버 로그 확인 - 에러 메시지 확인
3. Supabase에서 직접 확인:
   ```sql
   UPDATE profiles
   SET subscription_tier = 'pro',
       subscription_status = 'active'
   WHERE email = 'your-email@example.com';
   ```

### Port 3000 vs 3001 문제

현재 서버가 **포트 3001**에서 실행 중이므로:

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

반드시 **3001** 사용!

---

## 프로덕션 배포 시

### 1. Vercel/Railway 배포

환경 변수 설정:
```
STRIPE_WEBHOOK_SECRET=whsec_...  # 프로덕션용 secret
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...  # Live Mode로 전환
STRIPE_PRICE_ID_MONTHLY=price_...  # Live Mode price
```

### 2. Stripe Dashboard에서 프로덕션 Webhook 생성

```
Endpoint URL: https://your-domain.com/api/stripe/webhook
Events: checkout.session.completed, customer.subscription.*, invoice.payment_failed
```

### 3. Webhook Secret 업데이트

프로덕션 환경 변수에 새로운 Webhook Secret 추가

---

## 현재 상태

✅ Webhook 코드 구현 완료
✅ `.env.local`에 Service Role Key 설정됨
⏳ Stripe CLI 설치 중
⏳ Webhook Secret 설정 필요

**다음 단계**: Stripe CLI 설치 완료 후 `stripe listen` 실행!
