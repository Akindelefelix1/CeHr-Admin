# CeHR Control

Super-admin interface for managing the CeHR platform. Authentication, organizations, administrator access, and broadcasts use a typed API boundary. Without `VITE_API_BASE_URL`, the project runs in labelled UI-preview mode.

## Run locally

```bash
npm install
npm run dev
```

The app opens on `http://localhost:5174/login`. Requests to `/` redirect there, and all administration routes require a session.

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
- Super-admin login and protected routing
- Administrator roles and granular permissions
- Email/in-app broadcasts to all or selected organizations
- Live organization list and full organization details

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

Production builds use `VITE_API_BASE_URL=https://new-cehr-be-bkla.onrender.com`. The required server contract is documented in `SUPER_ADMIN_API_CONTRACT.md`; the matching NestJS module and database migration are implemented in `New-CeHR-BE`.
