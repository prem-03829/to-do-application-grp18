import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { TaskList } from '../components/tasks/TaskList';
import { AppLayoutContextType } from '../components/layout/AppLayout';
import { CheckCircle2, Trophy } from 'lucide-react';

export const CompletedPage: React.FC = () => {
  const { openEditModal, openDetailModal, openDeleteDialog, handleToggleStatus } =
    useOutletContext<AppLayoutContextType>();

  const [viewMode] = useState<'list' | 'grid'>('list');
  const { data: allTasks = [], isLoading } = useTasks();

  const completedTasks = allTasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Completed Tasks Archive</span>
            </h1>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {completedTasks.length} done
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review completed goals and assignments. Uncheck any task to reopen it.
          </p>
        </div>
      </div>

      {/* Completion Banner */}
      {completedTasks.length > 0 && (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900">
              {completedTasks.length} Tasks Successfully Completed!
            </h4>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Click the checkbox on any item if you need to reopen it into your active workflow.
            </p>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <TaskList
        tasks={completedTasks}
        isLoading={isLoading}
        viewMode={viewMode}
        onToggleStatus={handleToggleStatus}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
        onView={openDetailModal}
        emptyTitle="No completed tasks yet"
        emptySubtitle="Check off your tasks as you finish them to see your completed accomplishments here."
      />
    </div>
  );
};
