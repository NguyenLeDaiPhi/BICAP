FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN rm -f package-lock.json
RUN npm install

# Copy all files
COPY . .

# Fix permissions for node_modules binaries (after COPY to ensure they persist)
RUN chmod -R +x node_modules/.bin || true

# Expose port
EXPOSE 3002

# Start server
CMD ["npm", "start"]
