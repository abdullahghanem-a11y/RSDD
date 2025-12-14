# app/services/calendar_service.py
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from datetime import datetime, timedelta
from app.models.meeting import Meeting
from typing import Optional
from flask import current_app
import logging
import os

logger = logging.getLogger(__name__)

class CalendarService:
    """Google Calendar API integration"""
    
    SCOPES = ['https://www.googleapis.com/auth/calendar']
    CALENDAR_ID = 'primary'  # Or specific calendar ID
    
    @staticmethod
    def get_calendar_service():
        """
        Initialize Google Calendar API service using service account
        
        Returns:
            Google Calendar service object
        
        Raises:
            ValueError: If credentials not configured
        """
        credentials_path = current_app.config.get('GOOGLE_CREDENTIALS_PATH')
        
        if not credentials_path or not os.path.exists(credentials_path):
            raise ValueError("Google Calendar credentials not configured")
        
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path,
            scopes=CalendarService.SCOPES
        )
        
        service = build('calendar', 'v3', credentials=credentials)
        return service
    
    @staticmethod
    def create_event(meeting: Meeting) -> Optional[str]:
        """
        Create Google Calendar event for meeting
        
        Args:
            meeting: Meeting object
        
        Returns:
            Google event ID if successful, None otherwise
        """
        if not meeting.date or not meeting.time:
            logger.warning("Meeting has no date/time, skipping calendar sync")
            return None
        
        try:
            service = CalendarService.get_calendar_service()
            
            # Combine date and time
            start_datetime = datetime.combine(meeting.date, meeting.time)
            end_datetime = start_datetime + timedelta(hours=1)  # Default 1-hour duration
            
            # Get attendee emails
            attendee_emails = []
            for attendee in meeting.attendees:
                email = attendee.profile.email if attendee.profile and attendee.profile.email else attendee.email
                if email:
                    attendee_emails.append({'email': email})
            
            # Build event description
            description = f'Meeting ID: {meeting.id}\n\n'
            description += f'Attendees: {len(meeting.attendees)}\n'
            
            if meeting.agenda:
                from flask import url_for
                agenda_url = url_for('media.serve_media', filepath=meeting.agenda, _external=True)
                description += f'\nAgenda: {agenda_url}'
            
            # Create event
            event = {
                'summary': meeting.title,
                'description': description,
                'start': {
                    'dateTime': start_datetime.isoformat(),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': end_datetime.isoformat(),
                    'timeZone': 'UTC',
                },
                'attendees': attendee_emails,
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                        {'method': 'popup', 'minutes': 15},  # 15 min before
                    ],
                },
            }
            
            # Insert event
            created_event = service.events().insert(
                calendarId=CalendarService.CALENDAR_ID,
                body=event
            ).execute()
            
            logger.info(f"✅ Google Calendar event created: {created_event.get('id')}")
            return created_event.get('id')
            
        except ValueError as e:
            logger.warning(f"⚠️  Google Calendar not configured: {e}")
            return None
        except HttpError as e:
            logger.error(f"❌ Google Calendar API error: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ Failed to create calendar event: {e}")
            return None
    
    @staticmethod
    def update_event(meeting: Meeting) -> bool:
        """Update Google Calendar event"""
        if not meeting.google_event_id:
            return False
        
        try:
            service = CalendarService.get_calendar_service()
            
            # Get existing event
            event = service.events().get(
                calendarId=CalendarService.CALENDAR_ID,
                eventId=meeting.google_event_id
            ).execute()
            
            # Update fields
            if meeting.date and meeting.time:
                start_datetime = datetime.combine(meeting.date, meeting.time)
                end_datetime = start_datetime + timedelta(hours=1)
                
                event['start'] = {
                    'dateTime': start_datetime.isoformat(),
                    'timeZone': 'UTC',
                }
                event['end'] = {
                    'dateTime': end_datetime.isoformat(),
                    'timeZone': 'UTC',
                }
            
            if meeting.title:
                event['summary'] = meeting.title
            
            # Update attendees
            attendee_emails = []
            for attendee in meeting.attendees:
                email = attendee.profile.email if attendee.profile and attendee.profile.email else attendee.email
                if email:
                    attendee_emails.append({'email': email})
            event['attendees'] = attendee_emails
            
            # Update event
            service.events().update(
                calendarId=CalendarService.CALENDAR_ID,
                eventId=meeting.google_event_id,
                body=event
            ).execute()
            
            logger.info(f"✅ Google Calendar event updated: {meeting.google_event_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to update calendar event: {e}")
            return False
    
    @staticmethod
    def delete_event(event_id: str) -> bool:
        """Delete Google Calendar event"""
        try:
            service = CalendarService.get_calendar_service()
            service.events().delete(
                calendarId=CalendarService.CALENDAR_ID,
                eventId=event_id
            ).execute()
            
            logger.info(f"✅ Google Calendar event deleted: {event_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to delete calendar event: {e}")
            return False

