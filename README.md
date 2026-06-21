# MemoryTree — Backend

MemoryTree is a single-user personal life memory application that organizes life into hierarchical chapters. Users create **Events** (life chapters like relationships, career milestones, or travel), attach **Memory Entries** (specific moments within that chapter), and upload **Media** (photos) to those memories.

This repository contains the backend API — built with Node.js, Express, and PostgreSQL — that powers the MemoryTree frontend.

---

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express
- **Database:** PostgreSQL
- **Authentication:** JWT (access + refresh tokens), bcrypt password hashing
- **File Storage:** Cloudinary
- **Email:** Nodemailer
- **File Uploads:** Multer (memory storage)

---

## Data Model

The application follows a 3-level hierarchy:

```
User
 └── Event (life chapter — Travel, Career, Relationship, etc.)
      └── Memory Entry (a specific moment)
           └── Media (photos attached to that moment)
```

### Tables
- **users** — accounts, auth credentials, email verification, refresh tokens
- **events** — life chapters, scoped to a user
- **memory_entries** — individual moments within an event, supports nested entries via `parent_id`
- **media** — photos attached to a memory entry, stored on Cloudinary

All tables use UUID primary keys, soft deletes (`deleted_at`) where applicable, and `TIMESTAMPTZ` for all timestamps.

---

## Features

### Authentication
- Registration with optional avatar upload
- Email verification flow (token + 24hr expiry)
- Resend verification email
- Login with access token (15min) + refresh token (7 days, httpOnly cookie)
- Token refresh endpoint
- Logout (invalidates stored refresh token)

### Events
- Full CRUD with soft delete
- Optional cover image upload to Cloudinary
- Scoped to the logged-in user

### Memory Entries
- Full CRUD with soft delete
- Nested under a parent event
- Supports mood tracking, location tagging, and free-form notes
- Ownership verified by checking the parent event belongs to the requesting user

### Media
- Multiple image upload per memory entry (max 5 per request)
- Caption editing
- Hard delete (removes from both database and Cloudinary)
- Ownership verified by walking up the chain: media → memory entry → event → user

---

## Authentication Flow

```
Register → Verify Email → Login → Access Token (15min) + Refresh Token (7 days, cookie)
                                         │
                                         ├── Protected routes use Access Token
                                         └── Refresh Token used to get new Access Token when expired
```

- Access tokens are returned in the JSON response body and sent via `Authorization: Bearer <token>` header.
- Refresh tokens are set as `httpOnly` cookies and never exposed to client-side JavaScript.
- Logging out clears the stored refresh token in the database and clears the cookie.

---



## License

This is a personal project, currently unlicensed for public use.
