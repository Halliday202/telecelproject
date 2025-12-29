import { User, Ticket, ChatMessage, UserRole, TicketStatus } from '../types';

// Initial Seed Data (Keeping this prevents other parts of the app from crashing)
const SEED_USERS: User[] = [
  {
    id: '100001',
    companyId: 'TC-ADM-01',
    username: 'admin',
    password: 'admin123',
    department: 'IT Support',
    role: UserRole.ADMIN,
    fullName: 'Jimmy Carter',
    email: 'admin@telecel.com'
  },
  {
    id: '849201',
    companyId: 'TC-EMP-55',
    username: 'jimmy',
    password: 'password123',
    department: 'Sales',
    role: UserRole.USER,
    fullName: 'Jimmy',
    email: 'jimmy@telecel.com'
  }
];

// Helper to generate 6-digit ID
const generateId = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- Backend Methods ---

export const Backend = {
  // --- Auth & Users ---
  getUsers: (): User[] => {
    const stored = localStorage.getItem('ts_users');
    return stored ? JSON.parse(stored) : SEED_USERS;
  },

  createUser: (userData: Omit<User, 'id'>): User => {
    const users = Backend.getUsers();
    if (users.find(u => u.username === userData.username)) {
      throw new Error('Username already exists');
    }

    const newUser: User = {
      ...userData,
      id: generateId(),
      companyId: `TC-EMP-${Math.floor(100 + Math.random() * 900)}`
    };

    users.push(newUser);
    localStorage.setItem('ts_users', JSON.stringify(users));
    return newUser;
  },

  resetPassword: (userId: string): string => {
    const users = Backend.getUsers();
    const tempPassword = Math.random().toString(36).slice(-8);

    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, password: tempPassword } : u
    );

    localStorage.setItem('ts_users', JSON.stringify(updatedUsers));
    return tempPassword;
  },

  changePassword: (userId: string, newPass: string): void => {
    const users = Backend.getUsers();
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, password: newPass } : u
    );
    localStorage.setItem('ts_users', JSON.stringify(updatedUsers));
  },

  // 🔄 REPLACED LOGIN FUNCTION (Connects to your new Server)
  login: async (username: string, password: string): Promise<User | null> => {
    try {
      console.log(`📡 Connecting to server for user: ${username}...`);

      // This talks to the server.ts file we made running on port 5000
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Save the real user from the DB to local storage so the app "remembers" them
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return data.user;
      } else {
        console.warn('Login failed:', data.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Network Error (Is server.ts running?):', error);
      return null;
    }
  },

  // --- Tickets (REAL DATABASE) ---

  getTickets: async (): Promise<Ticket[]> => {
    try {
      const response = await fetch('http://localhost:5000/api/tickets');
      return await response.json();
    } catch (error) {
      console.error("Error fetching tickets:", error);
      return [];
    }
  },

  createTicket: async (ticketData: any): Promise<Ticket> => {
    const response = await fetch('http://localhost:5000/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
    });
    return await response.json();
  },

  updateTicketStatus: async (ticketId: string, status: TicketStatus) => {
    await fetch(`http://localhost:5000/api/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },

  // --- Chat ---
  getMessages: (ticketId: string): ChatMessage[] => {
    const stored = localStorage.getItem('ts_messages');
    const allMessages: ChatMessage[] = stored ? JSON.parse(stored) : [];
    return allMessages.filter(m => m.ticketId === ticketId).sort((a, b) => a.timestamp - b.timestamp);
  },

  sendMessage: (ticketId: string, senderId: string, senderName: string, text: string): ChatMessage => {
    const stored = localStorage.getItem('ts_messages');
    const allMessages: ChatMessage[] = stored ? JSON.parse(stored) : [];

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      ticketId,
      senderId,
      senderName,
      text,
      timestamp: Date.now()
    };

    allMessages.push(newMessage);
    localStorage.setItem('ts_messages', JSON.stringify(allMessages));
    return newMessage;
  }
};