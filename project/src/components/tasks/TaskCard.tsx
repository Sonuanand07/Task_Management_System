import React from 'react';
import { format } from 'date-fns';
import { 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onView: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onView }) => {
  const [showActions, setShowActions] = React.useState(false);

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusIcons = {
    todo: Clock,
    in_progress: AlertCircle,
    completed: CheckCircle,
  };

  const statusColors = {
    todo: 'text-gray-500',
    in_progress: 'text-blue-500',
    completed: 'text-green-500',
  };

  const StatusIcon = statusIcons[task.status];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <StatusIcon className={`h-4 w-4 ${statusColors[task.status]}`} />
            <h3 
              className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => onView(task)}
            >
              {task.title}
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>

          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
            </div>
            
            {task.assigned_user && (
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{task.assigned_user.email}</span>
              </div>
            )}

            {task.documents && task.documents.length > 0 && (
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>{task.documents.length}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className={`
              inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border
              ${priorityColors[task.priority]}
            `}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>

            <span className={`
              inline-flex items-center px-2 py-1 text-xs font-medium rounded-full
              ${task.status === 'completed' 
                ? 'bg-green-100 text-green-800'
                : task.status === 'in_progress'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
              }
            `}>
              {task.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="relative ml-4">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
              <button
                onClick={() => {
                  onEdit(task);
                  setShowActions(false);
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  onDelete(task.id);
                  setShowActions(false);
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 w-full"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};