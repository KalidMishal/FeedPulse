FROM node:18-alpine

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm install

# Copy application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port and start
EXPOSE 3000
CMD ["npm", "start"]
