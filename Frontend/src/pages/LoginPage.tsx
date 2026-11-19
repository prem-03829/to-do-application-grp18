import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { Layers, Eye, EyeOff, Sparkles, User, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'admin']),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'rushikesh.jagtap@college.edu',
      password: 'password123',
      role: 'user',
    },
  });

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setValue('role', role);
    if (role === 'admin') {
      setValue('email', 'admin@taskflow.dev');
      setValue('password', 'password123');
    } else {
      setValue('email', 'rushikesh.jagtap@college.edu');
      setValue('password', 'password123');
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login({
        email: data.email,
        password: data.password,
        role: data.role,
      });
      toast.success(
        data.role === 'admin'
          ? 'Welcome, Administrator! Team Hub ready.'
          : 'Welcome back to TaskFlow!'
      );
      const destination =
        (location.state as any)?.from?.pathname || (data.role === 'admin' ? '/admin' : '/');
      navigate(destination, { replace: true });
    } catch (err: any) {
      setServerError(err.message || 'Login failed. Please check your credentials.');
      toast.error('Authentication error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon & Heading */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Layers className="w-7 h-7 stroke-[2.2]" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
          Sign in to TaskFlow
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Modern task management & college internship workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80 sm:px-10 space-y-6">
          {/* Role Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleSelectRole('user')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'user'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Normal User</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Admin / Lead</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 px-0.5">
              {selectedRole === 'admin'
                ? '⚡ Admin view allows monitoring active team members, tasks in-progress, and overall progress.'
                : '💼 Normal user view manages personal tasks, deadlines, and daily focus.'}
            </p>
          </div>

          {/* Quick Demo Pre-fill Pill */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="text-[11px] text-slate-600">
                <span className="font-semibold text-indigo-900 block">
                  {selectedRole === 'admin' ? 'Admin Demo Loaded' : 'User Demo Loaded'}
                </span>
                <span>Pre-filled with test credentials</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectRole('user')}
                className={`text-[11px] font-semibold px-2 py-1 rounded-md border shadow-2xs cursor-pointer ${
                  selectedRole === 'user' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                className={`text-[11px] font-semibold px-2 py-1 rounded-md border shadow-2xs cursor-pointer ${
                  selectedRole === 'admin' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {serverError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {serverError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register('role')} />

            {/* Email */}
            <Input
              label="Email address"
              type="email"
              placeholder="you@college.edu"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Password */}
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                {...register('password')}
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                label="Remember me"
              />
              <span className="text-xs text-slate-400 cursor-not-allowed">Forgot password?</span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Sign In as {selectedRole === 'admin' ? 'Admin' : 'User'}
            </Button>
          </form>

          {/* Switch to Register */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
