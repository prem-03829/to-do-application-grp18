import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Task, CreateTaskInput } from '../../types';
import { CATEGORIES } from '../../services/mock/mockData';
import { useUsers } from '../../hooks/useTasks';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const taskSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(120, 'Title must not exceed 120 characters'),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'in_progress', 'completed']),
  dueDate: z.string().min(1, 'Please select a due date'),
  category: z.string().optional(),
  userId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  initialData?: Task | null;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { user: currentUser } = useAuth();
  const { data: users = [] } = useUsers();

  const defaultDueDate =
    initialData?.dueDate || new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      status: initialData?.status || 'pending',
      dueDate: defaultDueDate,
      category: initialData?.category || 'Project Development',
      userId: initialData?.userId || currentUser?.id || '',
    },
  });

  const onFormSubmit = async (data: TaskFormData) => {
    const assignedUser = users.find((u) => u.id === data.userId);

    await onSubmit({
      title: data.title.trim(),
      description: data.description?.trim() || '',
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
      category: data.category || 'General',
      userId: data.userId || currentUser?.id,
      assignedToName: assignedUser?.name || currentUser?.name || 'Self',
      assignedToAvatar: assignedUser?.avatar || currentUser?.avatar,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Title */}
      <Input
        label="Task Title *"
        placeholder="e.g. Design MySQL database schema"
        error={errors.title?.message}
        {...register('title')}
      />

      {/* Description */}
      <Textarea
        label="Description (Optional)"
        placeholder="Add context, specifications, checklist or links..."
        rows={3}
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Assignee Selection (For Admin or general team collaboration) */}
      {users.length > 0 && (
        <Select
          label="Assign To Team Member"
          error={errors.userId?.message}
          {...register('userId')}
        >
          {currentUser && (
            <option value={currentUser.id}>
              Assign to myself ({currentUser.name})
            </option>
          )}
          {users
            .filter((u) => u.id !== currentUser?.id)
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role === 'admin' ? 'Admin Lead' : 'Team Member'})
              </option>
            ))}
        </Select>
      )}

      {/* Priority & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Select
          label="Priority *"
          error={errors.priority?.message}
          {...register('priority')}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </Select>

        <Select
          label="Status *"
          error={errors.status?.message}
          {...register('status')}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress (Currently Working On)</option>
          <option value="completed">Completed</option>
        </Select>
      </div>

      {/* Due Date & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          type="date"
          label="Due Date *"
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />

        <Select
          label="Category"
          error={errors.category?.message}
          {...register('category')}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          <option value="General">General</option>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading || isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading || isSubmitting}
        >
          {initialData ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};
