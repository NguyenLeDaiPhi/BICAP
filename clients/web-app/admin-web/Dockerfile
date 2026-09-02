# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install || echo "No dependencies to install"

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Default command
CMD ["npm", "start"]
