FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy application source
COPY . .

# Compile TypeScript
RUN npm run build

# Expose port and run server
EXPOSE 5000
CMD ["npm", "start"]
