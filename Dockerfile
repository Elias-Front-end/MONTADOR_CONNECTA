# Build stage
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build Arguments for Vite (must be passed during build)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Set as environment variables for the build process
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Build frontend
RUN npm run build

# Build backend
# We use tsc directly with the server config
RUN npx tsc -p tsconfig.server.json

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Copy frontend build
COPY --from=builder /app/dist ./dist

# Copy backend build
COPY --from=builder /app/dist-server ./dist-server

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

ENV PORT=3000
EXPOSE 3000

CMD ["./start.sh"]
