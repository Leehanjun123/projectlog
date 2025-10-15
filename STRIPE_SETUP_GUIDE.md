# 💳 Stripe 설정 가이드

## ✅ 완료된 작업

수익화 기능이 완전히 구현되었습니다!

1. ✅ Supabase 데이터베이스 스키마 업데이트
2. ✅ Stripe 패키지 설치
3. ✅ Pricing 페이지 생성
4. ✅ Stripe Checkout API
5. ✅ Stripe Webhook 처리
6. ✅ 프리미엄 기능 제한 유틸리티

---

## 🚀 설정 단계

### 1단계: Supabase 데이터베이스 업데이트

**Supabase Dashboard → SQL Editor** 에서 다음 SQL 실행:

```sql
-- supabase-subscription-migration.sql 파일 내용 복사해서 실행
```

또는 파일에서 직접 실행:
1. Supabase Dashboard 접속
2. SQL Editor 열기
3. `/Users/leehanjun/Desktop/money/projectlog/supabase-subscription-migration.sql` 파일 내용 복사
4. 붙여넣기 → Run

**주요 변경사항:**
- `profiles` 테이블에 구독 관련 컬럼 추가
- `subscriptions` 테이블 생성 (구독 이력)
- `usage_tracking` 테이블 생성 (사용량 추적)
- 구독 상태 체크 함수들 생성

---

### 2단계: Stripe 계정 설정

#### A. Stripe 계정 생성
1. https://stripe.com 접속
2. "Start now" 클릭하여 계정 생성
3. 이메일 인증 완료

#### B. API 키 가져오기
1. Stripe Dashboard → **Developers** → **API keys**
2. 다음 키 복사:
   - **Publishable key** (pk_test_로 시작)
   - **Secret key** (sk_test_로 시작)

#### C. 제품 및 가격 생성

**월간 구독 ($9/월):**
1. Stripe Dashboard → **Products** → **Add product**
2. 제품 정보 입력:
   - Name: `ProjectLog Pro - Monthly`
   - Description: `Unlimited projects, AI insights, and more`
3. Pricing 설정:
   - Price: `$9.00 USD`
   - Billing period: `Monthly`
   - Price type: `Recurring`
4. **Save product**
5. **Price ID 복사** (price_로 시작)

**연간 구독 ($90/년):**
1. 같은 제품에 추가 가격 생성
2. **Add another price**
3. Pricing 설정:
   - Price: `$90.00 USD`
   - Billing period: `Yearly`
   - Price type: `Recurring`
4. **Save price**
5. **Price ID 복사**

#### D. Webhook 설정
1. Stripe Dashboard → **Developers** → **Webhooks**
2. **Add endpoint** 클릭
3. Endpoint URL 입력:
   ```
   https://your-domain.com/api/stripe/webhook
   ```
   (로컬 테스트: `http://localhost:3000/api/stripe/webhook`)
4. **Select events** 클릭하여 다음 이벤트 선택:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. **Add endpoint**
6. **Signing secret** 복사 (whsec_로 시작)

---

### 3단계: 환경 변수 설정

`.env.local` 파일 업데이트:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Supabase Settings → API에서 복사

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # 프로덕션: https://your-domain.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...  # 2단계 B에서 복사
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # 2단계 B에서 복사
STRIPE_WEBHOOK_SECRET=whsec_...  # 2단계 D에서 복사
STRIPE_PRICE_ID_MONTHLY=price_...  # 2단계 C에서 복사 (월간)
STRIPE_PRICE_ID_YEARLY=price_...  # 2단계 C에서 복사 (연간)

# OpenAI (Pro 기능용)
OPENAI_API_KEY=your_openai_key  # 선택사항
```

---

### 4단계: Supabase Service Role Key 가져오기

⚠️ **중요**: Service Role Key는 보안이 매우 중요합니다!

1. Supabase Dashboard 접속
2. **Settings** → **API**
3. **Service Role** 섹션에서 **service_role key** 복사
4. `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY=` 설정

**주의사항:**
- 절대 GitHub에 커밋하지 마세요
- `.env.local`은 `.gitignore`에 포함되어 있음
- 서버 사이드에서만 사용 (webhook용)

---

### 5단계: 로컬 테스트

#### A. Stripe CLI 설치 (Webhook 테스트용)

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
```powershell
scoop install stripe
```

#### B. Stripe CLI 로그인
```bash
stripe login
```

#### C. Webhook 로컬 포워딩
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

이 명령어가 Webhook Signing Secret을 출력합니다. 이를 `.env.local`의 `STRIPE_WEBHOOK_SECRET`에 설정하세요.

#### D. 개발 서버 시작
```bash
npm run dev
```

#### E. 테스트 결제

1. http://localhost:3000/pricing 접속
2. "Upgrade to Pro" 클릭
3. Stripe Checkout 페이지로 이동
4. 테스트 카드 번호 사용:
   - 카드 번호: `4242 4242 4242 4242`
   - 만료일: 미래 날짜 (예: `12/34`)
   - CVC: 아무 3자리 (예: `123`)
   - ZIP: 아무 5자리 (예: `12345`)
5. "Subscribe" 클릭
6. Dashboard로 리다이렉트
7. 프로필에서 Pro 상태 확인

---

## 📁 생성된 파일

```
projectlog/
├── MONETIZATION_PLAN.md              # 수익화 전략 문서
├── STRIPE_SETUP_GUIDE.md             # 이 가이드
├── supabase-subscription-migration.sql # DB 마이그레이션
│
├── app/
│   ├── pricing/
│   │   └── page.tsx                  # Pricing 페이지
│   └── api/
│       └── stripe/
│           ├── checkout/route.ts     # Checkout 세션 생성
│           └── webhook/route.ts      # Webhook 처리
│
└── lib/
    └── subscription.ts               # 구독 유틸리티
```

---

## 🎯 다음 단계

### 구현 완료한 것:
- ✅ Pricing 페이지
- ✅ Stripe Checkout
- ✅ Webhook 처리
- ✅ 구독 상태 DB 저장
- ✅ 프리미엄 제한 로직

### 아직 구현 안 된 것:
1. **프로젝트 생성 시 제한 체크** (3개 제한)
2. **업데이트 생성 시 제한 체크** (5개/일 제한)
3. **Pro 배지 표시** (프로필 & 피드)
4. **대시보드에 "Upgrade to Pro" CTA**
5. **구독 관리 페이지** (취소/재개)

---

## 💡 제한 구현 예시

### 프로젝트 생성 제한 체크

`/app/projects/new/page.tsx` 수정:

```typescript
import { canCreateProject } from '@/lib/subscription'

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 프로젝트 생성 가능 여부 체크
  const { allowed, reason } = await canCreateProject(user.id)

  if (!allowed) {
    // 업그레이드 페이지로 리다이렉트 또는 에러 표시
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>프로젝트 제한 도달</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{reason}</p>
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                Upgrade to Pro
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 정상적으로 프로젝트 생성 페이지 표시
  return (
    // ... 기존 코드
  )
}
```

### 업데이트 생성 제한 체크

`/app/projects/[id]/new-update/page.tsx` 수정:

```typescript
import { canCreateUpdate } from '@/lib/subscription'

// ... 페이지 내에서
const { allowed, reason, count } = await canCreateUpdate(user.id)

if (!allowed) {
  // 제한 메시지 표시
  return (
    <div className="max-w-2xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>일일 업데이트 제한 도달</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-2">{reason}</p>
          <p className="text-sm text-gray-500 mb-4">
            오늘 {count}개의 업데이트를 작성했습니다.
          </p>
          <Link href="/pricing">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              Upgrade to Pro
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🎉 완료!

수익화 기능의 핵심 인프라가 완성되었습니다!

### 현재 상태:
- ✅ Pricing 페이지 (Beautiful!)
- ✅ Stripe 결제 연동
- ✅ Webhook으로 구독 상태 자동 업데이트
- ✅ DB에 구독 정보 저장
- ✅ 프리미엄 제한 로직

### 테스트 체크리스트:
1. [ ] Supabase SQL 실행
2. [ ] Stripe 계정 및 제품 생성
3. [ ] 환경 변수 설정
4. [ ] Stripe CLI 설치 및 webhook 포워딩
5. [ ] 테스트 결제 진행
6. [ ] DB에서 구독 상태 확인
7. [ ] Dashboard에서 Pro 상태 확인

### 다음 할 일:
1. 프로젝트/업데이트 생성 시 제한 체크 추가
2. Pro 배지 표시
3. 대시보드에 "Upgrade" CTA 추가
4. 구독 관리 페이지 생성

---

**목표: $500 MRR in 6 months** 🚀

준비됐습니다! 이제 진짜 돈을 벌 수 있어요! 💰
