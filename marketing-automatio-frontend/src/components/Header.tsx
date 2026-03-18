import { useEffect, useMemo, useState } from 'react';
import { Bell, Search, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { getInitials } from '../lib/utils';
import { API_BASE_URL, API_ENDPOINTS } from '../lib/constants';
import { authStorage } from '../lib/storage';
import { api } from '../services/apiClient';
import type { AppNotification } from '../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
}

export const Header = ({ title, subtitle, showSearch = true }: HeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [isNotificationsConnected, setIsNotificationsConnected] = useState(false);
  
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { success, info } = useToastStore();

  const handleLogout = () => {
    logout();
    success('Logged out successfully');
    navigate('/login');
  };

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) return;

    let isActive = true;

    const fetchNotifications = async () => {
      setIsNotificationsLoading(true);
      try {
        const response = await api.get<AppNotification[]>(API_ENDPOINTS.NOTIFICATIONS.LIST);
        if (!isActive) return;
        setNotifications(response.data);
      } catch {
        if (!isActive) return;
      } finally {
        if (isActive) {
          setIsNotificationsLoading(false);
        }
      }
    };

    void fetchNotifications();

    const streamUrl = `${API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS.STREAM}?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(streamUrl);

    eventSource.onopen = () => {
      if (!isActive) return;
      setIsNotificationsConnected(true);
    };

    eventSource.addEventListener('connected', () => {
      if (!isActive) return;
      setIsNotificationsConnected(true);
    });

    eventSource.addEventListener('notification', (event) => {
      if (!isActive) return;

      try {
        const nextNotification = JSON.parse(event.data) as AppNotification;

        setNotifications((previous) => {
          const deduped = previous.filter((item) => item.id !== nextNotification.id);
          return [nextNotification, ...deduped].slice(0, 100);
        });

        info(nextNotification.message, 4000);
      } catch {
        // Ignore invalid SSE payloads
      }
    });

    eventSource.onerror = () => {
      if (!isActive) return;
      setIsNotificationsConnected(false);
    };

    return () => {
      isActive = false;
      setIsNotificationsConnected(false);
      eventSource.close();
    };
  }, [info]);

  const handleNotificationClick = async (notificationId: string) => {
    const target = notifications.find((item) => item.id === notificationId);
    if (!target || target.read) return;

    setNotifications((previous) =>
      previous.map((item) => (item.id === notificationId ? { ...item, read: true } : item))
    );

    try {
      await api.patch(API_ENDPOINTS.NOTIFICATIONS.READ(notificationId));
    } catch {
      setNotifications((previous) =>
        previous.map((item) => (item.id === notificationId ? { ...item, read: false } : item))
      );
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((notification) => !notification.read).map((notification) => notification.id);
    if (unreadIds.length === 0) return;

    setNotifications((previous) => previous.map((item) => ({ ...item, read: true })));

    try {
      await api.post(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
    } catch {
      setNotifications((previous) =>
        previous.map((item) =>
          unreadIds.includes(item.id) ? { ...item, read: false } : item
        )
      );
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Title */}
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
          </div>

          {/* Center Section - Search */}
          {showSearch && (
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search posts, accounts, or analytics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-20 animate-fade-in">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {isNotificationsConnected ? 'Live updates connected' : 'Live updates reconnecting...'}
                          </p>
                        </div>
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Mark all read
                        </button>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {isNotificationsLoading ? (
                        <div className="p-4 text-sm text-gray-500">Loading notifications...</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">No notifications yet</div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification.id)}
                            className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                              !notification.read ? 'bg-indigo-50/50' : ''
                            }`}
                          >
                            <p className="text-sm font-semibold text-gray-900 mb-1">{notification.title}</p>
                            <p className="text-sm text-gray-700 mb-1">{notification.message}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">Marketing Team</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                  {user ? getInitials(`${user.firstName} ${user.lastName}`) : 'U'}
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-20 animate-fade-in">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/dashboard/accounts');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User size={16} />
                        <span>Your Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/dashboard/accounts');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </button>
                    </div>

                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};