import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type DataCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  className?: string;
  action?: ReactNode;
};

export default function DataCard({
  title,
  value,
  icon,
  trend,
  description,
  className,
  action
}: DataCardProps) {
  const trendClasses = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  };

  return (
    <div className={twMerge("bg-white rounded-xl border border-gray-200 p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
            {icon && <span className="text-pharmlyGreen">{icon}</span>}
            {title}
          </h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="flex items-center gap-2">
          {trend && (
            <span className={`text-sm font-medium ${trendClasses[trend]}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
          )}
          {action && <span>{action}</span>}
        </div>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
}
