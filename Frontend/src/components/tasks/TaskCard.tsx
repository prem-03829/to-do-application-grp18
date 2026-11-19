import React from 'react';
import { Task } from '../../types';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { Checkbox } from '../ui/Checkbox';
import { formatDate, isDueToday, isOverdue } from '../../lib/utils';
import { Calendar, Pencil, Trash2, Eye } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onView: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
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
      className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-150 ${
        isCompleted
          ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div>
        {/* Top bar: Category + Status */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {task.category && (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                {task.category}
              </span>
            )}
            {task.assignedToName && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-700 bg-indigo-50/80 px-1.5 py-0.5 rounded border border-indigo-200/50">
                {task.assignedToAvatar && (
                  <img src={task.assignedToAvatar} alt="" className="w-3 h-3 rounded-full object-cover" />
                )}
                <span>{task.assignedToName}</span>
              </span>
            )}
          </div>
          <TaskStatusBadge status={task.status} />
        </div>

        {/* Header: Checkbox + Title */}
        <div className="flex items-start gap-2.5">
          <div className="pt-0.5">
            <Checkbox
              checked={isCompleted}
              onChange={() => onToggleStatus(task.id)}
              aria-label={`Mark "${task.title}" as ${isCompleted ? 'pending' : 'completed'}`}
            />
          </div>
          <div className="flex-1 cursor-pointer" onClick={() => onView(task)}>
            <h4
              className={`text-sm font-semibold tracking-tight leading-snug ${
                isCompleted ? 'line-through text-slate-400' : 'text-slate-900 hover:text-indigo-600'
              }`}
            >
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TaskPriorityBadge priority={task.priority} />
          <div
            className={`flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md border ${
              overdue
                ? 'text-rose-600 bg-rose-50 border-rose-200/60'
                : dueToday
                ? 'text-amber-700 bg-amber-50 border-amber-200/60'
                : 'text-slate-600 bg-slate-50 border-slate-200/60'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
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
