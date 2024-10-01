# Use Node.js LTS image
FROM node:20-alpine

# Install dependencies for bcrypt and other native modules
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install node modules, including Next.js and Prisma
RUN npm install

# Copy all project files to the container
COPY . .

# Run Prisma generate (after copying all files)
RUN npx prisma generate
# RUN npx prisma db push
# RUN npx prisma db seed

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "dev"]
