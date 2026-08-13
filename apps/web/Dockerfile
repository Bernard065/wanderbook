# ============================
# Build stage
# ============================
FROM node:24-alpine AS build

WORKDIR /repo

# Build argument supplied by Render
ARG VITE_API_URL

# Make it available to Vite
ENV VITE_API_URL=$VITE_API_URL

# Copy dependency manifests
COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY libs/types/package.json libs/types/

# Install dependencies
RUN npm ci

# Copy repository
COPY . .

# Build frontend
RUN npx nx build web

# ============================
# Production stage
# ============================
FROM nginx:alpine

COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
