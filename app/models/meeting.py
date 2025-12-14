from __future__ import annotations

from datetime import datetime, date, time
from typing import Optional, List

from sqlalchemy import (
    String,
    Date,
    Time,
    DateTime,
    Table,
    Column,
    Integer,
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


# Association table for Meeting-User Many-to-Many
meeting_attendees = Table(
    "meeting_attendees",
    db.Model.metadata,
    Column(
        "meeting_id",
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "user_id",
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Meeting(db.Model):
    """Meeting model with attendees and agenda"""

    __tablename__ = "meetings"

    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True)

    # Meeting Details
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    date: Mapped[Optional[date]] = mapped_column(Date)
    time: Mapped[Optional[time]] = mapped_column(Time)
    agenda: Mapped[Optional[str]] = mapped_column(String(255))  # File path

    # External Integration
    google_event_id: Mapped[Optional[str]] = mapped_column(String(255))

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationships
    attendees: Mapped[List["User"]] = relationship(
        secondary=meeting_attendees,
        back_populates="meetings",
        lazy="selectin",  # Eager load attendees
    )

    def get_datetime(self) -> Optional[datetime]:
        """Combine date and time into datetime object"""
        if self.date and self.time:
            return datetime.combine(self.date, self.time)
        return None

    def is_past(self) -> bool:
        """Check if meeting is in the past"""
        if self.date:
            return self.date < date.today()
        return False

    def is_upcoming(self) -> bool:
        """Check if meeting is in the future"""
        if self.date:
            return self.date >= date.today()
        return False

    def get_attendee_emails(self) -> List[str]:
        """Get list of attendee emails"""
        emails: List[str] = []
        for attendee in self.attendees:
            email: Optional[str] = None
            if attendee.profile and attendee.profile.email:
                email = attendee.profile.email
            elif attendee.email:
                email = attendee.email

            if email:
                emails.append(email)

        return emails

    def to_dict(self, include_attendees: bool = True) -> dict:
        """Serialize meeting for API responses"""
        data = {
            "id": self.id,
            "title": self.title,
            "date": self.date.isoformat() if self.date else None,
            "time": self.time.isoformat() if self.time else None,
            "datetime": self.get_datetime().isoformat()
            if self.get_datetime()
            else None,
            "agenda": self.agenda,
            "has_agenda": bool(self.agenda),
            "google_event_id": self.google_event_id,
            "is_synced": bool(self.google_event_id),
            "is_past": self.is_past(),
            "is_upcoming": self.is_upcoming(),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

        if include_attendees:
            data["attendees"] = [
                {
                    "id": attendee.id,
                    "username": attendee.username,
                    "first_name": attendee.first_name,
                    "last_name": attendee.last_name,
                    "full_name": attendee.get_full_name(),
                    "email": attendee.profile.email
                    if attendee.profile
                    else attendee.email,
                    "role": attendee.profile.role if attendee.profile else None,
                }
                for attendee in self.attendees
            ]
            data["attendee_count"] = len(self.attendees)

        return data

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Meeting {self.id}: {self.title}>"

{
  "cells": [],
  "metadata": {
    "language_info": {
      "name": "python"
    }
  },
  "nbformat": 4,
  "nbformat_minor": 2
}