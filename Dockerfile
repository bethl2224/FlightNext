# Build stage
FROM node:22 AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build application
RUN npm run build

# Production stage
FROM node:22 AS production
WORKDIR /app


# Copy built assets and necessary files from the builder stage
COPY --from=builder /app .
RUN rm -rf /app/node_modules

#move the fake date scripts are executable
RUN mv /app/utils/fake-data /app/fake-data

# make sure the fake-data scripts are executable
RUN chmod +x /app/fake-data/*.sh

# Install production dependencies
RUN npm install --only=production
# Expose the port
EXPOSE 3000

# COPY .env .

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=mysecurepassword
ENV POSTGRES_DB=appDB
ENV DATABASE_URL=postgresql://postgres:mysecurepassword@db:5432/appDB


# Create start script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'npx prisma migrate deploy' >> /app/start.sh && \
    echo 'npm run start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]