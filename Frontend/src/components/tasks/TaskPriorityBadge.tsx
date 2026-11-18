import React from 'react';
import { TaskPriority } from '../../types';
import { Badge } from '../ui/Badge';
import { AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
  showIcon?: boolean;
}

export const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({
  priority,
  className,
  showIcon = true,
}) => {
  const configs = {
    high: {
      label: 'High Priority',
      variant: 'danger' as const,
      icon: <AlertCircle className="w-3 h-3 text-rose-500" />,
    },
    medium: {
      label: 'Medium',
      variant: 'warning' as const,
      icon: <ArrowUp className="w-3 h-3 text-amber-500" />,
    },
    low: {
      label: 'Low',
      variant: 'slate' as const,
      icon: <ArrowDown className="w-3 h-3 text-slate-400" />,
    },
  };

  const config = configs[priority] || configs.medium;

  return (
    <Badge variant={config.variant} size="sm" className={className}>
      {showIcon && config.icon}
      <span>{config.label}</span>
    </Badge>
  );
};
