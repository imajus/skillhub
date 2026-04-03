FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY skills ./skills
COPY public ./public
COPY package.json ./

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/index.js"]
