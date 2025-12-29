import { User, Ticket, ChatMessage, UserRole, TicketStatus } from '../types';



// Helper to generate 6-digit ID
const generateId = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- Backend Methods ---

export const Backend = {
  // --- Auth & Users ---
  // --- Auth & Users (REAL DATABASE) ---

  getUsers: async (): Promise<User[]> => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      return await response.json();
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  createUser: async (userData: any): Promise<User> => {
    const response = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }

    return await response.json();
  },

  // Add this new function for deleting
  deleteUser: async (userId: string): Promise<void> => {
    await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: 'DELETE',
    });
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