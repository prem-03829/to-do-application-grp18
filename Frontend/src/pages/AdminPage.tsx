import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTeamProgress } from '../hooks/useTasks';
import { AppLayoutContextType } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Checkbox } from '../components/ui/Checkbox';
import { TaskStatusBadge } from '../components/tasks/TaskStatusBadge';
import { TaskPriorityBadge } from '../components/tasks/TaskPriorityBadge';
import { formatDate } from '../lib/utils';
import {
  ShieldCheck,
  Users,
  PlayCircle,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Flame,
  ChevronDown,
  ChevronUp,
  Calendar,
  Layers,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { openCreateModal, openDetailModal, handleToggleStatus } =
    useOutletContext<AppLayoutContextType>();

  const { data: teamProgress = [], isLoading } = useTeamProgress();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

  // If user is not admin, redirect or guard
  if (user?.role !== 'admin') {
    return (
      <div className="py-12 px-4 max-w-lg mx-auto text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The Team Hub is reserved for administrators to monitor all registered team members and tasks.
          To view this page, sign in using an Admin account or select the Admin role on login.
        </p>
        <Link to="/login">
          <Button size="sm" variant="primary">
            Switch to Admin Login
          </Button>
        </Link>
      </div>
    );
  }

  // Toggle user task expansion
  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Filter team members by search query
  const filteredTeam = teamProgress.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.user.name.toLowerCase().includes(q) ||
      item.user.email.toLowerCase().includes(q) ||
      (item.user.department && item.user.department.toLowerCase().includes(q))
    );
  });

  // Calculate high-level team metrics
  const totalMembers = teamProgress.length;
  const totalTeamTasks = teamProgress.reduce((sum, item) => sum + item.totalTasks, 0);
  const totalInProgressTasks = teamProgress.reduce((sum, item) => sum + item.inProgressCount, 0);
  const totalCompletedTasks = teamProgress.reduce((sum, item) => sum + item.completedCount, 0);
  const overallTeamRate =
    totalTeamTasks > 0 ? Math.round((totalCompletedTasks / totalTeamTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrator Oversight
            </span>
            <span className="text-xs text-slate-400">Group 18 Internship Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-heading text-white">
            Team Progress & Active Task Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Monitor registered active users, track tasks they are currently working on in real-time,
            and inspect overall task velocity across the internship team.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs border-0"
            leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            Assign Team Task
          </Button>
        </div>
      </div>

      {/* Aggregate Team KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Members
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {totalMembers}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Registered team users</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Working On Now
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-1">
                {totalInProgressTasks}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Tasks currently in progress</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <PlayCircle className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Completed
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
                {totalCompletedTasks}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Across all members</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Team Progress
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {overallTeamRate}%
              </p>
              <div className="w-28 bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${overallTeamRate}%` }}
                />
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Team Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team members by name, email, or department..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Showing <strong className="text-slate-800">{filteredTeam.length}</strong> registered active users</span>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-4">
              <div className="h-6 w-1/3 bg-slate-200 rounded" />
              <div className="h-4 w-1/2 bg-slate-100 rounded" />
              <div className="h-20 bg-slate-50 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* User Progress Cards List */}
      {!isLoading && (
        <div className="space-y-5">
          {filteredTeam.map(({ user: member, totalTasks, inProgressTasks, otherTasks, completedCount, pendingCount, inProgressCount, completionRate }) => {
            const isExpanded = !!expandedUsers[member.id];

            return (
              <Card key={member.id} className="overflow-hidden border-slate-200/90 shadow-2xs">
                {/* User Header & Overall Progress Tracking Bar */}
                <div className="p-5 bg-white border-b border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* User Identity */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 ring-2 ring-indigo-50 shrink-0 flex items-center justify-center">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-indigo-600">{member.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 tracking-tight font-heading">
                            {member.name}
                          </h3>
                          <Badge variant={member.role === 'admin' ? 'purple' : 'primary'} size="sm">
                            {member.role === 'admin' ? 'Admin' : 'Member'}
                          </Badge>
                          {member.department && (
                            <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                              {member.department}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{member.email}</p>
                      </div>
                    </div>

                    {/* Progress Percentage & Status Counts */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                      <div className="space-y-1 min-w-[140px]">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-500">Overall Progress ({completedCount}/{totalTasks})</span>
                          <span className="text-indigo-600 font-bold">{completionRate}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Stat Badges */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-lg" title="Currently Working On">
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>{inProgressCount} In Progress</span>
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-lg" title="Pending Tasks">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{pendingCount} Pending</span>
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg" title="Completed Tasks">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{completedCount} Done</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tasks Breakdown */}
                <div className="p-5 bg-slate-50/50 space-y-4">
                  {/* Section 1: "Currently Working On" Tasks */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Currently Working On
                      </h4>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full">
                        {inProgressCount} active
                      </span>
                    </div>

                    {inProgressTasks.length === 0 ? (
                      <div className="p-3.5 rounded-xl border border-dashed border-slate-200 bg-white text-xs text-slate-400 text-center">
                        No tasks currently in progress for this member.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {inProgressTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-indigo-100 bg-white hover:border-indigo-300 transition-all shadow-2xs gap-3"
                          >
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <Checkbox
                                checked={false}
                                onChange={() => handleToggleStatus(task.id)}
                                aria-label="Mark task as completed"
                              />
                              <div
                                className="cursor-pointer min-w-0 flex-1"
                                onClick={() => openDetailModal(task)}
                              >
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-indigo-600">
                                    {task.title}
                                  </span>
                                  {task.category && (
                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                      {task.category}
                                    </span>
                                  )}
                                </div>
                                {task.description && (
                                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0 justify-between sm:justify-end">
                              <TaskPriorityBadge priority={task.priority} />
                              <TaskStatusBadge status={task.status} />
                              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{formatDate(task.dueDate)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 2: "All Other Tasks" Accordion */}
                  {otherTasks.length > 0 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => toggleUserExpanded(member.id)}
                        className="flex items-center justify-between w-full py-2 px-3 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>All Other Tasks ({otherTasks.length} pending & completed)</span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="space-y-2 mt-2.5 pl-2 border-l-2 border-slate-200">
                          {otherTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-colors gap-2 ${
                                task.status === 'completed'
                                  ? 'bg-slate-50/60 border-slate-200/60 opacity-80'
                                  : 'bg-white border-slate-200/80 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <Checkbox
                                  checked={task.status === 'completed'}
                                  onChange={() => handleToggleStatus(task.id)}
                                />
                                <div
                                  className="cursor-pointer min-w-0"
                                  onClick={() => openDetailModal(task)}
                                >
                                  <span
                                    className={`text-xs font-medium ${
                                      task.status === 'completed'
                                        ? 'line-through text-slate-400'
                                        : 'text-slate-900 hover:text-indigo-600'
                                    }`}
                                  >
                                    {task.title}
                                  </span>
                                  {task.category && (
                                    <span className="text-[10px] text-slate-400 ml-2">
                                      ({task.category})
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <TaskPriorityBadge priority={task.priority} />
                                <TaskStatusBadge status={task.status} />
                                <span className="text-[11px] text-slate-500">
                                  {formatDate(task.dueDate)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
