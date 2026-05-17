FROM node:18-alpine

WORKDIR /app

# Copy proto files (shared by all services)
COPY backend/proto ./proto

# Copy shared backend files
COPY backend/firebase.js ./firebase.js
COPY backend/package.json ./package.json

# Copy gateway
COPY backend/gateway ./gateway

# Copy all microservices
COPY backend/services ./services

# Copy startup script
COPY backend/start-microservices.js ./start-microservices.js

# Install root dependencies
RUN npm install

# Install gateway dependencies
RUN cd gateway && npm install

# Install each service's dependencies
RUN cd services/auth-service && npm install
RUN cd services/user-service && npm install
RUN cd services/project-service && npm install
RUN cd services/asset-service && npm install
RUN cd services/notification-service && npm install

EXPOSE 3000

CMD ["node", "start-microservices.js"]
