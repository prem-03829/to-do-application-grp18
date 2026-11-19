import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTasks, useUsers } from '../hooks/useTasks';
import { TaskFiltersState } from '../types';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskList } from '../components/tasks/TaskList';
import { Button } from '../components/ui/Button';
import { AppLayoutContextType } from '../components/layout/AppLayout';
import { Plus, CheckSquare } from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { openCreateModal, openEditModal, openDetailModal, openDeleteDialog, handleToggleStatus } =
    useOutletContext<AppLayoutContextType>();

  const [filters, setFilters] = useState<TaskFiltersState>({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const { data: tasks = [], isLoading } = useTasks(filters);
  const { data: users = [] } = useUsers();

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      userId: 'all',
    });
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <span>All Tasks</span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, filter, and organize all tasks across your projects.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
        >
          Add New Task
        </Button>
      </div>

      {/* Filter Toolbar */}
      <TaskFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        users={users}
      />

      {/* Task List / Grid */}
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        viewMode={viewMode}
        onToggleStatus={handleToggleStatus}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
        onView={openDetailModal}
        onAddNew={openCreateModal}
        emptyTitle={
          filters.search || filters.status !== 'all'
            ? 'No tasks match your filters'
            : 'No tasks yet'
        }
        emptySubtitle={
          filters.search || filters.status !== 'all'
            ? 'Try adjusting your search terms or clearing selected filters.'
            : 'Create your first task to start organizing your workflow.'
        }
      />
    </div>
  );
};
