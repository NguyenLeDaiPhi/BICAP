# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory for the entire application
WORKDIR /app
# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install application dependencies
RUN rm -f package-lock.json
<<<<<<< HEAD
RUN npm install
=======
RUN npm install --include=dev
>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d

# Copy all application source code
COPY . .

# Expose the port the app runs on (as requested)
EXPOSE 3001

# Command to run the application, pointing to the correct entrypoint
CMD [ "npm", "start" ]
