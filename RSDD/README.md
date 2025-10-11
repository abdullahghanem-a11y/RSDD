# Reminder System for Deans & Directors

## Overview
This system ensures quarterly meetings for deans and directors are scheduled and never forgotten. It provides automated reminders, agenda attachments, attendance reports, and a simple dashboard for past and upcoming meetings.

---

## Features
- Schedule quarterly meetings (every 3 months) or custom meetings.
- Automated reminders sent 1 month, 1 week, and 1 day before meetings.
- Attach agenda/minutes to meetings.
- Dashboard for past and upcoming meetings.
- Automatically generate attendance reports.
- Google Calendar integration to sync meetings.

---

## System Architecture
- **Backend:** Django with Celery for scheduled tasks.
- **Frontend:** Minimal dashboard using templates and static files.
- **Database:** PostgreSQL (or SQLite for development).
- **Scheduler:** Cron jobs via Celery.
- **Integration:** Google Calendar API for event syncing.

---

## Project Structure

reminder_system/
│
├── frontend/
│ ├── templates/ # HTML templates for dashboard and scheduling
│ └── static/ # CSS and JS files
│
├── backend/
│ ├── manage.py
│ ├── reminder_system/ # Django project settings
│ └── apps/
│ └── meeting/ # App handling meeting, tasks, and models
│ ├── models.py
│ ├── views.py
│ ├── urls.py
│ ├── tasks.py
│ └── google_calendar.py
│
└── database/ # PostgreSQL or SQLite database file


---

## Installation
1. Clone the repository:
```bash
git clone <repo_url>
cd reminder_system/backend

#Create a virtual environment and install dependencies:
python -m venv venv
source venv/bin/activate   # Linux/macOS
venv\Scripts\activate      # Windows
pip install -r requirements.txt

#Configure your database in settings.py

#Apply migrations:
python manage.py makemigrations
python manage.py migrate

#Create a superuser (admin):
python manage.py createsuperuser

#Run the server
python manage.py runserver

#Usage

Open http://127.0.0.1:8000/ to access the dashboard.

Schedule meetings via the frontend form or admin panel.

Celery tasks send automated reminders to attendees.

Google Calendar integration syncs meetings with users’ calendars.

Attach agenda/minutes files when scheduling meetings.

Generate attendance reports directly from the dashboard.

#Dependencies

Django

Celery

PostgreSQL (or SQLite)

Google API Client (google-api-python-client)

Python 3.10+