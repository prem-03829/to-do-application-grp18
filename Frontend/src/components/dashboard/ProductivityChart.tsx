import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Task } from '../../types';

interface ProductivityChartProps {
  tasks: Task[];
}

export const ProductivityChart: React.FC<ProductivityChartProps> = ({ tasks }) => {
  // 1. Calculate status distribution
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const total = tasks.length;

  const statusData = [
    { name: 'Pending', value: pendingCount, color: '#94a3b8' },
    { name: 'In Progress', value: inProgressCount, color: '#6366f1' },
    { name: 'Completed', value: completedCount, color: '#10b981' },
  ].filter((item) => item.value > 0);

  // 2. Calculate completion activity by day of the week
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate 7-day rolling window
  const weeklyData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = daysOfWeek[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];

    const completedOnDay = tasks.filter(
      (t) => t.status === 'completed' && t.dueDate === dateStr
    ).length;

    const createdOnDay = tasks.filter(
      (t) => t.createdAt.startsWith(dateStr)
    ).length;

    return {
      day: dayName,
      date: dateStr,
      completed: completedOnDay,
      created: createdOnDay,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 7-Day Velocity Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Weekly Task Activity</CardTitle>
              <CardDescription>
                Overview of tasks created vs completed across the week
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Created
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Completed
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: '#f1f5f9', opacity: 0.6 }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="created" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution Donut Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Task Distribution</CardTitle>
          <CardDescription>Proportion of tasks by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 w-full flex items-center justify-center relative">
            {total === 0 ? (
              <p className="text-xs text-slate-400">No tasks to display</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Center stat in donut */}
            {total > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900">{total}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Tasks</span>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-100 mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Pending
              </span>
              <span className="font-semibold text-slate-800">{pendingCount} ({total > 0 ? Math.round((pendingCount / total) * 100) : 0}%)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                In Progress
              </span>
              <span className="font-semibold text-slate-800">{inProgressCount} ({total > 0 ? Math.round((inProgressCount / total) * 100) : 0}%)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Completed
              </span>
              <span className="font-semibold text-slate-800">{completedCount} ({total > 0 ? Math.round((completedCount / total) * 100) : 0}%)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
