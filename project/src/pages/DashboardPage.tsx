import React from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useTasks } from '../contexts/TasksContext';
import { useUsers } from '../contexts/UsersContext';
import { useAuth } from '../contexts/AuthContext';

export const DashboardPage: React.FC = () => {
  const { tasks } = useTasks();
  const { users } = useUsers();
  const { user } = useAuth();

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const todoTasks = tasks.filter(task => task.status === 'todo').length;
  const overdueTasks = tasks.filter(task => 
    new Date(task.due_date) < new Date() && task.status !== 'completed'
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: CheckSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'In Progress',
      value: inProgressTasks,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'To Do',
      value: todoTasks,
      icon: Clock,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ];

  if (user?.role === 'admin') {
    stats.push({
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    });
  }

  const recentTasks = tasks
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const upcomingTasks = tasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.email}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your tasks today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900">Progress Overview</h2>
          </div>
          <span className="text-sm text-gray-500">{completionRate}% Complete</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{completedTasks} completed</span>
          <span>{totalTasks - completedTasks} remaining</span>
        </div>

        {overdueTasks > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <strong>{overdueTasks}</strong> task{overdueTasks > 1 ? 's are' : ' is'} overdue
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h2>
          {recentTasks.length > 0 ? (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500 capitalize">{task.status.replace('_', ' ')}</p>
                  </div>
                  <div className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${task.priority === 'high' 
                      ? 'bg-red-100 text-red-800'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                    }
                  `}>
                    {task.priority}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No tasks yet</p>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
          </div>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">
                      Due {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${new Date(task.due_date) < new Date()
                      ? 'bg-red-100 text-red-800'
                      : new Date(task.due_date).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                    }
                  `}>
                    {new Date(task.due_date) < new Date()
                      ? 'Overdue'
                      : new Date(task.due_date).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
                      ? 'Due Soon'
                      : 'On Track'
                    }
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming tasks</p>
          )}
        </div>
      </div>
    </div>
  );
};