import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { TaskList } from '../components/tasks/TaskList';
import { Button } from '../components/ui/Button';
import { AppLayoutContextType } from '../components/layout/AppLayout';
import { isUpcoming } from '../lib/utils';
import { Calendar, Plus } from 'lucide-react';

export const UpcomingPage: React.FC = () => {
  const { openCreateModal, openEditModal, openDetailModal, openDeleteDialog, handleToggleStatus } =
    useOutletContext<AppLayoutContextType>();

  const [viewMode] = useState<'list' | 'grid'>('list');
  const { data: allTasks = [], isLoading } = useTasks();

  const upcomingTasks = allTasks
    .filter((t) => isUpcoming(t.dueDate))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>Upcoming Deadlines</span>
            </h1>
            <span className="text-xs font-bold text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full">
              {upcomingTasks.length} tasks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tasks scheduled for future dates, organized in chronological order.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
        >
          Add Upcoming Task
        </Button>
      </div>

      {/* Tasks List */}
      <TaskList
        tasks={upcomingTasks}
        isLoading={isLoading}
        viewMode={viewMode}
        onToggleStatus={handleToggleStatus}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
        onView={openDetailModal}
        onAddNew={openCreateModal}
        emptyTitle="No upcoming tasks scheduled"
        emptySubtitle="Plan ahead by scheduling tasks and project milestones for the coming weeks."
      />
    </div>
  );
};
