import React from 'react';
import { TaskStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
  showIcon?: boolean;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
}) => {
  const configs = {
    pending: {
      label: 'Pending',
      variant: 'default' as const,
      icon: <Clock className="w-3 h-3 text-slate-500" />,
    },
    in_progress: {
      label: 'In Progress',
      variant: 'primary' as const,
      icon: <PlayCircle className="w-3 h-3 text-indigo-500" />,
    },
    completed: {
      label: 'Completed',
      variant: 'success' as const,
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" />,
    },
  };

  const config = configs[status] || configs.pending;

  return (
    <Badge variant={config.variant} size="sm" dot={!showIcon} className={className}>
      {showIcon && config.icon}
      <span>{config.label}</span>
    </Badge>
  );
};
