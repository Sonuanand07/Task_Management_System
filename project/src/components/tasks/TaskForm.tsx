import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Modal } from '../ui/Modal';
import { CreateTaskData, Task, User } from '../../types';
import { Upload, X } from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['todo', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().min(1, 'Due date is required'),
  assigned_to: z.string().min(1, 'Assigned user is required'),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskData, files?: File[]) => Promise<void>;
  task?: Task;
  users: User[];
  isLoading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  users,
  isLoading = false,
}) => {
  const [files, setFiles] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date.split('T')[0],
      assigned_to: task.assigned_to,
    } : {
      status: 'todo',
      priority: 'medium',
    },
  });

  React.useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date.split('T')[0],
        assigned_to: task.assigned_to,
      });
    } else {
      reset({
        status: 'todo',
        priority: 'medium',
        title: '',
        description: '',
        due_date: '',
        assigned_to: '',
      });
    }
    setFiles([]);
  }, [task, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== selectedFiles.length) {
      alert('Only PDF files are allowed');
      return;
    }

    if (files.length + pdfFiles.length > 3) {
      alert('Maximum 3 files allowed');
      return;
    }

    setFiles(prev => [...prev, ...pdfFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: TaskFormData) => {
    try {
      await onSubmit({
        ...data,
        due_date: new Date(data.due_date).toISOString(),
      }, files);
      
      onClose();
      reset();
      setFiles([]);
    } catch (error) {
      // Error handling is done in the context
    }
  };

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const userOptions = users.map(user => ({
    value: user.id,
    label: user.email,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          {...register('title')}
          label="Title"
          placeholder="Enter task title"
          error={errors.title?.message}
        />

        <Textarea
          {...register('description')}
          label="Description"
          placeholder="Enter task description"
          rows={3}
          error={errors.description?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            {...register('status')}
            label="Status"
            options={statusOptions}
            error={errors.status?.message}
          />

          <Select
            {...register('priority')}
            label="Priority"
            options={priorityOptions}
            error={errors.priority?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('due_date')}
            label="Due Date"
            type="date"
            error={errors.due_date?.message}
          />

          <Select
            {...register('assigned_to')}
            label="Assign To"
            options={userOptions}
            placeholder="Select user"
            error={errors.assigned_to?.message}
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Documents (PDF only, max 3)
          </label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Upload PDF files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
          >
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};