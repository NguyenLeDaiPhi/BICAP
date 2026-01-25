FROM node:18

WORKDIR /app

<<<<<<< HEAD
WORKDIR /user/src/app

COPY package*.json ./

RUN rm -f package-lock.json
RUN npm install

COPY . . 

EXPOSE 3002

CMD ["npm", "start"]
=======
# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Expose port
EXPOSE 3002

# Start server
CMD ["node", "src/authentication.js"]
>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d


