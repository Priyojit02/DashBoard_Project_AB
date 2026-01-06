# SAP Support Ticket Dashboard - Backend

A super advanced Python FastAPI backend for the SAP Support Ticket Dashboard.

## Features

- 🔐 **Azure AD SSO Authentication** - Secure authentication with Microsoft Azure AD
- 📧 **Email-to-Ticket Automation** - Fetch emails via IMAP and auto-create tickets
- 🤖 **LLM-Powered Classification** - OpenAI GPT-4 classifies SAP modules (MM, SD, FICO, etc.)
- 📊 **Analytics Dashboard** - Real-time statistics and reporting
- 👥 **Admin Management** - User and admin management with audit logging
- 🗄️ **PostgreSQL/Supabase** - Robust database with async SQLAlchemy

## Project Structure

```
backend/
├── app/
│   ├── controllers/      # Business logic handlers
│   │   ├── auth_controller.py
│   │   ├── ticket_controller.py
│   │   ├── user_controller.py
│   │   ├── admin_controller.py
│   │   ├── analytics_controller.py
│   │   └── email_controller.py
│   │
│   ├── core/             # Core configuration
│   │   ├── config.py     # Settings management
│   │   ├── database.py   # Database connection
│   │   └── scheduler.py  # Background task scheduler
│   │
│   ├── middleware/       # Request/Response middleware
│   │   ├── auth_middleware.py
│   │   ├── cors_middleware.py
│   │   ├── error_handler.py
│   │   └── logging_middleware.py
│   │
│   ├── models/           # SQLAlchemy ORM models
│   │   └── models.py
│   │
│   ├── repositories/     # Data access layer
│   │   ├── base_repository.py
│   │   ├── user_repository.py
│   │   ├── ticket_repository.py
│   │   └── email_repository.py
│   │
│   ├── routes/           # API route definitions
│   │   ├── auth_routes.py
│   │   ├── ticket_routes.py
│   │   ├── user_routes.py
│   │   ├── admin_routes.py
│   │   ├── analytics_routes.py
│   │   └── email_routes.py
│   │
│   ├── schemas/          # Pydantic request/response schemas
│   │   └── schemas.py
│   │
│   ├── services/         # Business services
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── ticket_service.py
│   │   ├── admin_service.py
│   │   ├── analytics_service.py
│   │   ├── email_service.py
│   │   ├── llm_service.py
│   │   └── email_processor.py
│   │
│   └── main.py           # FastAPI application entry point
│
├── database/
│   ├── schema.sql        # Supabase SQL schema
│   └── seed.sql          # Sample seed data
│
├── .env                  # Environment configuration
├── .env.example          # Environment template
├── requirements.txt      # Python dependencies
├── run.py                # Run script
└── README.md             # This file
```

## Installation

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
copy .env.example .env
```

Required configurations:
- **Database**: Update `DATABASE_URL` with your Supabase connection string
- **Azure AD**: Add your Azure AD client ID and tenant ID
- **OpenAI**: Add your OpenAI API key for LLM features
- **Email**: Configure IMAP settings for email fetching

### 4. Set Up Database

Run the SQL schema in your Supabase dashboard:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `database/schema.sql`
3. Run the SQL
4. (Optional) Run `database/seed.sql` for sample data

### 5. Run the Server

```bash
python run.py
```

Or with uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

When running in debug mode, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login with Azure AD token
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Tickets
- `GET /api/v1/tickets` - List tickets (with filters)
- `POST /api/v1/tickets` - Create ticket
- `GET /api/v1/tickets/{id}` - Get ticket details
- `PATCH /api/v1/tickets/{id}` - Update ticket
- `DELETE /api/v1/tickets/{id}` - Delete ticket (admin)
- `POST /api/v1/tickets/{id}/comments` - Add comment

### Users
- `GET /api/v1/users` - List users
- `GET /api/v1/users/search` - Search users
- `PATCH /api/v1/users/profile` - Update profile

### Admin
- `GET /api/v1/admin/users` - List all users (admin)
- `GET /api/v1/admin/admins` - List admins
- `POST /api/v1/admin/admins/add` - Add admin
- `POST /api/v1/admin/admins/remove` - Remove admin
- `GET /api/v1/admin/audit-logs` - View audit logs

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard stats
- `GET /api/v1/analytics/full` - Full analytics
- `GET /api/v1/analytics/categories` - Category breakdown

### Email Processing
- `POST /api/v1/emails/fetch` - Trigger email fetch (admin)
- `GET /api/v1/emails/stats` - Email statistics
- `POST /api/v1/emails/{id}/reprocess` - Reprocess email

## Architecture

### Layered Architecture

1. **Routes** → Define API endpoints and request validation
2. **Controllers** → Handle business logic and orchestration
3. **Services** → Implement core business operations
4. **Repositories** → Abstract database operations
5. **Models** → Define database schema

### Email-to-Ticket Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   IMAP      │ → │   Email     │ → │    LLM      │ → │   Ticket    │
│   Server    │    │   Service   │    │   Service   │    │   Service   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       │            Fetch Emails      Classify SAP       Create Ticket
       │                  │             Module                 │
       └──────────────────┴──────────────────┴─────────────────┘
                              Email Processor
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | Supabase PostgreSQL URL | Yes |
| AZURE_CLIENT_ID | Azure AD Client ID | Yes |
| AZURE_TENANT_ID | Azure AD Tenant ID | Yes |
| JWT_SECRET_KEY | JWT signing key | Yes |
| OPENAI_API_KEY | OpenAI API key | For LLM |
| EMAIL_ADDRESS | IMAP email address | For email |
| EMAIL_PASSWORD | IMAP password | For email |

## Frontend Integration

The frontend (Next.js) should:

1. **Login**: Get Azure AD token → Send to `/api/v1/auth/login` → Store JWT
2. **API Calls**: Include JWT in `Authorization: Bearer <token>` header
3. **Refresh**: Call `/api/v1/auth/refresh` before token expires

Example API service:

```typescript
const API_BASE = 'http://localhost:8000/api/v1';

async function fetchTickets() {
  const response = await fetch(`${API_BASE}/tickets`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.json();
}
```

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black app/
isort app/
```

### Type Checking
```bash
mypy app/
```

## Production Deployment

1. Set `DEBUG=False` in `.env`
2. Configure proper database connection pooling
3. Set up Redis for caching (optional)
4. Use gunicorn with multiple workers:

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## License

MIT License
