FROM node:18-alpine

WORKDIR /app

COPY backend/package.json .
COPY backend/services/auth-service/package.json ./services/auth-service/
COPY backend/firebase.js .
COPY backend/proto ./proto
COPY backend/services/auth-service ./

RUN npm install --cwd . && \
    npm install --cwd ./services/auth-service

EXPOSE 50051

CMD ["node", "index.js"]
