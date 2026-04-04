FROM node:18-alpine

WORKDIR /app

# Copy shared files
COPY serviceAccountKey.json ./serviceAccountKey.json
COPY firebase.js ./firebase.js
COPY proto ./proto
COPY services/firebase.js ./services/firebase.js

# Copy service files
COPY services/notification-service ./services/notification-service

# Install dependencies
WORKDIR /app/services/notification-service
RUN npm install

EXPOSE 50055

CMD ["node", "index.js"]
