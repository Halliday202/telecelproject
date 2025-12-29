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
    fullName: 'System Administrator',
    email: 'admin@telecel.com'
  },
  {
    id: '849201',
    companyId: 'TC-EMP-55',
    username: 'john.doe',
    password: 'password123',
    department: 'Sales',
    role: UserRole.USER,
    fullName: 'John Doe',
    email: 'john.doe@telecel.com'
  }
];

const SEED_TICKETS: Ticket[] = [
  {
    id: 't-1001',
    userId: '849201',
    title: 'Cannot access CRM',
    description: 'When I try to login to the CRM portal, it gives a 502 Bad Gateway error.',
    department: 'Sales',
    status: TicketStatus.PENDING,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
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

  // --- Tickets ---
  getTickets: (): Ticket[] => {
    const stored = localStorage.getItem('ts_tickets');
    return stored ? JSON.parse(stored) : SEED_TICKETS;
  },

  createTicket: (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Ticket => {
    const tickets = Backend.getTickets();
    const newTicket: Ticket = {
      ...ticketData,
      id: `t-${Date.now()}`,
      status: TicketStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tickets.unshift(newTicket);
    localStorage.setItem('ts_tickets', JSON.stringify(tickets));
    return newTicket;
  },

  updateTicketStatus: (ticketId: string, status: TicketStatus) => {
    const tickets = Backend.getTickets();
    const updated = tickets.map(t =>
      t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t
    );
    localStorage.setItem('ts_tickets', JSON.stringify(updated));
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