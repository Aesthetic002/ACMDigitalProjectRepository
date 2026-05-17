FROM node:18-alpine

WORKDIR /app

# Copy proto files (shared by all services)
COPY proto ./proto

# Copy shared backend files
COPY firebase.js ./firebase.js
COPY package.json ./package.json

# Copy gateway
COPY gateway ./gateway

# Copy all microservices
COPY services ./services

# Copy startup script
COPY start-microservices.js ./start-microservices.js

# Install root dependencies (for start-microservices.js)
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
