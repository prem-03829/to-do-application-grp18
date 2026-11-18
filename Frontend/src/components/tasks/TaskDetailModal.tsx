import React from 'react';
import { Task, TaskStatus } from '../../types';
import { Modal } from '../ui/Modal';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { Button } from '../ui/Button';
import { formatDate, isDueToday, isOverdue } from '../../lib/utils';
import { Calendar, Clock, Tag, Pencil, Trash2, CheckCircle2 } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (!task) return null;

  const isCompleted = task.status === 'completed';
  const dueToday = !isCompleted && isDueToday(task.dueDate);
  const overdue = !isCompleted && isOverdue(task.dueDate);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      description={`Task ID: ${task.id}`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onClose();
              onDelete(task);
            }}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              leftIcon={<Pencil className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
            <Button
              variant={isCompleted ? 'subtle' : 'primary'}
              size="sm"
              onClick={() => {
                onStatusChange(task.id, isCompleted ? 'pending' : 'completed');
              }}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              {isCompleted ? 'Reopen Task' : 'Mark Complete'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Title */}
        <div>
          <h2
            className={`text-lg font-bold tracking-tight ${
              isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
            }`}
          >
            {task.title}
          </h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
            {task.category && (
              <span className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                <Tag className="w-3 h-3 text-slate-400" />
                {task.category}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Description
          </h4>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {task.description || (
              <span className="text-slate-400 italic">No description provided.</span>
            )}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">Due Date:</span>
              <span
                className={`font-semibold ${
                  overdue ? 'text-rose-600' : dueToday ? 'text-amber-600' : 'text-slate-800'
                }`}
              >
                {formatDate(task.dueDate)}{' '}
                {overdue ? '(Overdue)' : dueToday ? '(Due Today)' : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">Created At:</span>
              <span className="font-semibold text-slate-800">
                {new Date(task.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Status Selector */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Change Status
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {(['pending', 'in_progress', 'completed'] as TaskStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onStatusChange(task.id, st)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                  task.status === st
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st === 'pending'
                  ? 'Pending'
                  : st === 'in_progress'
                  ? 'In Progress'
                  : 'Completed'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
