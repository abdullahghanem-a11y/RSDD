import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { Toaster } from './components/ui/sonner';
import { MeetingsProvider } from './contexts/MeetingsContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { UserProvider } from './contexts/UserContext';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    department: string;
    phone: string;
    userType: 'admin' | 'dean' | 'director';
  } | null>(null);

  const handleLogin = (username: string, password: string, userType: 'admin' | 'dean' | 'director') => {
    // Mock login - in real app, this would validate credentials
    setCurrentUser({
      name: username,
      email: username,
      department: 'Computer Science',
      phone: '+1 (555) 123-4567',
      userType: userType
    });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <UserProvider initialUser={{ name: currentUser!.name, email: currentUser!.email }}>
      <NotificationsProvider>
        <MeetingsProvider>
          <Dashboard user={currentUser!} onLogout={handleLogout} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} userType={currentUser!.userType} />
          <Toaster />
        </MeetingsProvider>
      </NotificationsProvider>
    </UserProvider>
  );
}