import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Layers, Eye, EyeOff, Check, X, User, ShieldCheck, Key, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    role: z.enum(['user', 'admin']),
    adminAccessCode: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.role === 'admin') {
        return !!data.adminAccessCode && data.adminAccessCode.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Admin access code is required for administrator accounts',
      path: ['adminAccessCode'],
    }
  );

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'user',
      adminAccessCode: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');
  const hasMinLength = passwordValue.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(passwordValue);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setValue('role', role);
    if (role === 'user') {
      clearErrors('adminAccessCode');
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await registerAuth({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        adminAccessCode: data.role === 'admin' ? data.adminAccessCode?.trim() : undefined,
      });
      toast.success(
        data.role === 'admin'
          ? 'Admin account created! Welcome to Team Hub.'
          : 'Account created! Welcome to TaskFlow.'
      );
      navigate(data.role === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please try again.');
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Layers className="w-7 h-7 stroke-[2.2]" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
          Create your TaskFlow account
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Get started with your college internship productivity suite
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80 sm:px-10 space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2">
              Select Your Account Role
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleRoleChange('user')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedRole === 'user'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <User className="w-4 h-4 text-indigo-600" />
                  {selectedRole === 'user' && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-900">Normal User</span>
                <span className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Personal dashboard & tasks
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  {selectedRole === 'admin' && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-900">Admin Lead</span>
                <span className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Track all team progress & tasks
                </span>
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

            {/* Admin Access Code Field (Required only for Admin role) */}
            {selectedRole === 'admin' && (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-slate-50 border border-indigo-200/90 space-y-2.5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Admin Authorization Code</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValue('adminAccessCode', 'ADMIN2025', { shouldValidate: true })}
                    className="text-[10px] font-semibold text-indigo-700 hover:text-indigo-800 bg-white px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs hover:bg-indigo-50 transition-colors cursor-pointer"
                    title="Fill the demo authorization code"
                  >
                    Use Demo Code
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Access Code"
                    type={showAdminCode ? 'text' : 'password'}
                    placeholder="Enter admin access code"
                    error={errors.adminAccessCode?.message}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowAdminCode(!showAdminCode)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showAdminCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    {...register('adminAccessCode')}
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-indigo-800 bg-indigo-100/50 p-2 rounded-lg border border-indigo-200/60">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>
                    Demo access code is <strong className="font-mono font-bold text-indigo-900 bg-white px-1 py-0.5 rounded border border-indigo-200">ADMIN2025</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Full Name */}
            <Input
              label="Full name"
              placeholder="e.g. Rushikesh Jagtap"
              error={errors.name?.message}
              {...register('name')}
            />

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
                autoComplete="new-password"
                error={errors.password?.message}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                {...register('password')}
              />
            </div>

            {/* Password Requirements Checklist */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-600">
                {hasMinLength ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-300 stroke-[2]" />
                )}
                <span className={hasMinLength ? 'text-emerald-700 font-medium' : ''}>
                  At least 6 characters
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                {hasLetter ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-300 stroke-[2]" />
                )}
                <span className={hasLetter ? 'text-emerald-700 font-medium' : ''}>
                  Contains letters
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              {selectedRole === 'admin' ? (
                <span className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Register as Admin Lead</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>Register as Normal User</span>
                </span>
              )}
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
