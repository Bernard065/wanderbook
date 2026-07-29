FROM node:24-alpine AS build

WORKDIR /repo

# Copy dependency manifests
COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY libs/types/package.json libs/types/

# Install dependencies
RUN npm ci

# Copy the rest of the repository
COPY . .

# Build the web application
RUN npx nx build @org/web

# ----------------------------
# Production image
# ----------------------------
FROM nginx:alpine

COPY --from=build /repo/apps/web/dist /usr/share/nginx/html

# Copy nginx configuration if it exists
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
