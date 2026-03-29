FROM node:18-alpine

WORKDIR /app

COPY backend/package.json .
COPY backend/gateway/package.json ./gateway/
COPY backend/proto ./proto
COPY backend/gateway ./

RUN npm install --cwd . && \
    npm install --cwd ./gateway

EXPOSE 3000

CMD ["node", "index.js"]
