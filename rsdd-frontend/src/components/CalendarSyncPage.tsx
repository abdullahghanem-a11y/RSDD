import { useState } from 'react';
import { Calendar as CalendarIcon, Upload, Download, ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Calendar } from './ui/calendar';
import { useMeetings } from '../contexts/MeetingsContext';
import { Badge } from './ui/badge';

interface CalendarSyncPageProps {
  isDarkMode: boolean;
}

export function CalendarSyncPage({ isDarkMode }: CalendarSyncPageProps) {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [emailReminders, setEmailReminders] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { meetings } = useMeetings();

  // Get meetings for the selected date
  const getSelectedDateMeetings = () => {
    if (!date) return [];
    const selectedDateStr = date.toISOString().split('T')[0];
    return meetings.filter(meeting => meeting.date === selectedDateStr);
  };

  // Get dates that have meetings
  const getDatesWithMeetings = () => {
    const dates: Date[] = [];
    meetings.forEach(meeting => {
      const meetingDate = new Date(meeting.date);
      dates.push(meetingDate);
    });
    return dates;
  };

  const selectedDateMeetings = getSelectedDateMeetings();
  const datesWithMeetings = getDatesWithMeetings();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0e1a]' : 'bg-[#f8f9fa]'} p-8`}>
      <div className="mb-8">
        <h1 className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Calendar Synchronization</h1>
        <p className={isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}>
          Connect with Google Calendar and configure email reminders • Total Meetings: {meetings.length}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Google Calendar Card */}
        <Card className={isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Google Calendar</CardTitle>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>Sync meetings with your Google Calendar</p>
          </CardHeader>
          <CardContent>
            <div className={`rounded-lg p-4 mb-4 ${isDarkMode ? 'bg-[#0f1621]' : 'bg-[#f3f4f6]'}`}>
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-10 h-10 text-[#2463eb]" />
                <div>
                  <p className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>{googleConnected ? 'Connected' : 'Not Connected'}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>{googleConnected ? 'Your account is connected' : 'Connect your account'}</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => setGoogleConnected(!googleConnected)}
              className="w-full bg-[#2463eb] hover:bg-[#1d4ed8] text-white"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              {googleConnected ? 'Disconnect' : 'Connect'} Google Calendar
            </Button>
          </CardContent>
        </Card>

        {/* Email Reminders Card */}
        <Card className={isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Email Reminders</CardTitle>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>Automated Email reminder settings</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-[#0f1621]' : 'bg-[#f3f4f6]'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Gmail Integration</p>
                  <p className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>Send automatic reminders</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-[#2463eb] text-[#2463eb] hover:bg-[#2463eb] hover:text-white"
                >
                  Configure
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Enable Email Reminders</p>
                <p className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>Send notifications via Gmail</p>
              </div>
              <Switch
                checked={emailReminders}
                onCheckedChange={setEmailReminders}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Auto-Sync</p>
                <p className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>Sync automatically every hour</p>
              </div>
              <Switch
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
            </div>
          </CardContent>
        </Card>

        {/* Calendar Widget */}
        <Card className={isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Calendar</CardTitle>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>View your schedule</p>
          </CardHeader>
          <CardContent>
            <style>{`
              .has-meetings {
                position: relative;
              }
              .has-meetings::after {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 50%;
                transform: translateX(-50%);
                width: 4px;
                height: 4px;
                background-color: #2463eb;
                border-radius: 50%;
              }
            `}</style>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className={`rounded-md ${isDarkMode ? 'bg-[#0f1621]' : 'bg-[#f3f4f6]'}`}
              modifiers={{
                hasMeetings: datesWithMeetings
              }}
              modifiersClassNames={{
                hasMeetings: 'has-meetings'
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Import & Export Meetings */}
      <Card className={isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Import & Export Meetings</CardTitle>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>Manage your calendar data</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className={`rounded-lg p-6 border transition-colors text-center ${
              isDarkMode 
                ? 'bg-[#0f1621] hover:bg-[#273446] border-[#2a3544]' 
                : 'bg-[#f3f4f6] hover:bg-[#e5e7eb] border-[#e5e7eb]'
            }`}>
              <Upload className={`w-8 h-8 mx-auto mb-3 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`} />
              <p className={`mb-1 ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>Import from Google Calendar</p>
              <p className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>Import .ics file</p>
            </button>
            
            <button className={`rounded-lg p-6 border transition-colors text-center ${
              isDarkMode 
                ? 'bg-[#0f1621] hover:bg-[#273446] border-[#2a3544]' 
                : 'bg-[#f3f4f6] hover:bg-[#e5e7eb] border-[#e5e7eb]'
            }`}>
              <Download className={`w-8 h-8 mx-auto mb-3 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`} />
              <p className={`mb-1 ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>Export to Google Calendar</p>
              <p className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>Download .ics file</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Meetings List */}
      <Card className={`mt-6 ${isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'}`}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>
            Meetings on {date?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </CardTitle>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
            {selectedDateMeetings.length} meeting(s) scheduled for this date
          </p>
        </CardHeader>
        <CardContent>
          {selectedDateMeetings.length === 0 ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No meetings scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateMeetings.map(meeting => (
                <div 
                  key={meeting.id} 
                  className={`p-4 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-[#0f1621] border-[#2a3544] hover:bg-[#1a2332]' 
                      : 'bg-[#f3f4f6] border-[#e5e7eb] hover:bg-white'
                  } transition-colors`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`mb-2 ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>
                          {meeting.title}
                        </h3>
                        
                        <div className="space-y-1">
                          <div className={`flex items-center text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{meeting.time} ({meeting.duration})</span>
                          </div>
                          
                          <div className={`flex items-center text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{meeting.location}</span>
                          </div>
                          
                          <div className={`flex items-start text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                            <Users className="w-4 h-4 mr-2 mt-0.5" />
                            <span>{meeting.attendees.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Badge className="bg-[#2463eb] text-white hover:bg-[#1d4ed8]">
                        {new Date(meeting.date + 'T' + meeting.time) > new Date() ? 'Upcoming' : 'Past'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}