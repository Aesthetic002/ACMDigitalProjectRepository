FROM node:18-alpine

WORKDIR /app

# Copy shared files
COPY serviceAccountKey.json ./serviceAccountKey.json
COPY firebase.js ./firebase.js
COPY proto ./proto
COPY services/firebase.js ./services/firebase.js

# Copy service files
COPY services/asset-service ./services/asset-service

# Install dependencies
WORKDIR /app/services/asset-service
RUN npm install

EXPOSE 50054

CMD ["node", "index.js"]
