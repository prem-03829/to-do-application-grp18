import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTasks, useDashboardStats } from '../hooks/useTasks';
import { StatCard } from '../components/dashboard/StatCard';
import { ProductivityChart } from '../components/dashboard/ProductivityChart';
import { UpcomingTasks } from '../components/dashboard/UpcomingTasks';
import { Button } from '../components/ui/Button';
import { AppLayoutContextType } from '../components/layout/AppLayout';
import {
  Plus,
  CheckCircle2,
  Clock,
  PlayCircle,
  ListTodo,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { openCreateModal, openDetailModal, handleToggleStatus } =
    useOutletContext<AppLayoutContextType>();

  const { data: tasks = [] } = useTasks();
  const { data: stats } = useDashboardStats();

  // Dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedCurrentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Metrics dynamically computed from tasks
  const total = stats?.total ?? tasks.length;
  const pending = stats?.pending ?? tasks.filter((t) => t.status === 'pending').length;
  const inProgress = stats?.inProgress ?? tasks.filter((t) => t.status === 'in_progress').length;
  const completed = stats?.completed ?? tasks.filter((t) => t.status === 'completed').length;
  const completionRate =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-indigo-50/20 to-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{formattedCurrentDate}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Intern'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {completed === total && total > 0
              ? "Incredible work! You've completed all scheduled tasks."
              : `You have ${pending + inProgress} active tasks requiring your attention today.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/tasks">
            <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Tasks
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Dynamic Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={total}
          subtitle="All active & completed items"
          icon={<ListTodo className="w-5 h-5" />}
          colorVariant="indigo"
          trend={{ value: `${total} tasks`, isPositive: true }}
        />
        <StatCard
          title="Pending"
          value={pending}
          subtitle="Awaiting kickoff"
          icon={<Clock className="w-5 h-5" />}
          colorVariant="amber"
          trend={{ value: `${Math.round((pending / (total || 1)) * 100)}% of total` }}
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          subtitle="Actively being worked on"
          icon={<PlayCircle className="w-5 h-5" />}
          colorVariant="blue"
          trend={{ value: 'Underway' }}
        />
        <StatCard
          title="Completed"
          value={completed}
          subtitle={`${completionRate}% overall completion`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          colorVariant="emerald"
          trend={{ value: `${completionRate}% done`, isPositive: true }}
        />
      </div>

      {/* Interactive Charts: Weekly Velocity & Status Distribution */}
      <ProductivityChart tasks={tasks} />

      {/* Today's Focus & Upcoming Deadlines */}
      <UpcomingTasks
        tasks={tasks}
        onToggleStatus={handleToggleStatus}
        onViewTask={openDetailModal}
      />
    </div>
  );
};
