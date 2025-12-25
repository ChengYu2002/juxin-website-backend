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

```bash
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI="mongodb+srv://..."

# Admin token (protects GET / DELETE)
ADMIN_TOKEN="your-strong-admin-token"

# Email (SMTP)
SMTP_HOST="smtp.qq.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="xxx@qq.com"
SMTP_PASS="your_smtp_app_password"

MAIL_TO="sale01@cn-jason.net"
MAIL_FROM="sale01@cn-jason.net"

# Logging
LOG_LEVEL=info
Note: Never commit .env to Git.

## API Endpoints

### Public

#### `POST /api/inquiry`

Creates a new inquiry.

- Validates payload
- Applies anti-spam protections
- Stores inquiry in MongoDB
- Sends notification email

**Example request body:**

```json
{
  "name": "Buyer Name",
  "email": "buyer@example.com",
  "message": "Hello, I’m interested in JX-80SP..."
}

**Admin (Token Required)**
Admin token must be provided via HTTP header:
Authorization: Bearer <ADMIN_TOKEN>

GET /api/inquiry
Returns all inquiries (admin only)

DELETE /api/inquiry/:id
Deletes a specific inquiry by MongoDB ObjectId (admin only).

**Project Structure**
src/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
tests/
.env
.gitignore

**Getting Started**
***Install dependencies***
npm install

***Run (development)***
npm run dev

***Lint***
npm run lint
npm run lint:fix
