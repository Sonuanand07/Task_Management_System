import React from 'react';
import { format } from 'date-fns';
import { 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText,
  Download,
  X
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Task } from '../../types';
import { supabase } from '../../lib/supabase';

interface TaskDetailsProps {
  task: Task | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!task) return null;

  const statusIcons = {
    todo: Clock,
    in_progress: AlertCircle,
    completed: CheckCircle,
  };

  const statusColors = {
    todo: 'text-gray-500 bg-gray-100',
    in_progress: 'text-blue-500 bg-blue-100',
    completed: 'text-green-500 bg-green-100',
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200',
  };

  const StatusIcon = statusIcons[task.status];

  const downloadDocument = async (document: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('task-documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <Modal
      isOpen={!!task}
      onClose={onClose}
      title="Task Details"
      size="lg"
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <StatusIcon className={`h-5 w-5 ${statusColors[task.status].split(' ')[0]}`} />
            <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">{task.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status]}`}>
                <StatusIcon className="h-4 w-4" />
                <span>{task.status.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <span className={`inline-flex items-center px-2 py-1 text-sm font-medium rounded-full border ${priorityColors[task.priority]}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <div className="flex items-center space-x-2 text-gray-900">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(task.due_date), 'MMMM d, yyyy')}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <div className="flex items-center space-x-2 text-gray-900">
                <User className="h-4 w-4" />
                <span>{task.assigned_user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {task.documents && task.documents.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Documents</label>
            <div className="space-y-2">
              {task.documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{document.filename}</p>
                      <p className="text-xs text-gray-500">
                        {Math.round(document.file_size / 1024)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadDocument(document)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="text-sm text-gray-500 space-y-1">
            <p>Created: {format(new Date(task.created_at), 'MMMM d, yyyy at h:mm a')}</p>
            <p>Updated: {format(new Date(task.updated_at), 'MMMM d, yyyy at h:mm a')}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="danger" onClick={onDelete}>
            Delete Task
          </Button>
          <Button onClick={onEdit}>
            Edit Task
          </Button>
        </div>
      </div>
    </Modal>
  );
};