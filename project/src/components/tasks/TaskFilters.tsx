import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { TaskFilters as TaskFiltersType, User } from '../../types';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  users: User[];
  onFiltersChange: (filters: Partial<TaskFiltersType>) => void;
  onClearFilters: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  users,
  onFiltersChange,
  onClearFilters,
}) => {
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Created Date' },
    { value: 'due_date', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' },
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Descending' },
    { value: 'asc', label: 'Ascending' },
  ];

  const userOptions = [
    { value: '', label: 'All Users' },
    ...users.map(user => ({
      value: user.id,
      label: user.email,
    })),
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <Select
          value={filters.status || ''}
          onChange={(e) => onFiltersChange({ status: e.target.value as any })}
          options={statusOptions}
          placeholder="Filter by status"
        />

        <Select
          value={filters.priority || ''}
          onChange={(e) => onFiltersChange({ priority: e.target.value as any })}
          options={priorityOptions}
          placeholder="Filter by priority"
        />

        <Select
          value={filters.assigned_to || ''}
          onChange={(e) => onFiltersChange({ assigned_to: e.target.value })}
          options={userOptions}
          placeholder="Filter by assignee"
        />

        <Select
          value={filters.sortBy || 'created_at'}
          onChange={(e) => onFiltersChange({ sortBy: e.target.value as any })}
          options={sortOptions}
        />

        <Select
          value={filters.sortOrder || 'desc'}
          onChange={(e) => onFiltersChange({ sortOrder: e.target.value as any })}
          options={sortOrderOptions}
        />
      </div>
    </div>
  );
};