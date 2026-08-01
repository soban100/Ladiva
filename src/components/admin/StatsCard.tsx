import React from 'react';
import { LucideIcon } from 'lucide-react';
import { colors } from '../../lib/design-system';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color
}) => {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-100',
      icon: 'text-primary-600',
      change: changeType === 'increase' ? 'text-primary-600' : 'text-red-600'
    },
    secondary: {
      bg: 'bg-secondary-100',
      icon: 'text-secondary-600',
      change: changeType === 'increase' ? 'text-secondary-600' : 'text-red-600'
    },
    success: {
      bg: 'bg-success-100',
      icon: 'text-success-600',
      change: changeType === 'increase' ? 'text-success-600' : 'text-red-600'
    },
    warning: {
      bg: 'bg-warning-100',
      icon: 'text-warning-600',
      change: changeType === 'increase' ? 'text-warning-600' : 'text-red-600'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          <div className="flex items-center gap-1">
            <span className={`text-sm font-medium ${classes.change}`}>
              {changeType === 'increase' ? '↑' : '↓'} {change}
            </span>
            <span className="text-xs text-gray-500">from last month</span>
          </div>
        </div>
        <div className={`w-14 h-14 ${classes.bg} rounded-2xl flex items-center justify-center ml-4`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
