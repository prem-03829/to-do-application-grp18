import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { TaskList } from '../components/tasks/TaskList';
import { Button } from '../components/ui/Button';
import { AppLayoutContextType } from '../components/layout/AppLayout';
import { isDueToday } from '../lib/utils';
import { Clock, Plus } from 'lucide-react';

export const TodayPage: React.FC = () => {
  const { openCreateModal, openEditModal, openDetailModal, openDeleteDialog, handleToggleStatus } =
    useOutletContext<AppLayoutContextType>();

  const [viewMode] = useState<'list' | 'grid'>('list');
  const { data: allTasks = [], isLoading } = useTasks();

  const todayTasks = allTasks.filter((t) => isDueToday(t.dueDate));
  const completedToday = todayTasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Today's Schedule</span>
            </h1>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              {todayTasks.length} tasks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tasks scheduled for completion today. Completed {completedToday} of {todayTasks.length}.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
        >
          Add Task for Today
        </Button>
      </div>

      {/* Progress banner */}
      {todayTasks.length > 0 && (
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              {Math.round((completedToday / todayTasks.length) * 100)}%
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Today's Progress</p>
              <p className="text-[11px] text-slate-500">
                {completedToday} completed, {todayTasks.length - completedToday} remaining
              </p>
            </div>
          </div>

          <div className="w-32 sm:w-48 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${(completedToday / (todayTasks.length || 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Tasks List */}
      <TaskList
        tasks={todayTasks}
        isLoading={isLoading}
        viewMode={viewMode}
        onToggleStatus={handleToggleStatus}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
        onView={openDetailModal}
        onAddNew={openCreateModal}
        emptyTitle="Nothing due today!"
        emptySubtitle="You have no tasks scheduled for today. Enjoy your productive momentum or add a new goal."
      />
    </div>
  );
};
