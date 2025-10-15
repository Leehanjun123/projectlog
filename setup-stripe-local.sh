#!/bin/bash

# ProjectLog Stripe 로컬 테스트 설정 스크립트

echo "🚀 ProjectLog Stripe 로컬 설정을 시작합니다..."
echo ""

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Stripe CLI 확인
echo -e "${BLUE}1. Stripe CLI 확인 중...${NC}"
if ! command -v stripe &> /dev/null; then
    echo -e "${YELLOW}Stripe CLI가 설치되어 있지 않습니다.${NC}"
    echo "설치하시겠습니까? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Stripe CLI 설치 중..."
        brew install stripe/stripe-cli/stripe
    else
        echo -e "${RED}Stripe CLI가 필요합니다. 수동 설정 가이드를 참고하세요.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Stripe CLI가 이미 설치되어 있습니다.${NC}"
fi

echo ""

# 2. Stripe 로그인 확인
echo -e "${BLUE}2. Stripe 계정 로그인...${NC}"
echo "브라우저에서 Stripe 로그인을 승인해주세요..."
stripe login

echo ""

# 3. .env.local 파일 확인
echo -e "${BLUE}3. 환경 변수 파일 확인...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${RED}✗ .env.local 파일이 없습니다!${NC}"
    echo "템플릿을 생성하시겠습니까? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        cat > .env.local << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://demjkxevtdnnxvwrbrst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
STRIPE_PRICE_ID_MONTHLY=your_monthly_price_id_here
STRIPE_PRICE_ID_YEARLY=your_yearly_price_id_here
EOF
        echo -e "${GREEN}✓ .env.local 템플릿이 생성되었습니다.${NC}"
        echo -e "${YELLOW}⚠️  Stripe 키들을 직접 입력해주세요!${NC}"
    fi
else
    echo -e "${GREEN}✓ .env.local 파일이 존재합니다.${NC}"
fi

echo ""

# 4. Webhook 로컬 포워딩 시작
echo -e "${BLUE}4. Stripe Webhook 로컬 포워딩 설정...${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}다음 명령어를 별도 터미널에서 실행하세요:${NC}"
echo ""
echo -e "${GREEN}stripe listen --forward-to localhost:3000/api/stripe/webhook${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "출력된 webhook signing secret (whsec_로 시작)을"
echo ".env.local의 STRIPE_WEBHOOK_SECRET에 추가하세요."
echo ""

# 5. 개발 서버 시작 안내
echo -e "${BLUE}5. 다음 단계:${NC}"
echo ""
echo "1️⃣  별도 터미널에서 Webhook 포워딩 실행:"
echo -e "   ${GREEN}stripe listen --forward-to localhost:3000/api/stripe/webhook${NC}"
echo ""
echo "2️⃣  Webhook Secret을 .env.local에 추가"
echo ""
echo "3️⃣  개발 서버 시작:"
echo -e "   ${GREEN}npm run dev${NC}"
echo ""
echo "4️⃣  테스트:"
echo "   - http://localhost:3000/pricing 접속"
echo "   - Upgrade to Pro 클릭"
echo "   - 테스트 카드: 4242 4242 4242 4242"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ 설정 준비가 완료되었습니다!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📚 자세한 설정 가이드: SETUP_CHECKLIST.md"
echo ""
