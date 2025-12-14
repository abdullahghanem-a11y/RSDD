# app/api/meetings.py
from flask import Blueprint, request, g
from app.models.meeting import Meeting
from app.models.user import User
from app.extensions import db
from app.utils.decorators import jwt_required_with_user, role_required
from app.utils.response import success_response, error_response, paginated_response, created_response
from app.services.meeting_service import MeetingService
from datetime import datetime, date
from sqlalchemy import and_, or_

meetings_bp = Blueprint('meetings', __name__, url_prefix='/api/meetings')

@meetings_bp.route('', methods=['GET'])
@jwt_required_with_user
def list_meetings():
    """
    List meetings with filters and pagination
    
    Query Parameters:
        ?page=1
        &per_page=20
        &search=board
        &date_from=2024-01-01
        &date_to=2024-12-31
        &attendee_id=5
        &upcoming=true
        &past=false
    """
    # Parse parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    date_from = request.args.get('date_from', '')
    date_to = request.args.get('date_to', '')
    attendee_id = request.args.get('attendee_id', type=int)
    upcoming = request.args.get('upcoming', '').lower() == 'true'
    past = request.args.get('past', '').lower() == 'true'
    
    # Build query
    query = Meeting.query
    
    # Search filter
    if search:
        query = query.filter(Meeting.title.ilike(f'%{search}%'))
    
    # Date filters
    if date_from:
        try:
            from_date = datetime.strptime(date_from, '%Y-%m-%d').date()
            query = query.filter(Meeting.date >= from_date)
        except ValueError:
            pass
    
    if date_to:
        try:
            to_date = datetime.strptime(date_to, '%Y-%m-%d').date()
            query = query.filter(Meeting.date <= to_date)
        except ValueError:
            pass
    
    # Upcoming/past filters
    today = date.today()
    if upcoming:
        query = query.filter(Meeting.date >= today)
    if past:
        query = query.filter(Meeting.date < today)
    
    # Attendee filter
    if attendee_id:
        query = query.join(Meeting.attendees).filter(User.id == attendee_id)
    
    # Sorting
    query = query.order_by(Meeting.date.desc(), Meeting.time.desc())
    
    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return paginated_response(
        items=[meeting.to_dict() for meeting in pagination.items],
        page=page,
        per_page=per_page,
        total=pagination.total
    )


@meetings_bp.route('/<int:meeting_id>', methods=['GET'])
@jwt_required_with_user
def get_meeting(meeting_id):
    """Get specific meeting details"""
    meeting = Meeting.query.get(meeting_id)
    
    if not meeting:
        return error_response("Meeting not found", code="NOT_FOUND", status=404)
    
    return success_response(meeting.to_dict())


@meetings_bp.route('', methods=['POST'])
@role_required('admin', 'dean', 'secretary')
def create_meeting():
    """
    Create new meeting
    
    Request: multipart/form-data
        title: "Board Meeting"
        date: "2024-12-15"
        time: "14:00"
        attendee_ids: [1, 3, 5]
        agenda: <file>
    """
    # Get form data
    title = request.form.get('title')
    date_str = request.form.get('date')
    time_str = request.form.get('time')
    attendee_ids = request.form.getlist('attendee_ids[]')
    
    # Validate required fields
    if not all([title, date_str, time_str, attendee_ids]):
        return error_response(
            "Missing required fields",
            errors={
                'title': 'Required' if not title else None,
                'date': 'Required' if not date_str else None,
                'time': 'Required' if not time_str else None,
                'attendee_ids': 'At least one attendee required' if not attendee_ids else None
            },
            status=400
        )
    
    # Parse date and time
    try:
        meeting_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        meeting_time = datetime.strptime(time_str, '%H:%M').time()
    except ValueError:
        return error_response("Invalid date or time format", status=400)
    
    # Validate date is not in past
    if meeting_date < date.today():
        return error_response(
            "Meeting date cannot be in the past",
            code="PAST_DATE",
            status=400
        )
    
    # Convert attendee_ids to integers
    try:
        attendee_ids = [int(id) for id in attendee_ids]
    except ValueError:
        return error_response("Invalid attendee IDs", status=400)
    
    # Prepare data
    data = {
        'title': title,
        'date': meeting_date,
        'time': meeting_time,
        'attendee_ids': attendee_ids
    }
    
    # Create meeting using service
    try:
        meeting = MeetingService.create_meeting(data, request.files)
        return created_response(
            meeting.to_dict(),
            "Meeting created successfully. Invitations sent to attendees."
        )
    except ValueError as e:
        return error_response(str(e), status=400)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to create meeting: {str(e)}", status=500)


@meetings_bp.route('/<int:meeting_id>', methods=['PUT'])
@role_required('admin', 'dean', 'secretary')
def update_meeting(meeting_id):
    """
    Update existing meeting
    
    Request: multipart/form-data
        title: "Updated Board Meeting"
        date: "2024-12-20"
        time: "15:00"
        attendee_ids: [1, 2, 3, 5]
        agenda: <file> (optional)
    """
    meeting = Meeting.query.get(meeting_id)
    
    if not meeting:
        return error_response("Meeting not found", status=404)
    
    # Get form data
    title = request.form.get('title')
    date_str = request.form.get('date')
    time_str = request.form.get('time')
    attendee_ids = request.form.getlist('attendee_ids[]')
    
    # Prepare update data
    data = {}
    
    if title:
        data['title'] = title
    
    if date_str:
        try:
            meeting_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            if meeting_date < date.today():
                return error_response("Meeting date cannot be in the past", status=400)
            data['date'] = meeting_date
        except ValueError:
            return error_response("Invalid date format", status=400)
    
    if time_str:
        try:
            data['time'] = datetime.strptime(time_str, '%H:%M').time()
        except ValueError:
            return error_response("Invalid time format", status=400)
    
    if attendee_ids:
        try:
            data['attendee_ids'] = [int(id) for id in attendee_ids]
        except ValueError:
            return error_response("Invalid attendee IDs", status=400)
    
    # Update meeting using service
    try:
        updated_meeting = MeetingService.update_meeting(meeting_id, data, request.files)
        return success_response(
            updated_meeting.to_dict(),
            "Meeting updated successfully"
        )
    except ValueError as e:
        return error_response(str(e), status=400)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to update meeting: {str(e)}", status=500)


@meetings_bp.route('/<int:meeting_id>', methods=['DELETE'])
@role_required('admin', 'dean', 'secretary')
def delete_meeting(meeting_id):
    """Delete meeting"""
    try:
        MeetingService.delete_meeting(meeting_id)
        return success_response(message="Meeting deleted successfully")
    except ValueError as e:
        return error_response(str(e), status=404)
    except Exception as e:
        return error_response(f"Failed to delete meeting: {str(e)}", status=500)


@meetings_bp.route('/upcoming', methods=['GET'])
@jwt_required_with_user
def get_upcoming_meetings():
    """
    Get upcoming meetings for current user
    
    Query Parameters:
        ?limit=10
    """
    user = g.current_user
    limit = request.args.get('limit', 10, type=int)
    
    meetings = MeetingService.get_upcoming_meetings(user_id=user.id, limit=limit)
    
    return success_response({
        'meetings': [meeting.to_dict() for meeting in meetings],
        'count': len(meetings)
    })


@meetings_bp.route('/past', methods=['GET'])
@jwt_required_with_user
def get_past_meetings():
    """
    Get past meetings for current user
    
    Query Parameters:
        ?limit=10
    """
    user = g.current_user
    limit = request.args.get('limit', 10, type=int)
    
    meetings = MeetingService.get_past_meetings(user_id=user.id, limit=limit)
    
    return success_response({
        'meetings': [meeting.to_dict() for meeting in meetings],
        'count': len(meetings)
    })


@meetings_bp.route('/<int:meeting_id>/attendees', methods=['POST'])
@role_required('admin', 'dean', 'secretary')
def add_attendees(meeting_id):
    """
    Add attendees to meeting
    
    Request Body:
        {
            "user_ids": [7, 8, 9]
        }
    """
    meeting = Meeting.query.get(meeting_id)
    
    if not meeting:
        return error_response("Meeting not found", status=404)
    
    data = request.get_json()
    user_ids = data.get('user_ids', [])
    
    if not user_ids:
        return error_response("No user IDs provided", status=400)
    
    # Get users
    users = User.query.filter(User.id.in_(user_ids)).all()
    
    if len(users) != len(user_ids):
        return error_response("One or more users not found", status=404)
    
    # Add attendees (avoid duplicates)
    for user in users:
        if user not in meeting.attendees:
            meeting.attendees.append(user)
    
    db.session.commit()
    
    return success_response(
        meeting.to_dict(),
        f"Added {len(users)} attendee(s) to meeting"
    )


@meetings_bp.route('/<int:meeting_id>/attendees/<int:user_id>', methods=['DELETE'])
@role_required('admin', 'dean', 'secretary')
def remove_attendee(meeting_id, user_id):
    """Remove attendee from meeting"""
    meeting = Meeting.query.get(meeting_id)
    
    if not meeting:
        return error_response("Meeting not found", status=404)
    
    user = User.query.get(user_id)
    
    if not user:
        return error_response("User not found", status=404)
    
    if user in meeting.attendees:
        meeting.attendees.remove(user)
        db.session.commit()
        return success_response(message="Attendee removed from meeting")
    else:
        return error_response("User is not an attendee of this meeting", status=400)

