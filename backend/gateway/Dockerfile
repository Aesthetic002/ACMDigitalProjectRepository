FROM node:18-alpine

WORKDIR /app

# Copy proto files for gRPC
COPY proto ./proto

# Copy shared files
COPY serviceAccountKey.json ./serviceAccountKey.json
COPY firebase.js ./firebase.js
COPY services ./services
COPY middleware ./middleware
COPY utils ./utils

# Copy gateway files
COPY gateway ./gateway

# Install dependencies
WORKDIR /app/gateway
RUN npm install

EXPOSE 3000

ENV NODE_PATH=/app/gateway/node_modules
CMD ["node", "index.js"]
