FROM node:18-alpine

WORKDIR /app

# Copy proto files for gRPC
COPY proto ./proto

# Copy gateway files
COPY gateway ./gateway

# Install dependencies
WORKDIR /app/gateway
RUN npm install

EXPOSE 3000

CMD ["node", "index.js"]
