FROM node:24-alpine AS build

WORKDIR /repo

# Copy dependency manifests first for caching
COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY libs/types/package.json libs/types/

RUN npm ci

# Copy everything else needed to build
COPY apps/web apps/web
COPY libs/types libs/types

RUN npx nx build @org/web

# --- Serve stage ---
FROM nginx:alpine AS serve

COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
