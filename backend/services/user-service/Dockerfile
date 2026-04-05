FROM node:18-alpine

WORKDIR /app

# Copy shared files
COPY serviceAccountKey.json ./serviceAccountKey.json
COPY firebase.js ./firebase.js
COPY proto ./proto
COPY services/firebase.js ./services/firebase.js

# Copy service files
COPY services/user-service ./services/user-service

# Install dependencies
WORKDIR /app/services/user-service
RUN npm install

EXPOSE 50052

ENV NODE_PATH=/app/services/user-service/node_modules
CMD ["node", "index.js"]
