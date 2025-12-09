import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ProfilePage } from './ProfilePage';
import { NotificationsPage } from './NotificationsPage';
import { DashboardHome } from './DashboardHome';
import { CreateMeetingPage } from './CreateMeetingPage';
import { ManageSchedulePage } from './ManageSchedulePage';
import { CalendarSyncPage } from './CalendarSyncPage';
import { NotesPage } from './NotesPage';
import { UserManagementPage } from './UserManagementPage';

interface DashboardProps {
  user: {
    name: string;
    email: string;
    department: string;
    phone: string;
  };
  onLogout: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  userType: 'admin' | 'dean' | 'director';
}

export type PageType = 'dashboard' | 'meetings' | 'manage-schedule' | 'calendar' | 'notifications' | 'user-management' | 'notes' | 'profile';

export function Dashboard({ user, onLogout, isDarkMode, setIsDarkMode, userType }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome isDarkMode={isDarkMode} />;
      case 'meetings':
        return <CreateMeetingPage isDarkMode={isDarkMode} />;
      case 'manage-schedule':
        return <ManageSchedulePage isDarkMode={isDarkMode} />;
      case 'calendar':
        return <CalendarSyncPage isDarkMode={isDarkMode} />;
      case 'notifications':
        return <NotificationsPage isDarkMode={isDarkMode} />;
      case 'user-management':
        return <UserManagementPage isDarkMode={isDarkMode} />;
      case 'notes':
        return <NotesPage isDarkMode={isDarkMode} />;
      case 'profile':
        return <ProfilePage user={user} onLogout={onLogout} isDarkMode={isDarkMode} userType={userType} />;
      default:
        return <DashboardHome isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-[#0a0e1a]' : 'bg-[#f8f9fa]'}`}>
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} userType={userType} />
      <div className="flex-1">
        {renderPage()}
      </div>
    </div>
  );
}