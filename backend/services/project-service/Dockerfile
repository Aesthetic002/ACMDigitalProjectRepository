FROM node:18-alpine

WORKDIR /app

# Copy shared files
COPY serviceAccountKey.json ./serviceAccountKey.json
COPY firebase.js ./firebase.js
COPY proto ./proto
COPY services/firebase.js ./services/firebase.js

# Copy service files
COPY services/project-service ./services/project-service

# Install dependencies
WORKDIR /app/services/project-service
RUN npm install

EXPOSE 50053

ENV NODE_PATH=/app/services/project-service/node_modules
CMD ["node", "index.js"]
