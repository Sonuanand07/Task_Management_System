import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskDetails } from '../components/tasks/TaskDetails';
import { useTasks } from '../contexts/TasksContext';
import { useUsers } from '../contexts/UsersContext';
import { Task } from '../types';

export const TasksPage: React.FC = () => {
  const {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    filters,
    setFilters,
    clearFilters,
    totalCount,
    currentPage,
  } = useTasks();
  const { users } = useUsers();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleCreateTask = async (data: any, files?: File[]) => {
    await createTask(data, files);
  };

  const handleUpdateTask = async (data: any, files?: File[]) => {
    if (editingTask) {
      await updateTask({ ...data, id: editingTask.id }, files);
      setEditingTask(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
    setSelectedTask(null);
  };

  const handleViewDetails = () => {
    if (selectedTask) {
      setEditingTask(selectedTask);
      setShowTaskForm(true);
      setSelectedTask(null);
    }
  };

  const handleDeleteFromDetails = () => {
    if (selectedTask) {
      handleDeleteTask(selectedTask.id);
    }
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / (filters.limit || 10));
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const goToPreviousPage = () => {
    if (canGoPrevious) {
      setFilters({ page: currentPage - 1 });
    }
  };

  const goToNextPage = () => {
    if (canGoNext) {
      setFilters({ page: currentPage + 1 });
    }
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loading size="lg" text="Loading tasks..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage and track your tasks</p>
        </div>
        <Button onClick={() => setShowTaskForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      <TaskFilters
        filters={filters}
        users={users}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {tasks.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No tasks found</p>
          <Button onClick={() => setShowTaskForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Task
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditClick}
                onDelete={handleDeleteTask}
                onView={setSelectedTask}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  variant="secondary"
                  onClick={goToPreviousPage}
                  disabled={!canGoPrevious}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={goToNextPage}
                  disabled={!canGoNext}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {Math.min((currentPage - 1) * (filters.limit || 10) + 1, totalCount)}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * (filters.limit || 10), totalCount)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{totalCount}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={!canGoPrevious}
                      className="rounded-r-none"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center px-3 py-1.5 text-sm border-t border-b border-gray-300 bg-white">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={!canGoNext}
                      className="rounded-l-none"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <TaskForm
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        users={users}
        isLoading={isLoading}
      />

      <TaskDetails
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEdit={handleViewDetails}
        onDelete={handleDeleteFromDetails}
      />
    </div>
  );
};