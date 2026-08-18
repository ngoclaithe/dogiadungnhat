#!/usr/bin/env bash
set -euo pipefail

cd /home
if [ ! -d /home/dogiadungnhat/.git ]; then
  git clone git@github.com:ngoclaithe/dogiadungnhat.git /home/dogiadungnhat
else
  git -C /home/dogiadungnhat pull --ff-only
fi

export PGPASSWORD=test1234
EXISTS=$(psql -U postgres -h 127.0.0.1 -tAc "SELECT 1 FROM pg_database WHERE datname='nhatnoidia'" || true)
if [ "$EXISTS" != "1" ]; then
  psql -U postgres -h 127.0.0.1 -c "CREATE DATABASE nhatnoidia;"
fi

cat > /home/dogiadungnhat/backend/.env << 'EOF'
DATABASE_URL="postgresql://postgres:test1234@localhost:5432/nhatnoidia?schema=public"
JWT_SECRET="ndn-prod-7f3a9c2e8b14d6f0"
COOKIE_DOMAIN=".dosutech.site"
PORT=4088
FRONTEND_URL="https://dogiadungnhat.dosutech.site"
SOURCE_SITE="https://dogiadungnhat.com.vn"
EOF

cat > /home/dogiadungnhat/frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://api-dogiadungnhat.dosutech.site/api
API_URL=http://127.0.0.1:4088/api
NEXT_PUBLIC_SITE_URL=https://dogiadungnhat.dosutech.site
EOF

echo "== backend install =="
cd /home/dogiadungnhat/backend
npm ci
npx prisma generate
npx prisma db push
npx prisma db seed
npm run build

echo "== frontend install =="
cd /home/dogiadungnhat/frontend
npm ci
npm run build

echo "== nginx =="
cp /home/dogiadungnhat/deploy/nginx/dogiadungnhat.dosutech.site.conf /etc/nginx/sites-available/dogiadungnhat.dosutech.site.conf
cp /home/dogiadungnhat/deploy/nginx/api-dogiadungnhat.dosutech.site.conf /etc/nginx/sites-available/api-dogiadungnhat.dosutech.site.conf
ln -sfn /etc/nginx/sites-available/dogiadungnhat.dosutech.site.conf /etc/nginx/sites-enabled/dogiadungnhat.dosutech.site.conf
ln -sfn /etc/nginx/sites-available/api-dogiadungnhat.dosutech.site.conf /etc/nginx/sites-enabled/api-dogiadungnhat.dosutech.site.conf
nginx -t
systemctl reload nginx

echo "== ssl =="
certbot --nginx \
  -d dogiadungnhat.dosutech.site \
  -d api-dogiadungnhat.dosutech.site \
  --non-interactive --agree-tos --redirect \
  -m support@dosutech.site || true

echo "== pm2 =="
cd /home/dogiadungnhat
pm2 delete dogiadungnhat-api dogiadungnhat-web >/dev/null 2>&1 || true
pm2 start ecosystem.config.cjs
pm2 save

echo "== done =="
pm2 list | grep dogiadungnhat || true
