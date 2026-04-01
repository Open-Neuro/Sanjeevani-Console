import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type AlertBadgeProps = {
  status: 'success' | 'warning' | 'error' | 'info';
  children: ReactNode;
  className?: string;
};

export default function AlertBadge({ status, children, className }: AlertBadgeProps) {
  const statusClasses = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={twMerge(
        `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`,
        className
      )}
    >
      {children}
    </span>
  );
}
