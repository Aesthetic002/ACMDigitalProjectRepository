FROM node:18-alpine

WORKDIR /app

COPY backend/package.json .
COPY backend/services/project-service/package.json ./services/project-service/
COPY backend/firebase.js .
COPY backend/proto ./proto
COPY backend/services/project-service ./

RUN npm install --cwd . && \
    npm install --cwd ./services/project-service

EXPOSE 50053

CMD ["node", "index.js"]
