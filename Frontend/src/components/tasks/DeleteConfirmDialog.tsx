import React from 'react';
import { Task } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  task,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Delete Task
          </Button>
        </div>
      }
    >
      <div className="text-center space-y-3 py-2">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Delete this task?</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
          Are you sure you want to delete <span className="font-semibold text-slate-700">"{task.title}"</span>? This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
};
