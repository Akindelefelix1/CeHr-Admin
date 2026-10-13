# CeHR Control

Super-admin interface for managing the CeHR platform. This phase is intentionally UI-first: all data is typed mock data and the interaction boundaries are ready to be connected to the NestJS backend after approval.

## Run locally

```bash
npm install
npm run dev
```

The app opens on `http://localhost:5174/dashboard`. Requests to `/` redirect there.

## Production check

```bash
npm run build
```

## Included areas

- Command center with platform health and revenue trends
- Organization directory, filters, detail view, and creation flow
- Plans, billing cadence, pricing, and package editing
- Feature flags with staged rollout and organization coverage
- Billing, collections, and transaction monitoring
- Platform growth, plan mix, and module adoption analytics
- Support queue, audit logs, and platform settings

## Structure

```text
src/
  components/
    layout/        Application shell and navigation
    ui/            Reusable UI primitives
  data/            Typed review data (replace with API adapters later)
  pages/           Route-level feature screens
  styles/          Global tokens, components, and responsive rules
  types/           Shared domain contracts
```

## API integration plan

Add `src/services/http.ts` for the configured API client and one service module per feature area. Keep the page contracts aligned to `src/types`, map backend DTOs at the service boundary, and replace the exports in `src/data/mockData.ts` incrementally. Authentication, authorization, and mutations should be implemented only after the UI and admin permission model are approved.
