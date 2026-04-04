FROM node:18-alpine

WORKDIR /app

COPY backend/package.json .
COPY backend/services/asset-service/package.json ./services/asset-service/
COPY backend/firebase.js .
COPY backend/proto ./proto
COPY backend/services/asset-service ./

RUN npm install --cwd . && \
    npm install --cwd ./services/asset-service

EXPOSE 50054

CMD ["node", "index.js"]
