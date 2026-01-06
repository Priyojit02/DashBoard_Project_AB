# SAP Support Ticket Dashboard - Project Summary

## Project Structure

```
Dash_Board_Project/
├── frontend-up/              # Next.js Frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # React components
│   │   ├── data/             # Mock data
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Services and utilities
│   │   │   ├── api-client.ts      # HTTP client
│   │   │   ├── api-config.ts      # API endpoints config
│   │   │   ├── backend-api.ts     # Backend API service
│   │   │   └── ...
│   │   └── types/            # TypeScript types
│   └── .env.local            # Environment config
│
└── backend/                   # FastAPI Backend
    ├── app/
    │   ├── controllers/       # Business logic
    │   ├── core/              # Config, DB, Scheduler
    │   ├── middleware/        # Auth, CORS, Error handling
    │   ├── models/            # SQLAlchemy models
    │   ├── repositories/      # Data access layer
    │   ├── routes/            # API endpoints
    │   ├── schemas/           # Pydantic schemas
    │   ├── services/          # Business services
    │   └── main.py            # FastAPI app
    ├── database/
    │   ├── schema.sql         # Supabase schema
    │   └── seed.sql           # Sample data
    └── requirements.txt       # Python dependencies
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Configure .env
# - Add Supabase DATABASE_URL
# - Add OpenAI API key
# - Configure email settings

python run.py
```

Backend runs at: http://localhost:8000
API Docs: http://localhost:8000/docs

### 2. Database Setup

Run in Supabase SQL Editor:
1. Execute `database/schema.sql`
2. (Optional) Execute `database/seed.sql`

### 3. Frontend Setup

```bash
cd frontend-up
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/login | Azure AD login |
| GET | /api/v1/tickets | List tickets |
| POST | /api/v1/tickets | Create ticket |
| GET | /api/v1/tickets/{id} | Get ticket |
| PATCH | /api/v1/tickets/{id} | Update ticket |
| GET | /api/v1/analytics/dashboard | Dashboard stats |
| POST | /api/v1/emails/fetch | Fetch & process emails |

## Key Features

### Email-to-Ticket Pipeline
1. IMAP fetches emails daily (configurable)
2. LLM (OpenAI GPT-4) analyzes content
3. Classifies SAP module (MM, SD, FICO, etc.)
4. Auto-creates tickets with priority

### SAP Module Categories
- **MM** - Material Management
- **SD** - Sales & Distribution
- **FICO** - Finance & Controlling
- **PP** - Production Planning
- **HCM** - Human Capital Management
- **PM** - Plant Maintenance
- **QM** - Quality Management
- **WM** - Warehouse Management
- **PS** - Project System
- **BW** - Business Warehouse
- **ABAP** - Development
- **BASIS** - Admin

### Authentication Flow
1. Frontend: Azure AD SSO via MSAL
2. Frontend sends Azure token to backend
3. Backend verifies with Microsoft Graph
4. Backend returns JWT token
5. Frontend uses JWT for all API calls

## Switching from Mock to Real Data

### Frontend
Set in `.env.local`:
```
NEXT_PUBLIC_USE_MOCK_DATA=false
```

Then update service files to use `backend-api.ts` instead of mock data.

### Backend
Set in `.env`:
```
DEBUG=false
DATABASE_URL=your_supabase_url
OPENAI_API_KEY=your_key
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
AZURE_CLIENT_ID=your_client_id
AZURE_TENANT_ID=your_tenant_id
JWT_SECRET_KEY=your_secret
OPENAI_API_KEY=your_key
EMAIL_ADDRESS=your@email.com
EMAIL_PASSWORD=your_password
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_AZURE_CLIENT_ID=your_client_id
NEXT_PUBLIC_AZURE_TENANT_ID=your_tenant_id
NEXT_PUBLIC_USE_MOCK_DATA=false
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Pages   │  │Components│  │  Hooks   │  │ Services │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       └─────────────┴─────────────┴─────────────┘          │
│                            │                                │
│                      API Client                             │
└────────────────────────────┼────────────────────────────────┘
                             │ HTTP/JWT
┌────────────────────────────┼────────────────────────────────┐
│                      BACKEND (FastAPI)                       │
│                            │                                │
│  ┌──────────┐        ┌─────┴─────┐        ┌──────────┐     │
│  │  Routes  │───────>│Controllers│───────>│ Services │     │
│  └──────────┘        └───────────┘        └────┬─────┘     │
│                                                 │           │
│  ┌──────────┐        ┌───────────┐        ┌────┴─────┐     │
│  │Middleware│        │  Schemas  │        │Repository│     │
│  └──────────┘        └───────────┘        └────┬─────┘     │
│                                                 │           │
│                                           ┌────┴─────┐     │
│                                           │  Models  │     │
│                                           └────┬─────┘     │
└────────────────────────────────────────────────┼───────────┘
                                                 │
┌────────────────────────────────────────────────┼───────────┐
│                    DATABASE (Supabase)          │           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │           │
│  │  Users   │  │  Tickets │  │  Emails  │◄─────┘           │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, MSAL
- **Backend**: FastAPI, SQLAlchemy (async), Pydantic, JWT
- **Database**: PostgreSQL (Supabase)
- **LLM**: OpenAI GPT-4
- **Email**: IMAP (imap-tools)
- **Auth**: Azure AD SSO
