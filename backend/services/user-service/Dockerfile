FROM node:18-alpine

WORKDIR /app

COPY backend/package.json .
COPY backend/services/user-service/package.json ./services/user-service/
COPY backend/firebase.js .
COPY backend/proto ./proto
COPY backend/services/user-service ./

RUN npm install --cwd . && \
    npm install --cwd ./services/user-service

EXPOSE 50052

CMD ["node", "index.js"]
