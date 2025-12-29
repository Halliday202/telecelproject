import React from 'react';
import { LogOut, LayoutDashboard, User as UserIcon, Settings, Users, MonitorSmartphone, Activity, Sun, Moon } from 'lucide-react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  onLogout, 
  currentView, 
  onNavigate,
  darkMode,
  toggleDarkMode
}) => {
  const isAdmin = user.role === UserRole.ADMIN;

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => (
    <button
      onClick={() => onNavigate(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        currentView === view
          ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-l-4 border-red-600 dark:border-red-500'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200 border-l-4 border-transparent'
      }`}
    >
      <Icon className={`w-5 h-5 ${currentView === view ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar */}
      <aside className={`border-b md:border-b-0 md:border-r w-full md:w-72 flex-shrink-0 md:h-screen sticky top-0 md:flex md:flex-col z-20 transition-colors duration-200 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`p-5 border-b flex items-center justify-between ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center space-x-3 text-red-600 dark:text-red-500">
            <div className="bg-red-600 dark:bg-red-500/20 p-2 rounded-lg">
              <MonitorSmartphone className="w-6 h-6 text-white dark:text-red-500" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Telecel</span>
          </div>
          {/* Mobile Toggle */}
           <button
            onClick={toggleDarkMode}
            className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
        </div>

        <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
           <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Appearance</span>
           <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                darkMode ? 'bg-slate-700' : 'bg-slate-300'
              }`}
            >
              <span
                className={`${
                  darkMode ? 'translate-x-6 bg-slate-900' : 'translate-x-1 bg-white'
                } inline-block h-4 w-4 transform rounded-full shadow transition duration-200 ease-in-out flex items-center justify-center`}
              >
                 {darkMode ? <Moon size={10} className="text-slate-400" /> : <Sun size={10} className="text-amber-500" />}
              </span>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {isAdmin ? (
            <>
              <div className="px-4 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Administration</div>
              <NavItem view="admin-dashboard" icon={LayoutDashboard} label="Ticket Board" />
              <NavItem view="admin-users" icon={Users} label="User Management" />
            </>
          ) : (
            <>
              <div className="px-4 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Dashboard</div>
              <NavItem view="user-dashboard" icon={LayoutDashboard} label="My Tickets" />
              <NavItem view="user-create-ticket" icon={Activity} label="New Ticket" />
              <div className="mt-8 px-4 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account</div>
              <NavItem view="user-settings" icon={Settings} label="Settings" />
            </>
          )}
        </div>

        <div className={`p-4 border-t ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50/30'}`}>
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-sm shadow-sm">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className={`text-sm font-semibold truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{user.fullName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 truncate capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};