import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Clock,
  CheckCircle2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  counts?: {
    today: number;
    upcoming: number;
    total: number;
    completed: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
  counts,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      end: true,
    },
    {
      to: '/tasks',
      label: 'My Tasks',
      icon: <CheckSquare className="w-4 h-4 shrink-0" />,
      count: counts?.total,
    },
    {
      to: '/today',
      label: 'Today',
      icon: <Clock className="w-4 h-4 shrink-0" />,
      count: counts?.today,
      countVariant: 'amber',
    },
    {
      to: '/upcoming',
      label: 'Upcoming',
      icon: <Calendar className="w-4 h-4 shrink-0" />,
      count: counts?.upcoming,
      countVariant: 'indigo',
    },
    {
      to: '/completed',
      label: 'Completed',
      icon: <CheckCircle2 className="w-4 h-4 shrink-0" />,
      count: counts?.completed,
      countVariant: 'emerald',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 select-none">
      {/* Brand Header */}
      <div
        className={cn(
          'relative flex items-center h-16 border-b border-slate-100 transition-all',
          isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        )}
      >
        <div
          onClick={isCollapsed ? onToggleCollapse : undefined}
          className={cn(
            'flex items-center gap-2.5 min-w-0',
            isCollapsed && 'cursor-pointer justify-center hover:opacity-90 transition-opacity'
          )}
          title={isCollapsed ? 'Click to expand sidebar' : undefined}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xs shadow-indigo-500/20 shrink-0">
            <Layers className="w-5 h-5 stroke-[2.2]" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base font-heading">
                  TaskFlow
                </span>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200/60">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">Productivity Suite</p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle button */}
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'hidden lg:flex items-center justify-center transition-all cursor-pointer',
            isCollapsed
              ? 'absolute -right-3 top-5 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-500 shadow-xs hover:border-indigo-300 hover:text-indigo-600 hover:scale-110 z-40'
              : 'p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg'
          )}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Overview
          </p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onMobileClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-indigo-50/80 text-indigo-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                isCollapsed && 'justify-center px-2'
              )
            }
          >
            {item.icon}
            {!isCollapsed && (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded-full text-[11px]',
                      item.countVariant === 'amber'
                        ? 'bg-amber-100 text-amber-800'
                        : item.countVariant === 'emerald'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {!isCollapsed && (
          <div className="pt-6">
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Internship Workspace
            </p>
            <div className="mx-2 p-3 bg-gradient-to-br from-indigo-50/50 to-slate-50 rounded-xl border border-indigo-100/60">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Group 18 Project</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Frontend ready for Flask + MySQL integration. Mock API currently active.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* User Profile & Logout Section */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-slate-100/80 cursor-pointer',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
          onClick={() => {
            onMobileClose();
            navigate('/profile');
          }}
          title="Open Profile & Account Settings"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 ring-2 ring-indigo-100 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate hover:text-indigo-600 transition-colors">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user?.role || user?.email}</p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onMobileClose}
          />
          <aside className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
