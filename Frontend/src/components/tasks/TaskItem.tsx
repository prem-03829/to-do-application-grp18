import React from 'react';
import { Task } from '../../types';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { Checkbox } from '../ui/Checkbox';
import { formatDate, isDueToday, isOverdue } from '../../lib/utils';
import { Calendar, Pencil, Trash2, Eye } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onView: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  onView,
}) => {
  const isCompleted = task.status === 'completed';
  const dueToday = !isCompleted && isDueToday(task.dueDate);
  const overdue = !isCompleted && isOverdue(task.dueDate);

  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:px-4 sm:py-3 rounded-xl border transition-all duration-150 ${
        isCompleted
          ? 'bg-slate-50/70 border-slate-200/60 opacity-75'
          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Left side: Checkbox + Title + Description + Category */}
      <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0 pr-2">
        <div className="pt-0.5">
          <Checkbox
            checked={isCompleted}
            onChange={() => onToggleStatus(task.id)}
            aria-label={`Mark "${task.title}" as ${isCompleted ? 'pending' : 'completed'}`}
          />
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onView(task)}>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-medium tracking-tight truncate ${
                isCompleted ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-indigo-600'
              }`}
            >
              {task.title}
            </span>
            {task.category && (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 shrink-0">
                {task.category}
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{task.description}</p>
          )}
        </div>
      </div>

      {/* Right side: Priority, Status, Due date, Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-between sm:justify-end">
        <div className="flex items-center gap-2">
          <TaskPriorityBadge priority={task.priority} />
          <TaskStatusBadge status={task.status} />
        </div>

        {/* Due Date Indicator */}
        <div
          className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border ${
            overdue
              ? 'text-rose-600 bg-rose-50 border-rose-200/60'
              : dueToday
              ? 'text-amber-700 bg-amber-50 border-amber-200/60'
              : 'text-slate-600 bg-slate-50 border-slate-200/60'
          }`}
          title={overdue ? 'Overdue deadline' : dueToday ? 'Due today' : 'Due date'}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(task.dueDate)}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(task)}
            title="View Details"
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(task)}
            title="Edit Task"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task)}
            title="Delete Task"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
