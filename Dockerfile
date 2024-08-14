# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /src

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Build the frontend and backend
RUN npm run build

# Expose the port the app runs on
EXPOSE 8000

# Command to run the backend server
CMD ["npm", "run", "backend"]
