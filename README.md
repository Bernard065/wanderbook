# WanderBook

WanderBook is a digital travel book designed to help travelers capture memories, organize trips, and revisit their journeys over time. The product vision spans dashboard analytics, maps, journals, galleries, expenses, bucket lists, achievements, and social sharing.

## Current status

The repository already contains a strong foundation for the product:

- Web app with authenticated routes and a working app shell
- Dashboard, places, trips, timeline, journal, gallery, map, bucket list, achievements, friends, and documents pages
- Backend API routes for core travel-book entities
- Database models for users, places, trips, journal entries, expenses, photos, documents, friendships, trip shares, and flights

The remaining work is mostly about polishing the experience and closing the gap between the current MVP and the broader vision.

## Architecture and planning docs

- [docs/architecture-overview.md](docs/architecture-overview.md)
- [docs/implementation-roadmap.md](docs/implementation-roadmap.md)

## Running the workspace

### Web app

```sh
npx nx run @org/web:dev
```

### API

```sh
npx nx run api:serve
```

### Tests

```sh
npx nx run @org/web:test
npx nx run api:test
```

## Suggested implementation order

1. UX polish and consistency
2. Rich media and memory capture workflows
3. Better map and timeline exploration
4. Social collaboration and sharing
5. Analytics, recommendations, and operational hardening

## Notes

This repository is already structured well enough to support an incremental build strategy. The best path forward is to implement the missing product layers in phases rather than attempting a full rewrite.
