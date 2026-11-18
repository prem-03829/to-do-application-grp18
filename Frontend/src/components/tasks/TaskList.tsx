import React from 'react';
import { Task } from '../../types';
import { TaskItem } from './TaskItem';
import { TaskCard } from './TaskCard';
import { CheckCircle2, Inbox } from 'lucide-react';
import { Button } from '../ui/Button';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  viewMode: 'list' | 'grid';
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onView: (task: Task) => void;
  onAddNew?: () => void;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  viewMode,
  onToggleStatus,
  onEdit,
  onDelete,
  onView,
  onAddNew,
  emptyTitle = 'No tasks found',
  emptySubtitle = 'Get started by creating your first task or clearing your search filters.',
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-slate-200 bg-white animate-pulse flex items-center justify-between"
          >
            <div className="flex items-center gap-3 w-2/3">
              <div className="w-4.5 h-4.5 bg-slate-200 rounded-md shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-16 bg-slate-200 rounded-full" />
              <div className="h-6 w-20 bg-slate-100 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 my-4">
        <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3.5">
          <Inbox className="w-7 h-7 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-bold text-slate-800">{emptyTitle}</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">
          {emptySubtitle}
        </p>
        {onAddNew && (
          <Button
            size="sm"
            onClick={onAddNew}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Create New Task
          </Button>
        )}
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleStatus={onToggleStatus}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
};
