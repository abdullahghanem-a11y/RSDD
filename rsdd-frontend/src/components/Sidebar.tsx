import { LayoutDashboard, Calendar, CalendarClock, Bell, User, GraduationCap, Moon, Sun, FileText, CalendarCheck, Users } from 'lucide-react';
import { PageType } from './Dashboard';
import { Button } from './ui/button';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  userType: 'admin' | 'dean' | 'director';
}

export function Sidebar({ currentPage, onPageChange, isDarkMode, setIsDarkMode, userType }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings' as PageType, label: 'Meetings', icon: Calendar },
    { id: 'manage-schedule' as PageType, label: 'Manage Schedule', icon: CalendarCheck },
    { id: 'calendar' as PageType, label: 'Calendar Sync', icon: CalendarClock },
    { id: 'notifications' as PageType, label: 'Notifications', icon: Bell },
    ...(userType === 'admin' ? [{ id: 'user-management' as PageType, label: 'User Management', icon: Users }] : []),
    { id: 'notes' as PageType, label: 'Notes', icon: FileText },
    { id: 'profile' as PageType, label: 'Profile', icon: User },
  ];

  return (
    <div className={`w-64 ${isDarkMode ? 'bg-[#0d1117] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'} border-r flex flex-col`}>
      <div className={`p-4 border-b ${isDarkMode ? 'border-[#2a3544]' : 'border-[#e5e7eb]'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2463eb] rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>RSDD</h2>
            <p className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>University System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-[#2463eb] text-white'
                  : isDarkMode 
                    ? 'text-[#8b94a8] hover:bg-[#1a2332] hover:text-white'
                    : 'text-[#666666] hover:bg-[#f3f4f6] hover:text-[#1a1a1a]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={`p-3 border-t ${isDarkMode ? 'border-[#2a3544]' : 'border-[#e5e7eb]'}`}>
        <Button
          onClick={() => setIsDarkMode(!isDarkMode)}
          variant="outline"
          className={`w-full ${
            isDarkMode 
              ? 'border-[#2a3544] text-[#8b94a8] hover:bg-[#1a2332] hover:text-white' 
              : 'border-[#e5e7eb] text-[#666666] hover:bg-[#f3f4f6] hover:text-[#1a1a1a]'
          }`}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 mr-2" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-2" />
              Dark Mode
            </>
          )}
        </Button>
      </div>
    </div>
  );
}