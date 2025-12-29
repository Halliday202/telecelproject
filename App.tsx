import React, { useState, useEffect, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { User, Ticket, UserRole, TicketStatus } from './types';
import { Layout } from './components/Layout';
import { Button } from './components/Button';
import { Input, TextArea } from './components/Input';
import { StatusBadge } from './components/StatusBadge';
import { ChatWindow } from './components/ChatWindow';
// ✅ FIXED: Only import Backend from mockBackend (which now talks to server.ts)
import { Backend } from './services/mockBackend';
import {
  Search,
  Plus,
  FileText,
  Send,
  Image as ImageIcon,
  Mail,
  MonitorSmartphone,
  MessageSquare,
  UserPlus,
  Key,
  ShieldAlert,
  Moon,
  Sun,
  Briefcase,
  Hash,
  Building,
  Sparkles,
  Lock,
  Filter,
  WifiOff
} from 'lucide-react';

// --- Sound Utility ---
const playNotificationSound = () => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  oscillator.start();
  setTimeout(() => oscillator.stop(), 200);
};

// --- Toast Component ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'info' | 'error' | 'warning', onClose: () => void }) => (
  <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-2xl border-l-4 z-50 animate-fade-in-up flex items-center space-x-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-white ${type === 'success' ? 'border-emerald-500' :
    type === 'error' ? 'border-red-500' :
      type === 'warning' ? 'border-amber-500' :
        'border-blue-500'
    }`}>
    <div className={`p-2 rounded-full ${type === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
      type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
        type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
          'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
      }`}>
      {type === 'success' ? <div className="w-4 h-4">✓</div> :
        type === 'error' ? <ShieldAlert className="w-4 h-4" /> :
          type === 'warning' ? <WifiOff className="w-4 h-4" /> :
            <Mail className="w-4 h-4" />}
    </div>
    <div>
      <h4 className="font-semibold text-sm capitalize">{type === 'info' ? 'Notification' : type}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>
    </div>
    <button onClick={onClose} className="ml-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">×</button>
  </div>
);

const App: React.FC = () => {
  // --- Global State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Theme State
  const [darkMode, setDarkMode] = useState(false);

  // Navigation & View State
  const [currentView, setCurrentView] = useState('login');
  const [activeTab, setActiveTab] = useState<TicketStatus | 'ALL'>(TicketStatus.PENDING);

  // Forms & Inputs
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [ticketForm, setTicketForm] = useState({ title: '', description: '', department: '' });
  const [ticketFile, setTicketFile] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  // Admin: User Management State
  const [newUserForm, setNewUserForm] = useState({ username: '', fullName: '', email: '', department: '', role: UserRole.USER });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Admin: AI Analysis State
  const [analysisResults, setAnalysisResults] = useState<Record<string, string>>({});
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({});

  // User: Settings State
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });

  // Notifications
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' | 'error' | 'warning' } | null>(null);

  // Chat
  const [activeChatTicketId, setActiveChatTicketId] = useState<string | null>(null);

  // --- Initial Data Load ---
  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, [currentUser]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const refreshData = async () => {
    const loadedUsers = await Backend.getUsers();
    const loadedTickets = await Backend.getTickets();
    setUsers(loadedUsers);
    setTickets(loadedTickets);
  };

  // --- Handlers ---

  // ✅ FIXED: The Login Logic is now correctly placed inside the component
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(''); // Clear errors
    setIsLoggingIn(true); // Show loading spinner

    try {
      // ✅ We use 'loginUsername' and 'loginPassword' which are defined above
      const user = await Backend.login(loginUsername, loginPassword);

      if (user) {
        // Success!
        setCurrentUser(user);
        // Redirect based on role
        if (user.role === UserRole.ADMIN) {
          setCurrentView('admin-dashboard');
        } else {
          setCurrentView('user-dashboard');
        }
      } else {
        setLoginError('Invalid username or password');
      }
    } catch (err) {
      setLoginError('Something went wrong. Is the server running?');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    setActiveChatTicketId(null);
    setAnalysisResults({});
    setLoginUsername('');
    setLoginPassword('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTicketFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ ADDED: Missing ticket submission handler
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await Backend.createTicket({
        userId: currentUser.id,
        title: ticketForm.title,
        description: ticketForm.description,
        department: ticketForm.department,
        screenshotUrl: ticketFile || undefined
      });

      await refreshData();
      setTicketForm({ title: '', description: '', department: '' });
      setTicketFile(null);
      setCurrentView('user-dashboard');
      showToast('Ticket created successfully', 'success');
    } catch (error) {
      showToast('Failed to create ticket', 'error');
    }
  };

  // ✅ ADDED: Missing status change handler
  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    await Backend.updateTicketStatus(ticketId, newStatus);
    await refreshData();
    showToast(`Ticket status updated to ${newStatus}`, 'info');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Passwords do not match", 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast("Password must be at least 6 characters", 'error');
      return;
    }
    if (currentUser) {
      await Backend.changePassword(currentUser.id, passwordForm.newPassword);
      showToast("Password updated successfully", 'success');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdUser = await Backend.createUser({
        ...newUserForm,
        password: 'password123',
      });
      await refreshData();
      setIsCreatingUser(false);
      setNewUserForm({ username: '', fullName: '', email: '', department: '', role: UserRole.USER });
      showToast(`User created. ID: ${createdUser.id}`, 'success');
    } catch (err: any) {
      showToast("Failed to create user", 'error');
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (confirm('Are you sure you want to reset this user\'s password?')) {
      const tempPass = await Backend.resetPassword(userId);
      await refreshData();
      alert(`Password reset. Temporary password: ${tempPass}`);
    }
  };

  // --- Derived Data ---
  const filteredTickets = useMemo(() => {
    if (!currentUser) return [];
    let list = tickets;

    if (currentUser.role === UserRole.USER) {
      list = list.filter(t => t.userId === currentUser.id);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(lowerTerm) ||
        t.id.includes(lowerTerm) ||
        (currentUser.role === UserRole.ADMIN && users.find(u => u.id === t.userId)?.username.includes(lowerTerm))
      );
    }

    if (currentUser.role === UserRole.ADMIN && activeTab !== 'ALL') {
      list = list.filter(t => t.status === activeTab);
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tickets, currentUser, searchTerm, activeTab, users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.includes(searchTerm) ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const getFirstName = (fullName: string) => fullName.split(' ')[0];

  // --- Views ---

  if (!currentUser || currentView === 'login') {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
        <div className={`max-w-md w-full rounded-2xl shadow-xl p-8 space-y-8 border transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
          <div className="flex justify-between items-start">
            <div className="flex-1 text-center">
              <div className="bg-gradient-to-br from-red-600 to-red-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/20">
                <MonitorSmartphone className="text-white w-9 h-9" />
              </div>
              <h2 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Telecel Support</h2>
              <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Sign in to your account</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`ml-2 p-2 rounded-full transition-colors ${darkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Username"
              value={loginUsername}
              onChange={e => setLoginUsername(e.target.value)}
              placeholder="Enter your username"
            />
            <Input
              label="Password"
              type="password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              placeholder="Enter your password"
            />

            {loginError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg flex items-center border border-red-200 dark:border-red-800/50">
                <ShieldAlert className="w-4 h-4 mr-2" /> {loginError}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-red-500/20" isLoading={isLoggingIn}>Sign In</Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">Default Credentials:</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Admin: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">admin</span> / <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">admin123</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout
      user={currentUser}
      onLogout={handleLogout}
      currentView={currentView}
      onNavigate={setCurrentView}
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {activeChatTicketId && (
        <ChatWindow
          ticketId={activeChatTicketId}
          ticketTitle={tickets.find(t => t.id === activeChatTicketId)?.title || ''}
          currentUser={currentUser}
          onClose={() => setActiveChatTicketId(null)}
          onNewMessage={playNotificationSound}
        />
      )}

      {/* --- USER DASHBOARD --- */}
      {currentView === 'user-dashboard' && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Welcome, {getFirstName(currentUser.fullName)}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your support tickets and status.</p>
            </div>
            <Button onClick={() => setCurrentView('user-create-ticket')} className="shadow-lg shadow-red-500/20">
              <Plus className="w-5 h-5 mr-2" /> New Ticket
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTickets.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No tickets found</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">You haven't submitted any tickets yet.</p>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div key={ticket.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">#{ticket.id}</span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{ticket.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 flex-grow leading-relaxed">{ticket.description}</p>

                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    {ticket.status !== TicketStatus.RESOLVED && (
                      <button
                        onClick={() => setActiveChatTicketId(ticket.id)}
                        className="flex items-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 mr-1.5" /> Chat
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- USER SETTINGS --- */}
      {currentView === 'user-settings' && currentUser && (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your profile and security preferences.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 text-3xl font-bold border border-red-100 dark:border-red-900/50">
                {currentUser.fullName.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-center sm:text-left pt-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{currentUser.fullName}</h3>
                <div className="flex items-center justify-center sm:justify-start space-x-2 mt-1">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {currentUser.role}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">•</span>
                  <span className="text-slate-500 dark:text-slate-400">{currentUser.email}</span>
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Profile Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-500 block mb-1">Department</label>
                    <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200 font-medium">
                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                      </div>
                      <span>{currentUser.department}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-500 block mb-1">Company ID</label>
                    <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200 font-medium">
                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                        <Building className="w-4 h-4 text-slate-400" />
                      </div>
                      <span>{currentUser.companyId || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">System Info</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-500 block mb-1">System User ID</label>
                    <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200 font-medium">
                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                        <Hash className="w-4 h-4 text-slate-400" />
                      </div>
                      <span>{currentUser.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update your password to keep your account safe.</p>
              </div>
            </div>
            <div className="p-8">
              <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-md">
                <Input
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  placeholder="••••••••"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  placeholder="••••••••"
                />
                <div className="pt-2">
                  <Button type="submit">Update Password</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {currentView === 'user-create-ticket' && (
        <div className="max-w-2xl mx-auto animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Submit a Complaint</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Describe the issue you are facing and we will assist you.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSubmitTicket} className="space-y-6">
              <Input
                label="Subject"
                placeholder="e.g. Cannot access CRM System"
                value={ticketForm.title}
                onChange={e => setTicketForm({ ...ticketForm, title: e.target.value })}
                required
              />
              <Input
                label="Department"
                placeholder="e.g. Sales"
                value={ticketForm.department}
                onChange={e => setTicketForm({ ...ticketForm, department: e.target.value })}
              />
              <TextArea
                label="Description"
                rows={5}
                placeholder="Please provide detailed information about the issue..."
                value={ticketForm.description}
                onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Screenshot (Optional)</label>
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative group">
                  <div className="space-y-2 text-center">
                    {ticketFile ? (
                      <div className="relative">
                        <img src={ticketFile} alt="Preview" className="mx-auto h-40 object-contain rounded-lg shadow-sm" />
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); setTicketFile(null); }}
                          className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors">
                          <ImageIcon className="h-full w-full" />
                        </div>
                        <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, GIF up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="secondary" onClick={() => setCurrentView('user-dashboard')}>Cancel</Button>
                <Button type="submit" className="w-32 shadow-lg shadow-red-500/20">
                  <Send className="w-4 h-4 mr-2" /> Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADMIN DASHBOARD --- */}
      {currentView === 'admin-dashboard' && currentUser.role === UserRole.ADMIN && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Support Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monitor and manage support tickets.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tickets by ID or title..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-900 dark:text-white shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-800">
            <nav className="-mb-px flex space-x-6">
              {[TicketStatus.PENDING, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED].map((status) => {
                const isActive = activeTab === status;
                return (
                  <button
                    key={status}
                    onClick={() => setActiveTab(status)}
                    className={`
                      whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center
                      ${isActive
                        ? (status === TicketStatus.PENDING ? 'border-red-500 text-red-600 dark:text-red-400' :
                          status === TicketStatus.IN_PROGRESS ? 'border-amber-500 text-amber-600 dark:text-amber-400' :
                            'border-emerald-500 text-emerald-600 dark:text-emerald-400')
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'}
                    `}
                  >
                    {status === TicketStatus.PENDING ? 'Pending' : status === TicketStatus.IN_PROGRESS ? 'In Progress' : 'Resolved'}
                    <span className={`ml-2.5 py-0.5 px-2.5 rounded-full text-xs font-semibold ${isActive
                      ? (status === TicketStatus.PENDING ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                        status === TicketStatus.IN_PROGRESS ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300')
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {tickets.filter(t => t.status === status).length}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ticket Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Requester</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredTickets.map(ticket => {
                    const requester = users.find(u => u.id === ticket.userId);
                    return (
                      <React.Fragment key={ticket.id}>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">{ticket.title}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded w-fit">#{ticket.id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 mr-3">
                                {requester?.fullName.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-900 dark:text-white">{requester?.fullName || 'Unknown'}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{ticket.department}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={ticket.status}
                              onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                              className={`text-xs font-medium border-none rounded-full px-3 py-1 pr-8 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:outline-none appearance-none transition-colors
                                ${ticket.status === TicketStatus.PENDING ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 focus:ring-red-500' :
                                  ticket.status === TicketStatus.IN_PROGRESS ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 focus:ring-amber-500' :
                                    'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 focus:ring-emerald-500'}
                              `}
                              style={{ backgroundImage: 'none' }}
                            >
                              <option value={TicketStatus.PENDING}>Pending</option>
                              <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                              <option value={TicketStatus.RESOLVED}>Resolved</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center space-x-2">
                            {ticket.status === TicketStatus.IN_PROGRESS && (
                              <Button size="sm" variant="secondary" onClick={() => setActiveChatTicketId(ticket.id)} title="Chat" className="h-8 w-8 p-0 flex items-center justify-center rounded-full">
                                <MessageSquare className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                              onClick={() => {
                                const el = document.getElementById(`details-${ticket.id}`);
                                if (el) el.classList.toggle('hidden');
                              }}
                            >
                              Details
                            </Button>
                          </td>
                        </tr>
                        <tr id={`details-${ticket.id}`} className="hidden bg-slate-50/50 dark:bg-slate-900/50 border-t border-b border-slate-100 dark:border-slate-800">
                          <td colSpan={5} className="px-6 py-6">
                            <div className="flex flex-col md:flex-row gap-8">
                              <div className="flex-1 space-y-4">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Issue Description</h4>
                                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed shadow-sm">
                                    {ticket.description}
                                  </p>
                                </div>
                                {ticket.screenshotUrl && (
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Attachment</h4>
                                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-950 inline-block shadow-sm">
                                      <img src={ticket.screenshotUrl} alt="Screenshot" className="max-h-64 rounded" />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* AI Analysis Section */}
                              <div className="md:w-80 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 h-fit shadow-sm">
                                <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
                                  <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-md">
                                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Assistant</h4>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredTickets.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                <Filter className="w-10 h-10 mb-3 opacity-20" />
                <p>No tickets found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- ADMIN USER MANAGEMENT --- */}
      {currentView === 'admin-users' && currentUser.role === UserRole.ADMIN && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Add and manage system users.</p>
            </div>
            <Button onClick={() => setIsCreatingUser(true)}>
              <UserPlus className="w-4 h-4 mr-2" /> Create User
            </Button>
          </div>

          {/* User Creation Modal/Form Area */}
          {isCreatingUser && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg mb-6 animate-fade-in-up">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-lg mr-2">
                  <UserPlus className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                Create New Employee
              </h3>
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Full Name" required value={newUserForm.fullName} onChange={e => setNewUserForm({ ...newUserForm, fullName: e.target.value })} placeholder="John Doe" />
                <Input label="Username" required value={newUserForm.username} onChange={e => setNewUserForm({ ...newUserForm, username: e.target.value })} placeholder="jdoe" />
                <Input label="Email" type="email" required value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} placeholder="john@company.com" />
                <Input label="Department" required value={newUserForm.department} onChange={e => setNewUserForm({ ...newUserForm, department: e.target.value })} placeholder="Sales" />
                <div className="md:col-span-2 flex justify-end space-x-3 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button type="button" variant="secondary" onClick={() => setIsCreatingUser(false)}>Cancel</Button>
                  <Button type="submit">Create User</Button>
                </div>
              </form>
            </div>
          )}

          {/* User List */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User Details</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 mr-3 border border-slate-200 dark:border-slate-700">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">{u.fullName}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${u.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/50' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500 dark:text-slate-500">{u.id}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleResetPassword(u.id)}
                        title="Reset Password"
                        className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                      >
                        <Key className="w-4 h-4 mr-1" /> Reset Pass
                      </Button>
                      {/* NEW DELETE BUTTON */}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete ${u.fullName}?`)) {
                            await Backend.deleteUser(u.id); // Call the new backend function
                            refreshData(); // Refresh the list instantly
                            showToast('User deleted successfully', 'success');
                          }
                        }}
                        title="Delete User"
                        className="ml-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                      >
                        {/* You might need to import 'Trash2' from lucide-react at the top! */}
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;