# app/services/email_service.py
from flask_mail import Message
from flask import current_app
from app.models.meeting import Meeting
from app.extensions import mail
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Email notification service"""
    
    @staticmethod
    def send_email(
        recipients: List[str],
        subject: str,
        body: str,
        html_body: Optional[str] = None
    ) -> bool:
        """
        Send email using Flask-Mail
        
        Args:
            recipients: List of email addresses
            subject: Email subject
            body: Plain text body
            html_body: HTML body (optional)
        
        Returns:
            True if sent successfully
        """
        try:
            msg = Message(
                subject=subject,
                recipients=recipients,
                body=body,
                html=html_body,
                sender=current_app.config['MAIL_DEFAULT_SENDER']
            )
            
            mail.send(msg)
            logger.info(f"✅ Email sent to {len(recipients)} recipient(s): {subject}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Email sending failed: {e}")
            return False
    
    @staticmethod
    def send_meeting_created(meeting: Meeting) -> bool:
        """
        Send meeting creation notification to attendees
        
        Args:
            meeting: Meeting object
        
        Returns:
            True if sent successfully
        """
        # Get attendee emails
        recipients = meeting.get_attendee_emails()
        
        if not recipients:
            logger.warning(f"No valid email recipients for meeting {meeting.id}")
            return False
        
        # Format date and time
        meeting_datetime = meeting.get_datetime()
        formatted_date = meeting_datetime.strftime('%B %d, %Y at %I:%M %p') if meeting_datetime else "TBD"
        
        # Email subject
        subject = f"Meeting Invitation: {meeting.title}"
        
        # Plain text body
        body = f"""
You have been invited to a meeting:

Title: {meeting.title}
Date & Time: {formatted_date}
Attendees: {len(meeting.attendees)} people

{'Agenda is available for download' if meeting.agenda else 'No agenda provided'}

Please confirm your attendance.

This is an automated message from the Meeting Management System.
        """
        
        # HTML body
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }}
        .header {{ background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background: white; padding: 20px; border-radius: 0 0 5px 5px; }}
        .details {{ background: #f0f0f0; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        h1 {{ margin: 0; }}
        h2 {{ color: #4CAF50; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Meeting Invitation</h1>
        </div>
        <div class="content">
            <p>You have been invited to the following meeting:</p>
            
            <div class="details">
                <h2>{meeting.title}</h2>
                <p><strong>📅 Date & Time:</strong> {formatted_date}</p>
                <p><strong>👥 Attendees:</strong> {len(meeting.attendees)} people</p>
                {'<p><strong>📄 Agenda:</strong> Available for download</p>' if meeting.agenda else ''}
            </div>
            
            <p>Please confirm your attendance and add this meeting to your calendar.</p>
            
            <div class="footer">
                <p>This is an automated message from the Meeting Management System.</p>
            </div>
        </div>
    </div>
</body>
</html>
        """
        
        return EmailService.send_email(recipients, subject, body, html_body)
    
    @staticmethod
    def send_meeting_reminder(meeting: Meeting, days_before: int) -> bool:
        """
        Send meeting reminder X days before the meeting
        
        Args:
            meeting: Meeting object
            days_before: Number of days before meeting (1, 7, 30)
        
        Returns:
            True if sent successfully
        """
        recipients = meeting.get_attendee_emails()
        
        if not recipients:
            logger.warning(f"No valid email recipients for meeting {meeting.id}")
            return False
        
        meeting_datetime = meeting.get_datetime()
        formatted_date = meeting_datetime.strftime('%B %d, %Y at %I:%M %p') if meeting_datetime else "TBD"
        
        # Time text
        if days_before == 1:
            time_text = "tomorrow"
            emoji = "⏰"
        elif days_before == 7:
            time_text = "in one week"
            emoji = "📆"
        elif days_before == 30:
            time_text = "in one month"
            emoji = "📅"
        else:
            time_text = f"in {days_before} days"
            emoji = "🔔"
        
        subject = f"Reminder: Meeting {time_text} - {meeting.title}"
        
        body = f"""
{emoji} MEETING REMINDER

This is a reminder that you have a meeting {time_text}:

Title: {meeting.title}
Date & Time: {formatted_date}
Attendees: {len(meeting.attendees)} people

Please be prepared and review the agenda if available.

This is an automated reminder from the Meeting Management System.
        """
        
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background: #f9f9f9; padding: 20px; }}
        .reminder {{ background: #fff3cd; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        h1 {{ margin: 0; }}
        h2 {{ color: #FF9800; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{emoji} Meeting Reminder</h1>
        </div>
        <div class="content">
            <div class="reminder">
                <h2>{meeting.title}</h2>
                <p><strong>When:</strong> {formatted_date} ({time_text})</p>
                <p><strong>Attendees:</strong> {len(meeting.attendees)} people</p>
            </div>
            
            <p>This is an automated reminder for your upcoming meeting. Please be prepared!</p>
            
            <div class="footer">
                <p>Meeting Management System</p>
            </div>
        </div>
    </div>
</body>
</html>
        """
        
        return EmailService.send_email(recipients, subject, body, html_body)

