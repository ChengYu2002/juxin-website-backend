# Juxin Manufacturing Website – Backend (V1)

Backend for the Juxin Manufacturing independent website (V1).

This V1 focuses on powering a secure inquiry workflow: validating and de-duplicating form submissions, storing inquiries in MongoDB, sending notification emails, and providing admin-protected inquiry management APIs.

---

## Tech Stack

- **Node.js**
- **Express**
- **MongoDB Atlas + Mongoose**
- **Nodemailer (SMTP)**
- **ESLint + Prettier**
- **Rate limiting / anti-spam middleware**

---

## Features (V1)

### Inquiry workflow (Contact form backend)

- Validates inquiry payload (`name` / `email` / `message`)
- Captures client meta (IP, User-Agent, etc.)
- Optional IP geolocation enrichment (best-effort, non-blocking)
- Stores inquiry into MongoDB
- Sends notification email via SMTP (configurable)

### Anti-spam protections

- Request rate limiting for inquiry endpoint
- Dedupe protection (prevents repeated submissions in a short time window)
- Email sending throttling / debounce to reduce provider risk

### Admin-protected inquiry management

- `GET /api/inquiry` (list inquiries) protected by admin token
- `DELETE /api/inquiry/:id` (delete one inquiry) protected by admin token

### Robust middleware-based error handling

- Unknown endpoint handling (`404`)
- Centralized error handler with proper status codes:
    - `CastError` (malformatted ObjectId)
    - `ValidationError`
    - MongoDB duplicate key (`11000`)
    - `500` fallback
- Request logging middleware

---

## Environment Variables

Create a `.env` file in the project root:
