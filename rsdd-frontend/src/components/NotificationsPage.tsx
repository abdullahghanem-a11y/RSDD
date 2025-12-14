import { useState } from 'react';
import { Calendar, CheckCircle2, MessageSquare, Trash2, Bell } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useNotifications } from '../contexts/NotificationsContext';

interface NotificationsPageProps {
  isDarkMode: boolean;
}

export function NotificationsPage({ isDarkMode }: NotificationsPageProps) {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Calendar className="w-5 h-5 text-white" />;
      case 'reminder':
        return <CheckCircle2 className="w-5 h-5 text-white" />;
      case 'system':
        return <Bell className="w-5 h-5 text-white" />;
      default:
        return <Calendar className="w-5 h-5 text-white" />;
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-[#2463eb]';
      case 'reminder':
        return 'bg-[#f97316]';
      case 'system':
        return 'bg-[#10b981]';
      default:
        return 'bg-[#2463eb]';
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-[#2463eb] hover:bg-[#1d4ed8]';
      case 'reminder':
        return 'bg-[#f97316] hover:bg-[#ea580c]';
      case 'system':
        return 'bg-[#10b981] hover:bg-[#059669]';
      default:
        return 'bg-[#2463eb] hover:bg-[#1d4ed8]';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const readCount = notifications.filter(n => n.read).length;

  const formatTimeAgo = (time: Date) => {
    const now = new Date();
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  return (
    <div className={`p-8 min-h-screen ${isDarkMode ? 'bg-[#0a0e1a]' : 'bg-[#f8f9fa]'}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Notifications Center</h1>
          <p className={isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}>Stay updated with important alerts and reminders</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}>{unreadCount} unread</span>
          <Button
            onClick={markAllAsRead}
            variant="ghost"
            className={isDarkMode 
              ? 'text-[#2463eb] hover:text-[#1d4ed8] hover:bg-[#1a2332]'
              : 'text-[#2463eb] hover:text-[#1d4ed8] hover:bg-[#f3f4f6]'
            }
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        </div>
      </div>

      <div className="max-w-5xl">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? isDarkMode ? 'text-white' : 'text-[#1a1a1a]'
                : isDarkMode ? 'text-[#8b94a8] hover:text-white' : 'text-[#666666] hover:text-[#1a1a1a]'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'unread'
                ? isDarkMode ? 'text-white' : 'text-[#1a1a1a]'
                : isDarkMode ? 'text-[#8b94a8] hover:text-white' : 'text-[#666666] hover:text-[#1a1a1a]'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'read'
                ? isDarkMode ? 'text-white' : 'text-[#1a1a1a]'
                : isDarkMode ? 'text-[#8b94a8] hover:text-white' : 'text-[#666666] hover:text-[#1a1a1a]'
            }`}
          >
            Read ({readCount})
          </button>
        </div>

        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className={`rounded-lg p-12 border text-center ${
              isDarkMode 
                ? 'bg-[#1a2332] border-[#2a3544]' 
                : 'bg-white border-[#e5e7eb]'
            }`}>
              <Bell className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`} />
              <p className={isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}>
                No notifications to display
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg p-4 border flex items-start gap-4 ${
                  isDarkMode 
                    ? 'bg-[#1a2332] border-[#2a3544]' 
                    : 'bg-white border-[#e5e7eb]'
                } ${!notification.read ? 'border-l-4 border-l-[#2463eb]' : ''}`}
              >
                <div className={`w-10 h-10 ${getIconBgColor(notification.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`mb-1 ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'} ${!notification.read ? 'font-semibold' : ''}`}>
                    {notification.title}
                  </h3>
                  <p className={`mb-2 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                    {notification.message}
                  </p>
                  <span className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                    {formatTimeAgo(notification.time)}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={`${getBadgeColor(notification.type)} text-white capitalize`}>
                    {notification.type}
                  </Badge>
                  {!notification.read && (
                    <Button
                      onClick={() => markAsRead(notification.id)}
                      variant="ghost"
                      size="sm"
                      className={isDarkMode 
                        ? 'text-[#8b94a8] hover:text-white hover:bg-[#0f1621]'
                        : 'text-[#666666] hover:text-[#1a1a1a] hover:bg-[#f3f4f6]'
                      }
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Mark as read
                    </Button>
                  )}
                  <Button
                    onClick={() => deleteNotification(notification.id)}
                    variant="ghost"
                    size="sm"
                    className={isDarkMode 
                      ? 'text-[#8b94a8] hover:text-[#dc2626] hover:bg-[#0f1621]'
                      : 'text-[#666666] hover:text-[#dc2626] hover:bg-[#fef2f2]'
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
