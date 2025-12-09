import { useState } from 'react';
import { Calendar, Clock, Users, Plus, X, FileText, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { useMeetings } from '../contexts/MeetingsContext';
import { useNotifications } from '../contexts/NotificationsContext';

interface CreateMeetingPageProps {
  isDarkMode: boolean;
}

export function CreateMeetingPage({ isDarkMode }: CreateMeetingPageProps) {
  const { addMeeting } = useMeetings();
  const { addNotification } = useNotifications();
  const [meetingData, setMeetingData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '30',
    location: '',
  });
  
  const [attendees, setAttendees] = useState<string[]>([]);
  const [newAttendee, setNewAttendee] = useState('');

  const handleAddAttendee = () => {
    if (newAttendee.trim()) {
      setAttendees([...attendees, newAttendee.trim()]);
      setNewAttendee('');
    }
  };

  const handleRemoveAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  const handleScheduleMeeting = () => {
    if (meetingData.title && meetingData.date && meetingData.time && meetingData.location) {
      addMeeting({
        title: meetingData.title,
        date: meetingData.date,
        time: meetingData.time,
        location: meetingData.location,
        duration: meetingData.duration,
        attendees: attendees,
      });
      
      // Add notification
      addNotification({
        title: 'New Meeting Scheduled',
        message: `${meetingData.title} has been scheduled for ${meetingData.date} at ${meetingData.time}`,
        type: 'meeting',
      });
      
      toast.success('Meeting scheduled successfully!');
      
      // Reset form
      setMeetingData({
        title: '',
        date: '',
        time: '',
        duration: '30',
        location: '',
      });
      setAttendees([]);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0e1a]' : 'bg-[#f8f9fa]'} p-8`}>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className={`mb-2 ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>Schedule a New Meeting</h1>
          <p className={isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}>
            Use the form below to create and schedule a new meeting.
          </p>
        </div>

        <div className={`rounded-lg p-8 border ${
          isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'
        }`}>
          <div className="space-y-6">
            {/* Title */}
            <div>
              <Label className={`mb-2 block ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>
                Title
              </Label>
              <Input
                placeholder="Enter meeting title"
                value={meetingData.title}
                onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
                className={isDarkMode 
                  ? 'bg-[#0f1621] border-[#2a3544] text-white placeholder:text-[#4a5568]'
                  : 'bg-white border-[#d1d5db] text-[#1a1a1a] placeholder:text-[#999999]'
                }
              />
            </div>

            {/* Date and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={`mb-2 block ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>
                  Date
                </Label>
                <Input
                  type="date"
                  placeholder="mm/dd/yyyy"
                  value={meetingData.date}
                  onChange={(e) => setMeetingData({ ...meetingData, date: e.target.value })}
                  className={isDarkMode 
                    ? 'bg-[#0f1621] border-[#2a3544] text-white placeholder:text-[#4a5568]'
                    : 'bg-white border-[#d1d5db] text-[#1a1a1a] placeholder:text-[#999999]'
                  }
                />
              </div>
              <div>
                <Label className={`mb-2 block ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>
                  Duration (minutes)
                </Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={meetingData.duration}
                  onChange={(e) => setMeetingData({ ...meetingData, duration: e.target.value })}
                  className={isDarkMode 
                    ? 'bg-[#0f1621] border-[#2a3544] text-white placeholder:text-[#4a5568]'
                    : 'bg-white border-[#d1d5db] text-[#1a1a1a] placeholder:text-[#999999]'
                  }
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <Label className={`mb-2 block ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>
                Time
              </Label>
              <Input
                type="time"
                placeholder="--:-- --"
                value={meetingData.time}
                onChange={(e) => setMeetingData({ ...meetingData, time: e.target.value })}
                className={isDarkMode 
                  ? 'bg-[#0f1621] border-[#2a3544] text-white placeholder:text-[#4a5568]'
                  : 'bg-white border-[#d1d5db] text-[#1a1a1a] placeholder:text-[#999999]'
                }
              />
            </div>

            {/* Location */}
            <div>
              <Label className={`mb-2 block ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>
                Location
              </Label>
              <Input
                placeholder="Enter meeting location"
                value={meetingData.location}
                onChange={(e) => setMeetingData({ ...meetingData, location: e.target.value })}
                className={isDarkMode 
                  ? 'bg-[#0f1621] border-[#2a3544] text-white placeholder:text-[#4a5568]'
                  : 'bg-white border-[#d1d5db] text-[#1a1a1a] placeholder:text-[#999999]'
                }
              />
            </div>

            {/* Attendees */}
            <div>
              <Label className={`mb-2 block ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>
                Attendees
              </Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Start typing to search users. Use Ctrl/Cmd to select multiple."
                    value={newAttendee}
                    onChange={(e) => setNewAttendee(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAttendee();
                      }
                    }}
                    className={isDarkMode 
                      ? 'bg-[#0f1621] border-[#2a3544] text-white placeholder:text-[#4a5568]'
                      : 'bg-white border-[#d1d5db] text-[#1a1a1a] placeholder:text-[#999999]'
                    }
                  />
                  <Button
                    type="button"
                    onClick={handleAddAttendee}
                    className="bg-[#2463eb] hover:bg-[#1d4ed8] text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Attendees List */}
                {attendees.length > 0 && (
                  <div className={`p-4 rounded-lg border ${
                    isDarkMode ? 'bg-[#0f1621] border-[#2a3544]' : 'bg-[#f8f9fa] border-[#e5e7eb]'
                  }`}>
                    <div className="flex flex-wrap gap-2">
                      {attendees.map((attendee, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                            isDarkMode ? 'bg-[#1a2332] text-white' : 'bg-white text-[#1a1a1a]'
                          }`}
                        >
                          <span className="text-sm">{attendee}</span>
                          <button
                            onClick={() => handleRemoveAttendee(index)}
                            className={`hover:opacity-70 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Agenda File */}
            <div>
              <Label className={`mb-2 block ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>
                Agenda File
              </Label>
              <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                isDarkMode ? 'bg-[#0f1621] border-[#2a3544]' : 'bg-white border-[#d1d5db]'
              }`}>
                <Button
                  type="button"
                  variant="outline"
                  className={isDarkMode 
                    ? 'border-[#2a3544] text-[#8b94a8] hover:bg-[#1a2332]'
                    : 'border-[#d1d5db] text-[#666666] hover:bg-[#f8f9fa]'
                  }
                >
                  Choose File
                </Button>
                <span className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                  No file chosen
                </span>
              </div>
            </div>

            {/* Schedule Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleScheduleMeeting}
                className="bg-[#2463eb] hover:bg-[#1d4ed8] text-white"
              >
                📅 Schedule Meeting
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}