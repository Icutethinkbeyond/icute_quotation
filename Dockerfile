# ขั้นตอนที่ 1: Build Stage
FROM node:22-alpine AS builder

# ติดตั้ง dependencies พื้นฐาน
RUN apk add --no-cache bash

# ระบุ Build Arguments
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG DATABASE_URL

# กำหนด ENV Variables จาก Build Arguments
# ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET} \
#     NEXTAUTH_URL=${NEXTAUTH_URL} \
#     DATABASE_URL=${DATABASE_URL} 

ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET \
    NEXTAUTH_URL=$NEXTAUTH_URL \
    DATABASE_URL=$DATABASE_URL 

# กำหนด working directory
WORKDIR /app

# คัดลอกไฟล์ package.json และ yarn.lock เพื่อทำการติดตั้ง dependencies
COPY package.json yarn.lock  ./

# ติดตั้ง dependencies
RUN yarn install --frozen-lockfile --production=false --network-timeout=1000000

RUN yarn add prisma --dev

# คัดลอกโค้ดทั้งหมดไปยัง container
COPY . .

# แสดงค่า Environment Variables (เพื่อการทดสอบ)
RUN echo "NEXTAUTH_SECRET is $NEXTAUTH_SECRET"
RUN echo "NEXTAUTH_URL is $NEXTAUTH_URL"
RUN echo "DATABASE_URL is $DATABASE_URL"

RUN yarn prisma generate

# สร้างแอปสำหรับ production โดยใช้โหมด standalone
RUN yarn build

# ลบ dependencies ที่ไม่จำเป็นในขั้น build
RUN rm -rf node_modules

# ขั้นตอนที่ 2: Runtime Stage
FROM node:22-alpine

# เพิ่ม User ที่ไม่ใช่ root เพื่อความปลอดภัย
RUN addgroup -g 1001 appgroup && adduser -D -G appgroup -u 1001 appuser

# กำหนด working directory
WORKDIR /app

# คัดลอกไฟล์ standalone และ dependencies ที่จำเป็นจาก build stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# เปลี่ยนสิทธิ์ให้ user ที่ไม่ใช่ root
RUN chown -R appuser:appgroup /app

# เปลี่ยนเป็น user ที่ไม่มีสิทธิ์ root
USER appuser

# เปิดพอร์ตที่แอปของคุณจะรัน
EXPOSE 3000

# รันแอปในโหมด production
CMD ["node", "server.js"]
