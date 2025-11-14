FROM node:24-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set work dir for relative paths
WORKDIR /app

# Copy code from context to image
COPY . .
