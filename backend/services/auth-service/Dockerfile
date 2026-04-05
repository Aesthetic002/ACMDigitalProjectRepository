FROM node:18-alpine

WORKDIR /app

# Copy shared files
COPY serviceAccountKey.json ./serviceAccountKey.json
COPY firebase.js ./firebase.js
COPY proto ./proto
COPY services/firebase.js ./services/firebase.js

# Copy service files
COPY services/auth-service ./services/auth-service

# Install dependencies
WORKDIR /app/services/auth-service
RUN npm install

EXPOSE 50051

ENV NODE_PATH=/app/services/auth-service/node_modules
CMD ["node", "index.js"]
