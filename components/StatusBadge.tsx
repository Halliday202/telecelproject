import React from 'react';
import { TicketStatus } from '../types';
import { Clock, CheckCircle, Activity } from 'lucide-react';

interface StatusBadgeProps {
  status: TicketStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";

  switch (status) {
    case TicketStatus.PENDING:
      return (
        <span className={`${baseStyles} bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20`}>
          <Clock className="w-3 h-3 mr-1.5" />
          Pending
        </span>
      );
    case TicketStatus.IN_PROGRESS:
      return (
        <span className={`${baseStyles} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20`}>
          <Activity className="w-3 h-3 mr-1.5" />
          In Progress
        </span>
      );
    case TicketStatus.RESOLVED:
      return (
        <span className={`${baseStyles} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20`}>
          <CheckCircle className="w-3 h-3 mr-1.5" />
          Resolved
        </span>
      );
    default:
      return null;
  }
};