# Use a Debian-based Node.js image instead of Alpine
FROM node:18-bullseye

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first (to cache dependencies)
COPY package*.json ./

# Remove existing node_modules to avoid architecture conflicts
RUN rm -rf node_modules

# Install dependencies inside the container
RUN npm install --build-from-source

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 6535

# Start the application
CMD ["npm", "run", "start:prod"]
