# Postman Testing Guide

## Import the Collection

1. **Open Postman**
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `RSDD_API.postman_collection.json`
5. Click **Import**

## Setup Instructions

### 1. Start Your Flask Server

Make sure your Flask API is running:

```powershell
conda activate rssd-backend
$env:FLASK_APP = "run.py"
python run.py
```

The server should be running at `http://localhost:5000`

### 2. Seed Sample Data (If Not Done)

If you haven't seeded the database yet, run:

```powershell
flask shell
from app.utils.seed import seed_database
seed_database()
exit()
```

This creates:
- **Admin user**: `admin` / `admin123`
- **Dean user**: `johndoe` / `dean123`
- Sample departments, faculties, and titles

### 3. Test Authentication First

1. **Open the "Authentication" folder** in Postman
2. **Run "Login"** request:
   - Username: `admin`
   - Password: `admin123`
   - This will automatically save the `access_token` to collection variables

3. **Verify token was saved:**
   - Click on the collection name
   - Go to **Variables** tab
   - You should see `access_token` and `refresh_token` populated

### 4. Test Other Endpoints

Now all other requests will automatically use the saved token (Bearer authentication is set at collection level).

## Testing Flow

### Step 1: Authentication ✅
- **Login** → Gets tokens (auto-saved)
- **Get Current User** → Verify you're logged in
- **Refresh Token** → Test token refresh

### Step 2: Profile Management
- **Get Profile** → View your profile
- **Update Profile** → Modify your info
- **Upload Profile Picture** → Test file upload (select an image file)

### Step 3: Users (Admin Only)
- **List Users** → See all users
- **Get User by ID** → View specific user
- **Create User** → Add new user
- **Search Users** → Find users by name/email

### Step 4: Meetings
- **List Meetings** → View all meetings
- **Create Meeting** → Create a new meeting (requires admin/dean/secretary role)
  - Date should be in the future (e.g., `2024-12-20`)
  - Time format: `14:00`
  - Attendee IDs: Use `{{user_id}}` or specific user IDs
- **Get Meeting by ID** → View meeting details
- **Update Meeting** → Modify meeting
- **Add Attendees** → Add more attendees
- **Get Upcoming Meetings** → See future meetings

### Step 5: Departments
- **List Faculties** → Get all faculties
- **List Academic Departments** → Get departments
- **List Titles** → Get all titles

## Important Notes

### Variables
The collection uses these variables (auto-populated):
- `{{base_url}}` → `http://localhost:5000`
- `{{access_token}}` → Auto-saved after login
- `{{refresh_token}}` → Auto-saved after login
- `{{user_id}}` → Auto-saved after login
- `{{meeting_id}}` → Auto-saved after creating a meeting

### Date Format
- Use format: `YYYY-MM-DD` (e.g., `2024-12-20`)
- Dates must be in the future for meeting creation

### Time Format
- Use format: `HH:MM` (e.g., `14:00` for 2 PM)

### File Uploads
- **Profile Picture**: Select an image file (PNG, JPG, etc.)
- **Meeting Agenda**: Select a PDF file

### Role Requirements
- **Admin only**: Create/Delete Users, Delete Meetings
- **Admin/Dean/Secretary**: Create/Update/Delete Meetings
- **All authenticated users**: View meetings, update own profile

## Troubleshooting

### 401 Unauthorized
- Token expired → Run **Refresh Token** request
- Not logged in → Run **Login** request first

### 403 Forbidden
- Insufficient permissions → Make sure you're logged in as admin for admin-only endpoints

### 404 Not Found
- Check if resource exists (user_id, meeting_id)
- Verify the endpoint URL is correct

### 400 Bad Request
- Check request body format (JSON)
- Verify required fields are provided
- For meetings: Ensure date is in the future

## Quick Test Sequence

1. **Login** (Authentication → Login)
2. **Get Current User** (Authentication → Get Current User)
3. **List Faculties** (Departments → List Faculties)
4. **Create Meeting** (Meetings → Create Meeting)
5. **List Meetings** (Meetings → List Meetings)
6. **Get Meeting by ID** (Meetings → Get Meeting by ID)

If all these work, your API is fully functional! 🎉

