import { useState } from 'react';
import { Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { useMeetings, Meeting } from '../contexts/MeetingsContext';

interface ManageSchedulePageProps {
  isDarkMode: boolean;
}

export function ManageSchedulePage({ isDarkMode }: ManageSchedulePageProps) {
  const { meetings, updateMeeting, deleteMeeting } = useMeetings();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [editData, setEditData] = useState({
    title: '',
    date: '',
    time: '',
    location: ''
  });

  const handleDeleteMeeting = (id: string) => {
    deleteMeeting(id);
    toast.success('Meeting deleted successfully');
  };

  const handleEditClick = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setEditData({
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      location: meeting.location
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingMeeting && editData.title && editData.date && editData.time) {
      updateMeeting(editingMeeting.id, editData);
      setIsEditDialogOpen(false);
      setEditingMeeting(null);
      toast.success('Meeting updated successfully');
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'p.m.' : 'a.m.';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0e1a]' : 'bg-[#f8f9fa]'} p-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3b82f6] rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h1 className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Manage Schedules</h1>
        </div>

        {/* Table */}
        <div className={`rounded-lg border overflow-hidden ${
          isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'
        }`}>
          {/* Table Header */}
          <div className={`grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 px-6 py-4 border-b ${
            isDarkMode ? 'bg-[#151d2c] border-[#2a3544]' : 'bg-[#f8f9fa] border-[#e5e7eb]'
          }`}>
            <div className={`text-xs uppercase tracking-wider ${
              isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'
            }`}>
              TITLE
            </div>
            <div className={`text-xs uppercase tracking-wider ${
              isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'
            }`}>
              DATE
            </div>
            <div className={`text-xs uppercase tracking-wider ${
              isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'
            }`}>
              TIME
            </div>
            <div className={`text-xs uppercase tracking-wider ${
              isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'
            }`}>
              ACTIONS
            </div>
          </div>

          {/* Table Body */}
          {meetings.length === 0 ? (
            <div className={`px-6 py-12 text-center ${
              isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'
            }`}>
              No meetings scheduled yet. Create your first meeting!
            </div>
          ) : (
            <div>
              {meetings.map((meeting, index) => (
                <div
                  key={meeting.id}
                  className={`grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 px-6 py-4 items-center ${
                    index !== meetings.length - 1 ? 'border-b' : ''
                  } ${
                    isDarkMode ? 'border-[#2a3544]' : 'border-[#e5e7eb]'
                  } ${
                    isDarkMode ? 'hover:bg-[#1f2937]' : 'hover:bg-[#f8f9fa]'
                  } transition-colors`}
                >
                  {/* Title */}
                  <div className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>
                    {meeting.title}
                  </div>

                  {/* Date */}
                  <div className={`flex items-center gap-2 ${
                    isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'
                  }`}>
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatDate(meeting.date)}</span>
                  </div>

                  {/* Time */}
                  <div className={`flex items-center gap-2 ${
                    isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{formatTime(meeting.time)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(meeting)}
                      className={`text-xs ${
                        isDarkMode 
                          ? 'border-[#2463eb] text-[#2463eb] hover:bg-[#2463eb] hover:text-white bg-transparent' 
                          : 'border-[#2463eb] text-[#2463eb] hover:bg-[#2463eb] hover:text-white'
                      }`}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      className={`text-xs ${
                        isDarkMode 
                          ? 'border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626] hover:text-white bg-transparent' 
                          : 'border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626] hover:text-white'
                      }`}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className={`${
          isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'
        } max-w-md`}>
          <DialogHeader>
            <DialogTitle className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>
              Edit Meeting
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="edit-title" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>
                Meeting Title
              </Label>
              <Input
                id="edit-title"
                placeholder="Enter meeting title"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className={`mt-2 ${
                  isDarkMode 
                    ? 'bg-[#0f1621] border-[#2a3544] text-white'
                    : 'bg-white border-[#d1d5db] text-[#1a1a1a]'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>
                  Date
                </Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editData.date}
                  onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                  className={`mt-2 ${
                    isDarkMode 
                      ? 'bg-[#0f1621] border-[#2a3544] text-white'
                      : 'bg-white border-[#d1d5db] text-[#1a1a1a]'
                  }`}
                />
              </div>

              <div>
                <Label htmlFor="edit-time" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>
                  Time
                </Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={editData.time}
                  onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                  className={`mt-2 ${
                    isDarkMode 
                      ? 'bg-[#0f1621] border-[#2a3544] text-white'
                      : 'bg-white border-[#d1d5db] text-[#1a1a1a]'
                  }`}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-location" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>
                Location
              </Label>
              <Input
                id="edit-location"
                placeholder="Enter meeting location"
                value={editData.location}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                className={`mt-2 ${
                  isDarkMode 
                    ? 'bg-[#0f1621] border-[#2a3544] text-white'
                    : 'bg-white border-[#d1d5db] text-[#1a1a1a]'
                }`}
              />
            </div>

            <Button
              onClick={handleSaveEdit}
              className="w-full bg-[#2463eb] hover:bg-[#1d4ed8] text-white"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
