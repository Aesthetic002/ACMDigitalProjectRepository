FROM node:18-alpine
WORKDIR /app
COPY serviceAccountKey.json ./serviceAccountKey.json
COPY firebase.js ./firebase.js
COPY proto ./proto
COPY services/firebase.js ./services/firebase.js
COPY services/comment-service ./services/comment-service
WORKDIR /app/services/comment-service
RUN npm install
EXPOSE 50056
ENV NODE_PATH=/app/services/comment-service/node_modules
CMD ["node", "index.js"]