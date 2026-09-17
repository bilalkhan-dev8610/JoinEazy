FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the source
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/server.js"]
