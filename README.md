# CeHR Control

Super-admin interface for managing the CeHR platform. Authentication, organizations, administrator access, billing, support, feature flags, and broadcasts use a typed API boundary. Without `VITE_API_BASE_URL`, the project runs in labelled UI-preview mode.

## API environments and deployment

The API origin is selected at build time:

- `staging` deploys to Render and reads `.env.staging`, which points to `https://new-cehr-be-bkla.onrender.com`.
- `main` production builds use `.env.production`, which points to the Contabo API at `https://cehr-api.vickybestelecom.com`.
- Local development reads `.env` or can use `.env.example` as a starting point. The local backend default is `http://localhost:8141`.

Render's [render.yaml](render.yaml) deploys only the `staging` branch as a static site and rewrites application routes to `index.html`. Production builds for Contabo use `npm ci && npm run build`; the Vite production mode selects the Contabo API. Environment variables configured by the hosting service take precedence over the committed env files.

Environment values are embedded into the built frontend. Rebuild and redeploy after changing the API origin. The backend endpoint contract and wiring status are documented in [SUPER_ADMIN_API_CONTRACT.md](SUPER_ADMIN_API_CONTRACT.md).

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

## API integration

The typed API adapter is in `src/services/superAdmin.ts`, with authentication and request handling in `src/services/api.ts`. It is wired to the super-admin controller in the sibling `New-CeHR-BE` repository. The API contract lists the live endpoint groups and notes remaining backend-specific verification.
