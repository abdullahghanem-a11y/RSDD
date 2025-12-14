import { Calendar, Clock, Users, CheckCircle, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useMeetings } from '../contexts/MeetingsContext';

interface DashboardHomeProps {
  isDarkMode: boolean;
}

export function DashboardHome({ isDarkMode }: DashboardHomeProps) {
  const { meetings } = useMeetings();
  
  // Filter upcoming meetings (meetings with dates in the future or today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.date);
    meetingDate.setHours(0, 0, 0, 0);
    return meetingDate >= today;
  }).sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    return dateA.getTime() - dateB.getTime();
  });

  // Filter past meetings
  const pastMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.date);
    meetingDate.setHours(0, 0, 0, 0);
    return meetingDate < today;
  }).sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  const stats = [
    {
      title: 'Upcoming Meetings',
      value: upcomingMeetings.length.toString(),
      icon: Calendar,
      color: 'bg-[#3b82f6]'
    },
    {
      title: 'Pending Tasks',
      value: '7',
      icon: Clock,
      color: 'bg-[#f97316]'
    },
    {
      title: 'Active Users',
      value: '24',
      icon: Users,
      color: 'bg-[#10b981]'
    },
    {
      title: 'Completed',
      value: '45',
      icon: CheckCircle,
      color: 'bg-[#a855f7]'
    }
  ];

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Meeting':
        return 'bg-[#3b82f6] hover:bg-[#2563eb]';
      case 'Review':
        return 'bg-[#8b5cf6] hover:bg-[#7c3aed]';
      case 'Planning':
        return 'bg-[#ec4899] hover:bg-[#db2777]';
      default:
        return 'bg-[#3b82f6] hover:bg-[#2563eb]';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const recentReminders = [
    {
      id: '1',
      title: 'Submit quarterly report by Friday',
      time: '2 hours ago',
      type: 'urgent'
    },
    {
      id: '2',
      title: 'Review new course proposals',
      time: '5 hours ago',
      type: 'normal'
    },
    {
      id: '3',
      title: 'Approve faculty leave requests',
      time: '1 day ago',
      type: 'normal'
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a2332]' : 'bg-[#f8f9fa]'} p-8`}>
      <div className="mb-8">
        <h1 className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Welcome back, mohammed</h1>
        <p className={isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}>Here's what's happening with your schedule today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={isDarkMode ? 'bg-[#273446] border-[#3a4556]' : 'bg-white border-[#e5e7eb]'}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>{stat.title}</CardTitle>
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={isDarkMode ? 'text-white text-3xl' : 'text-[#1a1a1a] text-3xl'}>{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className={isDarkMode ? 'bg-[#273446] border-[#3a4556]' : 'bg-white border-[#e5e7eb]'}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Upcoming Meetings - Your scheduled meetings and deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingMeetings.length === 0 ? (
                <div className={`text-center py-12 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming meetings scheduled</p>
                  <p className="text-sm mt-2">Create your first meeting to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className={`rounded-lg p-4 border ${
                        isDarkMode 
                          ? 'bg-[#1f2937] border-[#374151]' 
                          : 'bg-[#f8f9fa] border-[#e5e7eb]'
                      }`}
                    >
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-12 h-12 bg-[#3b82f6] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>{meeting.title}</h3>
                          </div>
                          <div className={`flex flex-col gap-2 text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(meeting.date)} at {formatTime(meeting.time)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {meeting.location}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {meeting.attendees.length > 0 && (
                        <div className={`mt-4 pt-3 border-t ${isDarkMode ? 'border-[#374151]' : 'border-[#e5e7eb]'}`}>
                          <p className={`text-xs mb-2 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>Attendees ({meeting.attendees.length}):</p>
                          <div className="flex flex-wrap gap-2">
                            {meeting.attendees.map((attendee, idx) => (
                              <span key={idx} className={`text-xs px-2 py-1 rounded-full ${
                                isDarkMode ? 'bg-[#0f1621] text-[#8b94a8]' : 'bg-[#f3f4f6] text-[#666666]'
                              }`}>
                                {attendee}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Meetings Section */}
          {pastMeetings.length > 0 && (
            <Card className={`mt-6 ${isDarkMode ? 'bg-[#273446] border-[#3a4556]' : 'bg-white border-[#e5e7eb]'}`}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Past Meetings - Completed meetings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pastMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className={`rounded-lg p-4 border ${
                        isDarkMode 
                          ? 'bg-[#1f2937] border-[#374151] opacity-75' 
                          : 'bg-[#f8f9fa] border-[#e5e7eb] opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-12 h-12 bg-[#6b7280] rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>{meeting.title}</h3>
                          </div>
                          <div className={`flex flex-col gap-2 text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(meeting.date)} at {formatTime(meeting.time)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {meeting.location}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {meeting.attendees.length > 0 && (
                        <div className={`mt-4 pt-3 border-t ${isDarkMode ? 'border-[#374151]' : 'border-[#e5e7eb]'}`}>
                          <p className={`text-xs mb-2 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>Attendees ({meeting.attendees.length}):</p>
                          <div className="flex flex-wrap gap-2">
                            {meeting.attendees.map((attendee, idx) => (
                              <span key={idx} className={`text-xs px-2 py-1 rounded-full ${
                                isDarkMode ? 'bg-[#0f1621] text-[#8b94a8]' : 'bg-[#f3f4f6] text-[#666666]'
                              }`}>
                                {attendee}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className={isDarkMode ? 'bg-[#273446] border-[#3a4556]' : 'bg-white border-[#e5e7eb]'}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Recent Reminders - Important notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-[#1f2937] border-[#374151]' 
                        : 'bg-[#f8f9fa] border-[#e5e7eb]'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      reminder.type === 'urgent' ? 'bg-[#ef4444]' : 'bg-[#f97316]'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>{reminder.title}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>{reminder.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}