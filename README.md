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

## Project Structure

```
src/
├── config/
│   ├── dbConfig.js
│   └── cloudinary.js
├── controllers/
│   ├── auth.controller.js
│   ├── event.controller.js
│   ├── memory.controller.js
│   └── media.controller.js
├── middlewares/
│   ├── authMiddleware.js
│   ├── upload.js
│   ├── mediaUpload.js
│   └── errorHandler.js
├── models/
│   ├── user.model.js
│   ├── event.model.js
│   ├── memory.model.js
│   └── media.model.js
├── routes/
│   ├── auth.route.js
│   ├── event.routes.js
│   ├── memory.routes.js
│   └── media.routes.js
├── utils/
│   ├── apiError.js
│   ├── apiResponse.js
│   ├── asyncHandler.js
│   ├── generateToken.js
│   ├── sendEmail.js
│   └── cloudinary.js
├── app.js
└── server.js
```

---

## Environment Variables

Create a `.env` file in the root with the following:

```env
# Server
PORT=3000
BASE_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/memorytree

# JWT
JWT_ACCESS_KEY=your_access_token_secret
JWT_REFRESH_KEY=your_refresh_token_secret

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

---

## Getting Started

### 1. Clone and install dependencies
```bash
git clone <repo-url>
cd memorytree-backend
npm install
```

### 2. Set up the database
Run the schema located in `db/schema.sql` against your PostgreSQL instance:
```bash
psql -U postgres -d memorytree -f db/schema.sql
```

### 3. Configure environment variables
Copy `.env.example` to `.env` and fill in your values (see above).

### 4. Run the server
```bash
npm run dev
```
Server starts on `http://localhost:3000` by default.

---

## API Overview

Base URL: `/api/v1`

| Resource | Base Path | Auth Required |
|---|---|---|
| Auth | `/auth` | Mixed (register/login public, logout protected) |
| Events | `/events` | Yes |
| Memory Entries | `/events/:eventId/memories`, `/memories/:id` | Yes |
| Media | `/memories/:memoryId/media`, `/media/:id` | Yes |

Full endpoint documentation with request/response examples is available in [`docs/API.md`](./docs/API.md) *(or link to your API documentation tool of choice — Postman collection, etc.)*

---

## Security Notes

- Passwords are hashed with bcrypt (10 salt rounds) — never stored in plaintext.
- Refresh tokens are stored in the database and invalidated on logout.
- All resource queries are scoped to the authenticated user — no resource can be accessed by guessing an ID alone.
- File uploads are restricted by type (images only) and size, validated both at the multer layer and rejected by Cloudinary if spoofed.

---

## Status

This is a personal learning project built incrementally, phase by phase:

- [x] Phase 1 — Authentication
- [x] Phase 2 — Events
- [x] Phase 3 — Memory Entries & Media
- [ ] Phase 4 — Profile & Polish
- [ ] Phase 5 — Multi-user support (architecturally anticipated, not yet implemented)

---

## License

This is a personal project, currently unlicensed for public use.