# Super-admin API contract and wiring

The frontend uses a dedicated platform-admin session and calls the NestJS `/super-admin/*` controller. It does not reuse organization or staff credentials. The controller and service are implemented in the sibling `New-CeHR-BE` repository (`src/super-admin`); organization-scoped administration endpoints enforce the required super-admin permissions in the backend.

## Environments

| Frontend branch/build | Frontend hosting | API origin |
| --- | --- | --- |
| `staging` (`--mode staging`) | Render static site (`cehr-super-admin`) | `https://new-cehr-be-bkla.onrender.com` |
| `main` (`npm run build`, production mode) | Contabo | `https://cehr-api.vickybestelecom.com` |
| Local development | Vite | `http://localhost:8141` (or unset `VITE_API_BASE_URL` for preview mode) |

Origins are embedded at build time. Render's service manifest selects the staging mode; a standard Vite production build selects `.env.production` for Contabo.

## Implemented endpoint groups

All protected routes below use the platform-admin bearer token. Route definitions are in `New-CeHR-BE/src/super-admin/super-admin.controller.ts`.

| Methods | Endpoints | Frontend use |
| --- | --- | --- |
| `POST` | `/super-admin/auth/login`, `/auth/change-password` | Login and forced password change |
| `GET`, `POST`, `PATCH`, `DELETE` | `/organizations`, `/organizations/:id`, `/organizations/:id/status`, `/organizations/:id/archive/*`, `/organizations/:id/subscription`, `/organizations/:id/trial` | Directory, details, creation, suspension, archive, subscription and trial controls |
| `GET`, `POST`, `PATCH`, `DELETE` | `/admins`, `/admins/:id` | Admin access management |
| `GET` | `/audit-logs`, `/billing`, `/analytics`, `/dashboard`, `/plans`, `/features` | Platform reporting and configuration |
| `POST`, `PATCH` | `/plans`, `/plans/:id`, `/features`, `/features/:id` | Plan and feature management |
| `GET`, `PUT`, `DELETE` | `/features/:id/organizations`, `/features/:id/organizations/:organizationId` | Per-organization feature overrides |
| `POST` | `/notifications/broadcast` | Organization broadcasts |
| `GET`, `POST`, `PATCH` | `/support/tickets*`, `/support/analytics` | Support queue, replies, notes, assignment and ticket actions |

The broadcast body contains `organizationIds` (`"all"` or an ID array), `subject`, `message`, and `channel`. The backend sends email via its existing mail service and returns a sent count.

## Deployment requirements

- Set `SUPER_ADMIN_JWT_SECRET`, `SUPER_ADMIN_BOOTSTRAP_EMAIL`, and `SUPER_ADMIN_BOOTSTRAP_PASSWORD` on the backend. Keep credentials in the host's secret store.
- Allow the deployed superadmin origin in backend `CORS_ORIGIN`.
- Apply the backend Prisma migrations when deploying the BE.
- The Render staging Swagger document was checked on 28 October 2026 and exposes 31 `/super-admin/*` routes, including login, organizations, dashboard, audit logs, and support. Authenticated login and protected data calls still require valid bootstrap credentials and should be checked after deployment.
