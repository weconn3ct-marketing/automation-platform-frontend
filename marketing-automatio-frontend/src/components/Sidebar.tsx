import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, Calendar, History, Link2, Settings, LogOut, ChevronRight, Zap, LayoutGrid, ClipboardList } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: PlusCircle, label: 'Create Post', path: '/dashboard/create' },
  { icon: LayoutGrid, label: 'Social Posts', path: '/dashboard/social-posts' },
  { icon: Calendar, label: 'Calendar', path: '/dashboard/calendar' },
  { icon: History, label: 'History', path: '/dashboard/history' },
  { icon: Link2, label: 'Accounts', path: '/dashboard/accounts' },
  { icon: ClipboardList, label: 'Activity Log', path: '/dashboard/audit' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];


export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { success } = useToastStore();

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
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-700 to-purple-700 text-white shadow-md shadow-indigo-200'
                  : 'text-gray-600 hover:bg-indigo-100 hover:text-indigo-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`} />
                <span className="font-medium">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={16} className="text-white" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        {/* Settings shortcut */}
        <button
          onClick={() => navigate('/dashboard/settings')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
            location.pathname === '/dashboard/settings'
              ? 'bg-gradient-to-r from-indigo-700 to-purple-700 text-white'
              : 'text-gray-600 hover:bg-indigo-100 hover:text-indigo-700'
          }`}
        >
          <Settings size={18} />
          <span className="font-medium text-sm">Settings</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};