import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  duration: string;
  attendees: string[];
  agendaFile?: string;
  createdAt: Date;
}

interface MeetingsContextType {
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt'>) => void;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
}

const MeetingsContext = createContext<MeetingsContextType | undefined>(undefined);

export function MeetingsProvider({ children }: { children: ReactNode }) {
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem('rsdd-meetings');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // If no stored meetings, add default past meetings
    const now = new Date();
    const defaultMeetings: Meeting[] = [
      {
        id: 'past-1',
        title: 'Academic Year Planning Meeting',
        date: new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString().split('T')[0],
        time: '10:00',
        location: 'Conference Room A',
        duration: '2 hours',
        attendees: ['Dr. Ahmed Hassan', 'Dr. Sarah Ali', 'Dr. Omar Yilmaz', 'Prof. Ayse Demir'],
        createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 10)
      },
      {
        id: 'past-2',
        title: 'Budget Review and Allocation',
        date: new Date(now.getFullYear(), now.getMonth() - 1, 20).toISOString().split('T')[0],
        time: '14:30',
        location: 'Dean\'s Office',
        duration: '1.5 hours',
        attendees: ['Finance Director', 'Dr. Mehmet Kaya', 'Accounting Manager'],
        createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 18)
      },
      {
        id: 'past-3',
        title: 'Faculty Performance Assessment',
        date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString().split('T')[0],
        time: '09:00',
        location: 'Meeting Room B',
        duration: '3 hours',
        attendees: ['Dr. Fatma Celik', 'Dr. Ibrahim Yildirim', 'HR Manager', 'Department Heads'],
        createdAt: new Date(now.getFullYear(), now.getMonth(), 1)
      }
    ];
    
    return defaultMeetings;
  });

  // Save to localStorage whenever meetings change
  useEffect(() => {
    localStorage.setItem('rsdd-meetings', JSON.stringify(meetings));
  }, [meetings]);

  const addMeeting = (meeting: Omit<Meeting, 'id' | 'createdAt'>) => {
    const newMeeting: Meeting = {
      ...meeting,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setMeetings(prev => [...prev, newMeeting]);
  };

  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    setMeetings(prev => 
      prev.map(m => m.id === id ? { ...m, ...updates } : m)
    );
  };

  const deleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  return (
    <MeetingsContext.Provider value={{ meetings, addMeeting, updateMeeting, deleteMeeting }}>
      {children}
    </MeetingsContext.Provider>
  );
}

export function useMeetings() {
  const context = useContext(MeetingsContext);
  if (!context) {
    throw new Error('useMeetings must be used within MeetingsProvider');
  }
  return context;
}