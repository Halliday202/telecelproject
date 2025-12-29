export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum TicketStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

export interface User {
  id: string; // 6 digit string
  companyId?: string; // Company specific ID
  username: string;
  password?: string;
  department: string;
  role: UserRole;
  fullName: string;
  email: string;
}

export interface ChatMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface Ticket {
  id: string;
  userId: string;
  title: string;
  description: string;
  department: string;
  status: TicketStatus;
  createdAt: string; // ISO Date string
  updatedAt: string;
  screenshotUrl?: string; // Base64 string
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
}
