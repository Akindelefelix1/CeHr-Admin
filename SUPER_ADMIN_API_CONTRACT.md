# Super-admin API contract

The existing NestJS backend currently authenticates organization/staff accounts and scopes organization routes to the authenticated organization. The admin frontend deliberately does not reuse those credentials for platform access.

Production API origin: `https://new-cehr-be-bkla.onrender.com`.

Configure `VITE_API_BASE_URL` after the backend exposes these protected endpoints. As verified on 13 October 2026, the deployed Swagger document does not yet include `/super-admin/*`, and the login and organization-list routes return HTTP 404.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/super-admin/auth/login` | Authenticate a platform administrator |
| GET | `/super-admin/organizations?limit=100` | List organizations with aggregate counts |
| GET | `/super-admin/organizations/:id` | Fetch full organization details and enabled modules |
| GET | `/super-admin/admins` | List platform administrators |
| POST | `/super-admin/admins` | Invite an administrator |
| PATCH | `/super-admin/admins/:id` | Change role and permissions |
| DELETE | `/super-admin/admins/:id` | Revoke administrator access |
| POST | `/super-admin/notifications/broadcast` | Send to all or selected organizations |

The login response contains `accessToken` and an `admin` object with `id`, `name`, `email`, `role`, and `permissions`.

The broadcast body contains `organizationIds` (`"all"` or an ID array), `subject`, `message`, and `channel`. The backend should call the existing `MailService.sendNotificationBroadcastEmail`, which renders `src/mail/templates/notification-broadcast.html`, and return `{ "sentCount": 10 }`.

All endpoints must validate a platform-admin JWT and enforce permission keys server-side; hiding frontend controls is not authorization.
