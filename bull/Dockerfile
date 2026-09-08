FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/
RUN npm ci
COPY frontend frontend
RUN npm run build --workspace frontend

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/
RUN npm ci --omit=dev
COPY backend backend
COPY --from=build /app/frontend/dist frontend/dist
RUN mkdir -p backend/uploads
EXPOSE 4000
CMD ["npm", "run", "start", "--workspace", "backend"]
