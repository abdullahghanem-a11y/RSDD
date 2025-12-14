# app/services/meeting_service.py
from app.extensions import db
from app.models.meeting import Meeting
from app.models.user import User
from app.services.calendar_service import CalendarService
from app.services.email_service import EmailService
from app.services.file_service import FileService
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict
from sqlalchemy import and_, or_

class MeetingService:
    """Business logic for meeting management"""
    
    @staticmethod
    def create_meeting(data: Dict, files: Dict) -> Meeting:
        """
        Create new meeting with all integrations
        
        Args:
            data: Dictionary with title, date, time, attendee_ids
            files: Dictionary with uploaded files
        
        Returns:
            Created Meeting object
        
        Raises:
            ValueError: If validation fails
        """
        # Extract data
        title = data['title']
        meeting_date = data['date']
        meeting_time = data['time']
        attendee_ids = data['attendee_ids']
        
        # Validate attendees exist
        attendees = User.query.filter(User.id.in_(attendee_ids)).all()
        if len(attendees) != len(attendee_ids):
            raise ValueError("One or more attendees not found")
        
        # Check all attendees are active
        inactive = [a for a in attendees if not a.is_active]
        if inactive:
            raise ValueError(f"Cannot add inactive users: {', '.join([a.username for a in inactive])}")
        
        # Create meeting
        meeting = Meeting(
            title=title,
            date=meeting_date,
            time=meeting_time
        )
        
        # Add attendees
        meeting.attendees.extend(attendees)
        
        # Save to database to get ID
        db.session.add(meeting)
        db.session.flush()
        
        # Handle agenda upload
        if 'agenda' in files and files['agenda'].filename:
            agenda_file = files['agenda']
            relative_path, error = FileService.save_agenda(agenda_file, meeting.id)
            
            if error:
                db.session.rollback()
                raise ValueError(f"Agenda upload failed: {error}")
            
            meeting.agenda = relative_path
        
        db.session.commit()
        
        # Background integrations (don't fail the meeting creation)
        try:
            # Create Google Calendar event
            google_event_id = CalendarService.create_event(meeting)
            if google_event_id:
                meeting.google_event_id = google_event_id
                db.session.commit()
        except Exception as e:
            print(f"⚠️  Google Calendar sync failed: {e}")
        
        try:
            # Send email notifications
            EmailService.send_meeting_created(meeting)
        except Exception as e:
            print(f"⚠️  Email notification failed: {e}")
        
        return meeting
    
    @staticmethod
    def update_meeting(meeting_id: int, data: Dict, files: Optional[Dict] = None) -> Meeting:
        """
        Update existing meeting
        
        Args:
            meeting_id: Meeting ID
            data: Dictionary with fields to update
            files: Dictionary with uploaded files
        
        Returns:
            Updated Meeting object
        """
        meeting = Meeting.query.get(meeting_id)
        if not meeting:
            raise ValueError("Meeting not found")
        
        # Update fields
        if 'title' in data:
            meeting.title = data['title']
        
        if 'date' in data:
            meeting.date = data['date']
        
        if 'time' in data:
            meeting.time = data['time']
        
        # Update attendees if provided
        if 'attendee_ids' in data:
            attendee_ids = data['attendee_ids']
            attendees = User.query.filter(User.id.in_(attendee_ids)).all()
            
            if len(attendees) != len(attendee_ids):
                raise ValueError("One or more attendees not found")
            
            meeting.attendees.clear()
            meeting.attendees.extend(attendees)
        
        # Update agenda if new file provided
        if files and 'agenda' in files and files['agenda'].filename:
            # Delete old agenda
            if meeting.agenda:
                FileService.delete_file(meeting.agenda)
            
            # Save new agenda
            agenda_file = files['agenda']
            relative_path, error = FileService.save_agenda(agenda_file, meeting.id)
            
            if error:
                raise ValueError(f"Agenda upload failed: {error}")
            
            meeting.agenda = relative_path
        
        meeting.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Update Google Calendar event
        try:
            if meeting.google_event_id:
                CalendarService.update_event(meeting)
        except Exception as e:
            print(f"⚠️  Google Calendar update failed: {e}")
        
        return meeting
    
    @staticmethod
    def delete_meeting(meeting_id: int) -> bool:
        """
        Delete meeting and cleanup
        
        Args:
            meeting_id: Meeting ID
        
        Returns:
            True if successful
        """
        meeting = Meeting.query.get(meeting_id)
        if not meeting:
            raise ValueError("Meeting not found")
        
        # Delete agenda file
        if meeting.agenda:
            FileService.delete_file(meeting.agenda)
        
        # Delete Google Calendar event
        try:
            if meeting.google_event_id:
                CalendarService.delete_event(meeting.google_event_id)
        except Exception as e:
            print(f"⚠️  Google Calendar deletion failed: {e}")
        
        # Delete from database
        db.session.delete(meeting)
        db.session.commit()
        
        return True
    
    @staticmethod
    def get_upcoming_meetings(user_id: Optional[int] = None, limit: int = 10) -> List[Meeting]:
        """Get upcoming meetings, optionally filtered by user"""
        query = Meeting.query.filter(
            Meeting.date >= date.today()
        ).order_by(Meeting.date.asc(), Meeting.time.asc())
        
        if user_id:
            query = query.join(Meeting.attendees).filter(User.id == user_id)
        
        return query.limit(limit).all()
    
    @staticmethod
    def get_past_meetings(user_id: Optional[int] = None, limit: int = 10) -> List[Meeting]:
        """Get past meetings"""
        query = Meeting.query.filter(
            Meeting.date < date.today()
        ).order_by(Meeting.date.desc(), Meeting.time.desc())
        
        if user_id:
            query = query.join(Meeting.attendees).filter(User.id == user_id)
        
        return query.limit(limit).all()
    
    @staticmethod
    def get_meetings_for_reminders(days_ahead: int) -> List[Meeting]:
        """
        Get meetings that need reminders
        
        Args:
            days_ahead: Number of days ahead to check (e.g., 1, 7, 30)
        
        Returns:
            List of meetings
        """
        target_date = date.today() + timedelta(days=days_ahead)
        
        meetings = Meeting.query.filter(
            Meeting.date == target_date
        ).all()
        
        return meetings

