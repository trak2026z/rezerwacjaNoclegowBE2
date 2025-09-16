# syntax=docker/dockerfile:1.7
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development \
    NODE_OPTIONS=--enable-source-maps

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=5 \
  CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Use the "start" script from package.json
CMD ["npm", "start"]
