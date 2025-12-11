# Use Node.js 20-alpine for a small, secure base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies needed for native modules and Prisma
RUN apk add --no-cache libc6-compat openssl

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Copy environment variables for build time (and runtime if baking in)
COPY .env .env

# Generate Prisma Client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
