FROM node:18-alpine

WORKDIR /app

COPY backend/package.json .
COPY backend/services/notification-service/package.json ./services/notification-service/
COPY backend/firebase.js .
COPY backend/proto ./proto
COPY backend/services/notification-service ./

RUN npm install --cwd . && \
    npm install --cwd ./services/notification-service

EXPOSE 50055

CMD ["node", "index.js"]
