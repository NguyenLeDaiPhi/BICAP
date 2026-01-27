FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN rm -f package-lock.json
RUN npm install

# Copy all files
COPY . .

# Expose port
EXPOSE 3002

# Start server
CMD ["npm", "start"]
