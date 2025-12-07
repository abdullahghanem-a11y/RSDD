# RSDD Meeting Management System - Flask REST API

A Flask REST API backend for the RSDD Meeting Management System, designed to serve a React SPA frontend. This system manages meetings, users, departments, and integrates with Google Calendar and email notifications.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication with refresh tokens
- 👥 **User Management** - Role-based access control (Admin, Dean, Director, Secretary)
- 📅 **Meeting Management** - Create, update, and manage meetings with attendees
- 📧 **Email Notifications** - Automated email notifications for meeting invitations and reminders
- 📆 **Google Calendar Integration** - Sync meetings with Google Calendar
- 📁 **File Uploads** - Profile pictures and meeting agendas (PDF)
- 🏢 **Department Management** - Faculties, Academic Departments, Administrative Departments
- 🔍 **Search & Filtering** - Advanced search and pagination for users and meetings
- ⚡ **Background Tasks** - Celery tasks for async email sending and cleanup

## Project Structure

```
rssd-backend/
├── app/
│   ├── __init__.py              # Flask app factory
│   ├── config.py                # Configuration classes
│   ├── extensions.py            # Extension instances
│   ├── models/                  # SQLAlchemy models
│   │   ├── user.py              # User and UserProfile models
│   │   ├── meeting.py           # Meeting model
│   │   └── department.py       # Department models
│   ├── api/                     # API blueprints
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── users.py             # User management endpoints
│   │   ├── profile.py           # Profile management endpoints
│   │   ├── meetings.py          # Meeting management endpoints
│   │   ├── departments.py       # Department listing endpoints
│   │   └── media.py             # Media serving endpoint
│   ├── services/                # Business logic layer
│   │   ├── file_service.py      # File upload handling
│   │   ├── meeting_service.py   # Meeting business logic
│   │   ├── email_service.py     # Email sending
│   │   └── calendar_service.py  # Google Calendar integration
│   ├── tasks/                  # Celery tasks
│   │   ├── celery_app.py        # Celery configuration
│   │   └── meeting_tasks.py     # Meeting-related tasks
│   └── utils/                   # Utility functions
│       ├── decorators.py        # Auth decorators
│       ├── response.py          # Response helpers
│       ├── exceptions.py        # Custom exceptions
│       ├── error_handlers.py    # Global error handlers
│       └── seed.py              # Database seeding
├── migrations/                  # Flask-Migrate migrations
├── media/                       # User-uploaded files
│   ├── agendas/
│   └── profile_pics/
├── .env                         # Environment variables
├── .env.example                 # Environment variables template
├── environment.yml              # Conda environment file
├── requirements.txt             # Python dependencies
├── run.py                       # Application entry point
├── celery_worker.py             # Celery worker entry point
├── RSDD_API.postman_collection.json  # Postman collection
└── POSTMAN_TESTING_GUIDE.md     # Postman testing guide
```

## Setup Instructions

### Prerequisites

- **Python 3.11+**
- **PostgreSQL** (12+)
- **Redis** (for Celery - optional but recommended)
- **Conda** or **Miniconda**

### 1. Create Conda Environment

**Option A: Using environment.yml (Recommended)**
```bash
# Create environment from file
conda env create -f environment.yml

# Activate the environment
conda activate rssd-backend
```

**Option B: Manual Setup**
```bash
# Create a new conda environment with Python 3.11
conda create -n rssd-backend python=3.14

# Activate the environment
conda activate rssd-backend

# Install dependencies
pip install -r requirements.txt
```

**Note:** Always activate the environment before working on the project:
```bash
conda activate rssd-backend
```

### 2. Environment Configuration

Create a `.env` file from the example:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

Then edit `.env` with your actual values. Key variables:

- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://user:password@localhost:5432/rsdd_database`)
- `SECRET_KEY`: Flask secret key (generate a random string)
- `JWT_SECRET_KEY`: JWT signing key (generate a random string)
- `JWT_ACCESS_TOKEN_EXPIRES`: Access token expiration (default: 3600 seconds)
- `JWT_REFRESH_TOKEN_EXPIRES`: Refresh token expiration (default: 2592000 seconds)
- `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`: Email configuration
- `CORS_ORIGINS`: Frontend URLs (comma-separated, e.g., `http://localhost:3000,http://localhost:5173`)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google Calendar API credentials (optional)
- `CELERY_BROKER_URL`: Redis URL for Celery (e.g., `redis://localhost:6379/0`)
- `CELERY_RESULT_BACKEND`: Redis URL for Celery results (e.g., `redis://localhost:6379/0`)

### 3. Database Setup

**Create PostgreSQL Database:**

Using pgAdmin:
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click "Databases" → Create → Database
4. Name: `rsdd_database`
5. Click Save

Or using psql:
```bash
psql -U postgres -c "CREATE DATABASE rsdd_database;"
```

**Run Migrations:**

```bash
# Make sure you're in the conda environment
conda activate rssd-backend

# Set Flask environment variables (Windows PowerShell)
$env:FLASK_APP = "run.py"
$env:FLASK_ENV = "development"

# Initialize migrations (only needed once)
flask db init

# Create initial migration
flask db migrate -m "Initial migration"

# Apply migrations
flask db upgrade
```

### 4. Seed Database (Optional)

Populate the database with sample data:

```bash
flask shell
```

Then in the Python shell:
```python
from app.utils.seed import seed_database
seed_database()
exit()
```

This creates:
- Sample titles, faculties, and departments
- Admin user: `admin` / `admin123`
- Dean user: `johndoe` / `dean123`

### 5. Run the Application

**Development Server:**
```bash
conda activate rssd-backend
$env:FLASK_APP = "run.py"
$env:FLASK_ENV = "development"
python run.py
```

The API will be available at `http://localhost:5000`

**With Celery (Background Tasks):**

Terminal 1 - Flask App:
```bash
conda activate rssd-backend
python run.py
```

Terminal 2 - Celery Worker:
```bash
conda activate rssd-backend
celery -A app.tasks.celery_app.celery worker --loglevel=info
```

Terminal 3 - Celery Beat (Scheduled Tasks):
```bash
conda activate rssd-backend
celery -A app.tasks.celery_app.celery beat --loglevel=info
```

## API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication (`/api/auth`)

- `POST /api/auth/login` - User login (returns access & refresh tokens)
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current authenticated user
- `POST /api/auth/logout` - Logout (client-side token removal)
- `PUT /api/auth/change-password` - Change user password

### Users (`/api/users`)

- `GET /api/users` - List users (pagination, search, filters)
  - Query params: `page`, `per_page`, `search`, `role`, `is_active`, `sort_by`, `order`
- `GET /api/users/<id>` - Get user by ID
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/<id>` - Update user
- `DELETE /api/users/<id>` - Delete user (Admin only)
- `GET /api/users/search?q=<query>` - Search users

### Profile (`/api/profile`)

- `GET /api/profile` - Get current user's profile
- `PUT /api/profile` - Update current user's profile
- `POST /api/profile/picture` - Upload profile picture
- `DELETE /api/profile/picture` - Delete profile picture

### Meetings (`/api/meetings`)

- `GET /api/meetings` - List meetings (pagination, filters)
  - Query params: `page`, `per_page`, `search`, `upcoming`, `past`
- `GET /api/meetings/<id>` - Get meeting by ID
- `POST /api/meetings` - Create meeting (Admin/Dean/Secretary)
  - Form data: `title`, `date`, `time`, `attendee_ids[]`, `agenda` (file, optional)
- `PUT /api/meetings/<id>` - Update meeting
- `DELETE /api/meetings/<id>` - Delete meeting
- `GET /api/meetings/upcoming?limit=<n>` - Get upcoming meetings
- `GET /api/meetings/past?limit=<n>` - Get past meetings
- `POST /api/meetings/<id>/attendees` - Add attendees to meeting
- `DELETE /api/meetings/<id>/attendees/<user_id>` - Remove attendee from meeting

### Departments (`/api/departments`)

- `GET /api/departments/faculties` - List all faculties
- `GET /api/departments/academic-departments?faculty_id=<id>` - List academic departments
- `GET /api/departments/admin-categories` - List admin categories
- `GET /api/departments/administrative-departments?category_id=<id>` - List administrative departments
- `GET /api/departments/titles` - List all titles

### Media (`/api/media`)

- `GET /api/media/<filepath>` - Serve uploaded files (requires authentication)

## Testing with Postman

A complete Postman collection is included: `RSDD_API.postman_collection.json`

**Import Instructions:**
1. Open Postman
2. Click **Import** → Select `RSDD_API.postman_collection.json`
3. See `POSTMAN_TESTING_GUIDE.md` for detailed testing instructions

**Quick Test:**
1. Start your Flask server
2. Run **Login** request (username: `admin`, password: `admin123`)
3. Token is automatically saved to collection variables
4. Test other endpoints - they'll use the saved token automatically

## Development

### Running in Development Mode

```bash
# Make sure conda environment is activated
conda activate rssd-backend

# Set environment variable (Windows PowerShell)
$env:FLASK_APP = "run.py"
$env:FLASK_ENV = "development"

# Set environment variable (Linux/Mac)
export FLASK_APP=run.py
export FLASK_ENV=development

# Run the application
python run.py
```

### Database Migrations

```bash
# Create a new migration
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade

# Rollback last migration
flask db downgrade

# Show migration history
flask db history
```

### Flask Shell

```bash
flask shell
```

Useful commands in shell:
```python
# Access models
User.query.all()
Meeting.query.filter_by(date=date.today()).all()

# Create test data
from app.utils.seed import seed_database
seed_database()
```

## User Roles

The system supports the following roles:

- **Admin** (`admin`): Full system access, can manage all users and meetings
- **Dean** (`dean`): Can create and manage meetings, view all users
- **Director** (`director`): Can view meetings and users
- **Secretary** (`secretary`): Can create and manage meetings, view users

## Technology Stack

- **Flask 3.0.0**: Web framework
- **SQLAlchemy 2.0.23**: ORM with type hints
- **Flask-JWT-Extended 4.6.0**: JWT authentication
- **Flask-Migrate 4.0.5**: Database migrations (Alembic)
- **Flask-CORS 4.0.0**: CORS support
- **Flask-Mail 0.10.0**: Email sending
- **Marshmallow 3.20.1**: Request/response validation
- **Celery 5.3.4**: Background tasks
- **Redis**: Celery broker and result backend
- **PostgreSQL**: Database
- **Argon2**: Password hashing
- **Pillow**: Image processing
- **PyPDF2**: PDF handling
- **Google API Python Client**: Google Calendar integration

## Conda Environment Management

### Useful Conda Commands

```bash
# Activate environment
conda activate rssd-backend

# Deactivate environment
conda deactivate

# Update environment from environment.yml
conda env update -f environment.yml --prune

# Remove environment
conda env remove -n rssd-backend

# List all environments
conda env list

# Export current environment
conda env export > environment.yml
```

## Production Deployment

### Using Gunicorn

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

### Environment Variables for Production

Make sure to set:
- `FLASK_ENV=production`
- Strong `SECRET_KEY` and `JWT_SECRET_KEY`
- Proper `DATABASE_URL` for production database
- `CORS_ORIGINS` with your frontend domain(s)
- Email credentials for notifications

## Troubleshooting

### Common Issues

**"Subject must be a string" error:**
- This was fixed in the code. Make sure you've restarted the Flask server after pulling the latest code.
- Re-login to get a fresh token.

**Database connection errors:**
- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database exists: `psql -U postgres -l`

**JWT token errors:**
- Make sure `JWT_SECRET_KEY` is set in `.env`
- Tokens expire after 1 hour (access) or 30 days (refresh)
- Use the refresh endpoint to get a new access token

**Email not sending:**
- Check `MAIL_*` settings in `.env`
- For Gmail, use an App Password instead of your regular password
- Test email configuration in Flask shell

