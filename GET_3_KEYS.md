# 🔑 3가지 키 얻는 방법

## 1️⃣ Stripe Price ID 받기

### 단계별 가이드:

1. **Stripe Dashboard 접속**
   ```
   https://dashboard.stripe.com/test/products
   ```

2. **우측 상단 "Add product" 버튼 클릭**

3. **제품 정보 입력**:
   - **Product information**:
     - Name: `ProjectLog Pro - Monthly`
     - Description: `Unlimited projects, unlimited updates, AI insights, and premium badge`

4. **Pricing information 입력**:
   - Model: `Standard pricing` 선택
   - Price: `9.00`
   - Currency: `USD` 선택
   - Billing period: `Recurring` 선택
   - Repeat interval: `Monthly` 선택

5. **우측 하단 "Add product" 버튼 클릭**

6. **Price ID 복사**:
   - 제품 생성 후 자동으로 제품 상세 페이지로 이동
   - "Pricing" 섹션에 있는 Price ID 찾기
   - `price_` 로 시작하는 ID (예: `price_1abc2def3ghi`)
   - 우측의 Copy 아이콘 클릭

**예시**:
```
price_1OxxxxxxxxxxxxxxxxxxxxGM
```

---

## 2️⃣ Supabase Service Role Key 받기

### 단계별 가이드:

1. **Supabase Dashboard 접속**
   ```
   https://supabase.com/dashboard/project/demjkxevtdnnxvwrbrst/settings/api
   ```

2. **"Project API keys" 섹션 찾기**
   - 페이지 중간쯤에 있는 API Keys 섹션

3. **service_role 키 찾기**:
   - `anon` `public` - 이건 아님!
   - `service_role` `secret` - 바로 이것!

4. **"Reveal" 버튼 클릭**:
   - service_role 행의 우측에 있는 👁️ "Reveal" 버튼 클릭
   - 키가 표시됨

5. **Copy 버튼 클릭**:
   - 📋 Copy 아이콘 클릭
   - `eyJ` 로 시작하는 매우 긴 문자열

**예시**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbWpreGV2dGRubnh2d3JicnN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDUxMjIyMCwiZXhwIjoyMDc2MDg4MjIwfQ...
```

⚠️ **주의**: 이 키는 절대 GitHub에 올리지 마세요!

---

## 3️⃣ Supabase SQL 마이그레이션 실행

### 단계별 가이드:

1. **Supabase SQL Editor 접속**
   ```
   https://supabase.com/dashboard/project/demjkxevtdnnxvwrbrst/sql
   ```

2. **"New query" 버튼 클릭**
   - 좌측 상단의 초록색 버튼

3. **SQL 파일 열기**:
   - 로컬에서 이 파일 열기:
   ```
   /Users/leehanjun/Desktop/money/projectlog/supabase-subscription-migration.sql
   ```

4. **SQL 복사**:
   - 파일의 **전체 내용** 복사 (Cmd+A, Cmd+C)
   - 총 165줄

5. **SQL Editor에 붙여넣기**:
   - Supabase SQL Editor에 붙여넣기 (Cmd+V)

6. **실행**:
   - 우측 하단 "Run" 버튼 클릭 (또는 Cmd+Enter)
   - 성공 메시지 확인: "Success. No rows returned"

7. **확인 (선택사항)**:
   - 새 쿼리 창 열기
   - 다음 SQL 실행하여 테이블 확인:
   ```sql
   SELECT column_name
   FROM information_schema.columns
   WHERE table_name = 'profiles'
   AND column_name LIKE '%subscription%';
   ```
   - 5개 컬럼이 보이면 성공!

---

## 📋 SQL 파일 미리보기

파일이 다음과 같이 시작합니다:

```sql
-- Add subscription fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro'));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due'));
...
```

---

## ✅ 완료 확인

3가지를 모두 받았으면 다음 형식으로 저에게 알려주세요:

```
price_id: price_1OxxxxxxxxxxxxxxxxxxxxGM
service_role_key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
sql_executed: yes
```

---

## 🆘 문제 발생 시

### Stripe Price ID를 못 찾겠어요
- Products 페이지에서 방금 생성한 "ProjectLog Pro - Monthly" 클릭
- Pricing 섹션에서 Monthly price 찾기
- API ID가 price_로 시작하는 ID

### Service Role Key가 안 보여요
- Settings → API 페이지 확인
- 페이지를 아래로 스크롤
- "Project API keys" 섹션
- service_role (secret) 행 찾기

### SQL 실행이 실패해요
**에러: "relation already exists"**
- 이미 실행된 것입니다! 괜찮습니다.
- 계속 진행하세요.

**에러: "permission denied"**
- 프로젝트 Owner인지 확인
- Supabase 대시보드에서 로그아웃 후 다시 로그인

**에러: "syntax error"**
- SQL 전체를 복사했는지 확인
- 파일 전체 165줄 모두 복사

---

## 🎯 터미널로 SQL 파일 확인

```bash
# SQL 파일 내용 보기
cat /Users/leehanjun/Desktop/money/projectlog/supabase-subscription-migration.sql

# SQL 파일 줄 수 확인
wc -l /Users/leehanjun/Desktop/money/projectlog/supabase-subscription-migration.sql
```

---

**준비되셨나요? 시작하세요!** 🚀
