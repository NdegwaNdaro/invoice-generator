# AfriInvoice

A full-stack invoice management system for African freelancers and businesses. It supports customer records, automatic invoice calculations, multi-currency billing, configurable tax/VAT, business branding, PDF generation, printing, email delivery, payment status tracking, and dashboard reporting.

## Stack

- React 18 + Vite
- Node.js + Express
- MySQL 8 + Sequelize
- JWT authentication and bcrypt password hashing
- PDFKit for invoice PDFs
- Nodemailer for email delivery
- Docker Compose for local MySQL

## Features

- Register, log in, and log out
- Dashboard totals for invoices, customers, pending payments, and paid revenue
- Add, edit, search, and delete customers
- Create, edit, search, filter, view, and delete invoices
- Dynamic line items with server-validated totals
- Automatic sequential invoice numbers
- Draft, sent, paid, and overdue statuses
- KES, USD, UGX, TZS, NGN, GHS, ZAR, EUR, and GBP
- Business logo, address, contact details, tax, and payment terms
- Branded PDF download and browser printing
- SMTP email delivery with the PDF attached
- Responsive interface for desktop, tablet, and mobile

## Local setup

Requirements:

- Node.js 22 or later
- npm 10 or later
- Docker with Docker Compose, or an existing MySQL 8 server

Start MySQL:

```bash
cp .env.example .env
docker compose up -d mysql
```

Configure the API:

```bash
cp backend/.env.example backend/.env
```

Set a long random `JWT_SECRET` in `backend/.env`. The default database values match `docker-compose.yml`.

Install dependencies and start both applications:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:4000`, and its health endpoint is `http://localhost:4000/api/health`.

Sequelize creates and updates the required tables on application startup. `database/schema.sql` is also supplied for teams that prefer to initialize the schema manually.

## Email configuration

Set these values in `backend/.env`:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=invoices@example.com
```

Without SMTP configuration, every feature except invoice email delivery remains available.

## Commands

```bash
npm run dev       # frontend and backend development servers
npm run build     # production frontend build
npm run lint      # lint frontend and backend
npm test --workspace backend
npm start         # production API and built frontend
```

## Production deployment

### Railway

1. Create a Railway project from this repository.
2. Add a MySQL service.
3. Map `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` to the MySQL service variables.
4. Set `JWT_SECRET`, `CLIENT_URL`, and optional SMTP variables.
5. Railway uses the included `Dockerfile` and `railway.toml`.

The production container serves the compiled React application and API together on `PORT`.

### Separate frontend and backend

The frontend can be deployed from `frontend/` to Vercel or Netlify. Set `VITE_API_URL` to the public backend URL ending in `/api`. Deploy the backend container to Render, Railway, Fly.io, or AWS and set `CLIENT_URL` to the frontend origin.

## API

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/dashboard
GET    /api/customers
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id
GET    /api/invoices
GET    /api/invoices/:id
POST   /api/invoices
PUT    /api/invoices/:id
DELETE /api/invoices/:id
PATCH  /api/invoices/:id/status
GET    /api/invoices/:id/pdf
POST   /api/invoices/:id/email
GET    /api/settings
PUT    /api/settings
POST   /api/settings/logo
```

All routes except registration, login, and health require a Bearer token.
