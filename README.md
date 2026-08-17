# Nội Địa Nhật

Next.js (FE) + NestJS (BE) + Prisma/PostgreSQL.

Production:
- FE: https://dogiadungnhat.dosutech.site → `127.0.0.1:3088`
- API: https://api-dogiadungnhat.dosutech.site → `127.0.0.1:4088`

## Local

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run start:dev
```

```bash
cd frontend
npm install
npm run dev
```

- FE: http://localhost:3000
- API: http://localhost:4000/api

## VPS

Xem `deploy/nginx/` và `ecosystem.config.cjs`. Nginx proxy 80/443 tới port 3088 (web) và 4088 (API).
