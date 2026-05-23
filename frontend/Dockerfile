# Build stage
FROM node:20 AS build

# Working directory
WORKDIR /app

# Copy package files
COPY package*.json .

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build Vite app
RUN npm run build

# Production server
FROM nginx:alpine

# Copy build files
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]