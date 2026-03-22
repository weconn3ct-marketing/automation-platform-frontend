import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, Calendar, History, Bell, Link2, Settings, LogOut, ChevronRight, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { api } from '../services/apiClient';
import { API_ENDPOINTS } from '../lib/constants';
import { authStorage } from '../lib/storage';
import type { AppNotification } from '../types';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: PlusCircle, label: 'Create Post', path: '/dashboard/create' },
  { icon: Calendar, label: 'Calendar', path: '/dashboard/calendar' },
  { icon: Bell, label: 'Notifications', path: '/dashboard/history' },
  { icon: History, label: 'History', path: '/dashboard/history' },
  { icon: Link2, label: 'Accounts', path: '/dashboard/accounts' },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { success } = useToastStore();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      setUnreadNotifications(0);
      return;
    }

    let isActive = true;

    const fetchUnreadNotifications = async () => {
      try {
        const response = await api.get<AppNotification[]>(API_ENDPOINTS.NOTIFICATIONS.LIST);
        if (!isActive) return;

        const unreadCount = response.data.filter((notification) => !notification.read).length;
        setUnreadNotifications(unreadCount);
      } catch {
        if (!isActive) return;
        setUnreadNotifications(0);
      }
    };

    void fetchUnreadNotifications();
    const intervalId = window.setInterval(() => {
      void fetchUnreadNotifications();
    }, 30000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const handleLogout = () => {
    logout();
    success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              WeConnect
            </span>
            <p className="text-xs text-gray-500">AI Automation</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isNotificationsItem = item.label === 'Notifications';
          const badge = isNotificationsItem && unreadNotifications > 0
            ? unreadNotifications > 99
              ? '99+'
              : unreadNotifications.toString()
            : null;
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className={`${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {badge && (
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    isActive 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {badge}
                  </span>
                )}
                {isActive && <ChevronRight size={16} className="text-indigo-600" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        {/* Settings */}
        <button
          onClick={() => navigate('/dashboard/accounts')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
        >
          <Settings size={18} />
          <span className="font-medium text-sm">Settings</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};