import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Modal } from '../ui/Modal';
import { TaskForm } from '../tasks/TaskForm';
import { TaskDetailModal } from '../tasks/TaskDetailModal';
import { DeleteConfirmDialog } from '../tasks/DeleteConfirmDialog';
import { Task, CreateTaskInput, TaskStatus } from '../../types';
import {
  useDashboardStats,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTaskStatus,
} from '../../hooks/useTasks';
import { Toaster, toast } from 'sonner';

export interface AppLayoutContextType {
  openCreateModal: () => void;
  openEditModal: (task: Task) => void;
  openDetailModal: (task: Task) => void;
  openDeleteDialog: (task: Task) => void;
  handleToggleStatus: (id: string) => void;
}

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Data queries & mutations
  const { data: stats } = useDashboardStats();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const toggleStatusMutation = useToggleTaskStatus();

  // Handlers
  const handleCreateTask = async (data: CreateTaskInput) => {
    try {
      await createTaskMutation.mutateAsync(data);
      toast.success('Task created successfully!');
      setIsCreateOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (data: CreateTaskInput) => {
    if (!editingTask) return;
    try {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        updates: data,
      });
      toast.success('Task updated successfully!');
      setEditingTask(null);
      // Also update detail modal if open
      if (detailTask && detailTask.id === editingTask.id) {
        setDetailTask({ ...detailTask, ...data });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    try {
      await deleteTaskMutation.mutateAsync(deletingTask.id);
      toast.success('Task deleted successfully');
      setDeletingTask(null);
      if (detailTask && detailTask.id === deletingTask.id) {
        setDetailTask(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete task');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const updated = await toggleStatusMutation.mutateAsync(id);
      toast.success(
        updated.status === 'completed'
          ? 'Task marked as completed! 🎉'
          : 'Task reopened.'
      );
      if (detailTask && detailTask.id === id) {
        setDetailTask(updated);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task status');
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      const updated = await updateTaskMutation.mutateAsync({
        id,
        updates: { status },
      });
      toast.success(`Task status set to "${status.replace('_', ' ')}"`);
      if (detailTask && detailTask.id === id) {
        setDetailTask(updated);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const contextValue: AppLayoutContextType = {
    openCreateModal: () => setIsCreateOpen(true),
    openEditModal: (task: Task) => setEditingTask(task),
    openDetailModal: (task: Task) => setDetailTask(task),
    openDeleteDialog: (task: Task) => setDeletingTask(task),
    handleToggleStatus,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        counts={{
          today: stats?.dueToday || 0,
          upcoming: stats?.upcomingCount || 0,
          total: stats?.total || 0,
          completed: stats?.completed || 0,
        }}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onQuickAddTask={() => setIsCreateOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={contextValue} />
        </main>
      </div>

      {/* Modal: Create Task */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Task"
        description="Add a task to your workspace with priorities, deadlines, and categories."
        maxWidth="lg"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setIsCreateOpen(false)}
          isLoading={createTaskMutation.isPending}
        />
      </Modal>

      {/* Modal: Edit Task */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
        description="Update task details, deadline or status."
        maxWidth="lg"
      >
        <TaskForm
          initialData={editingTask}
          onSubmit={handleUpdateTask}
          onCancel={() => setEditingTask(null)}
          isLoading={updateTaskMutation.isPending}
        />
      </Modal>

      {/* Modal: Task Detail */}
      <TaskDetailModal
        task={detailTask}
        isOpen={!!detailTask}
        onClose={() => setDetailTask(null)}
        onEdit={(task) => {
          setDetailTask(null);
          setEditingTask(task);
        }}
        onDelete={(task) => {
          setDetailTask(null);
          setDeletingTask(task);
        }}
        onStatusChange={handleStatusChange}
      />

      {/* Dialog: Delete Confirmation */}
      <DeleteConfirmDialog
        task={deletingTask}
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
        isLoading={deleteTaskMutation.isPending}
      />
    </div>
  );
};
