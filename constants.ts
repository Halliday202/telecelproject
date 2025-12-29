import { User, UserRole, Ticket, TicketStatus } from './types';
import { query } from './path/to/your/db'; // Make sure this path points to your db.ts
import bcrypt from 'bcrypt';

export const APP_NAME = "Telecel Support";

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    username: 'admin',
    password: 'admin123',
    department: 'IT Support',
    role: UserRole.ADMIN,
    fullName: 'System Administrator',
    email: 'admin@telecel.com'
  },
  {
    id: 'user-1',
    username: 'john.doe',
    password: 'password123',
    department: 'Sales',
    role: UserRole.USER,
    fullName: 'John Doe',
    email: 'john.doe@telecel.com'
  },
  {
    id: 'user-2',
    username: 'jane.smith',
    password: 'password123',
    department: 'HR',
    role: UserRole.USER,
    fullName: 'Jane Smith',
    email: 'jane.smith@telecel.com'
  }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 't-1001',
    userId: 'user-1',
    title: 'Cannot access CRM',
    description: 'When I try to login to the CRM portal, it gives a 502 Bad Gateway error.',
    department: 'Sales',
    status: TicketStatus.PENDING,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 't-1002',
    userId: 'user-2',
    title: 'Printer Jam on 2nd Floor',
    description: 'The main network printer is jamming repeatedly with error code E-45.',
    department: 'HR',
    status: TicketStatus.IN_PROGRESS,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 10000000).toISOString(),
  }
];
