import React from 'react';
import { Task } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Checkbox } from '../ui/Checkbox';
import { TaskPriorityBadge } from '../tasks/TaskPriorityBadge';
import { formatDate, isDueToday, isUpcoming } from '../../lib/utils';
import { Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UpcomingTasksProps {
  tasks: Task[];
  onToggleStatus: (id: string) => void;
  onViewTask: (task: Task) => void;
}

export const UpcomingTasks: React.FC<UpcomingTasksProps> = ({
  tasks,
  onToggleStatus,
  onViewTask,
}) => {
  const activeTasks = tasks.filter((t) => t.status !== 'completed');

  // Filter tasks due today
  const todayTasks = activeTasks.filter((t) => isDueToday(t.dueDate));

  // Filter tasks due in future
  const upcomingTasks = activeTasks
    .filter((t) => !isDueToday(t.dueDate) && isUpcoming(t.dueDate))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Due Today */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <span>Today's Priority Focus</span>
              {todayTasks.length > 0 && (
                <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {todayTasks.length}
                </span>
              )}
            </CardTitle>
            <CardDescription>Tasks scheduled for completion today</CardDescription>
          </div>
          <Link
            to="/today"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {todayTasks.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/80 mb-2" />
              <p className="font-semibold text-slate-600">All caught up for today!</p>
              <p className="text-slate-400 mt-0.5">No pending deadlines due today.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onChange={() => onToggleStatus(task.id)}
                      aria-label={`Mark ${task.title} as completed`}
                    />
                    <div
                      className="cursor-pointer min-w-0"
                      onClick={() => onViewTask(task)}
                    >
                      <p className="text-xs font-semibold text-slate-800 truncate hover:text-indigo-600">
                        {task.title}
                      </p>
                      {task.category && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          {task.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <TaskPriorityBadge priority={task.priority} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <span>Upcoming Deadlines</span>
              {upcomingTasks.length > 0 && (
                <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  {upcomingTasks.length}
                </span>
              )}
            </CardTitle>
            <CardDescription>Scheduled work arriving in the coming days</CardDescription>
          </div>
          <Link
            to="/upcoming"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingTasks.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No upcoming scheduled tasks.
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onChange={() => onToggleStatus(task.id)}
                    />
                    <div
                      className="cursor-pointer min-w-0"
                      onClick={() => onViewTask(task)}
                    >
                      <p className="text-xs font-semibold text-slate-800 truncate hover:text-indigo-600">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                  <TaskPriorityBadge priority={task.priority} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
