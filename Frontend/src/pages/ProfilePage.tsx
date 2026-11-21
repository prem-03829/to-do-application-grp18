import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboardStats } from '../hooks/useTasks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';
import {
  User as UserIcon,
  Mail,
  Briefcase,
  Server,
  Database,
  Save,
  Upload,
  Camera,
  Trash2,
  Sparkles,
  Check,
} from 'lucide-react';

// Curated dynamic animated SVG characters
const ANIMATED_AVATAR_PRESETS = [
  {
    id: 'bot-1',
    name: 'Cyber Bot',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=TaskFlow&backgroundColor=ede9fe',
  },
  {
    id: 'notion-1',
    name: 'SaaS Thinker',
    url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e0e7ff',
  },
  {
    id: 'avatar-1',
    name: 'Creative Dev',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=dbeafe',
  },
  {
    id: 'thumb-1',
    name: 'Milo Spark',
    url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Milo&backgroundColor=fef3c7',
  },
  {
    id: 'pixel-1',
    name: 'Pixel Cadet',
    url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Luna&backgroundColor=fce7f3',
  },
  {
    id: 'art-1',
    name: 'Willow Art',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Willow&backgroundColor=d1fae5',
  },
];

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { data: stats } = useDashboardStats();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || 'Frontend Engineering Intern');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || ANIMATED_AVATAR_PRESETS[0].url);
  const [isSaving, setIsSaving] = useState(false);
  const [isCustomUploaded, setIsCustomUploaded] = useState(
    !!user?.avatar && user.avatar.startsWith('data:image')
  );

  const isMockMode = import.meta.env.VITE_USE_MOCK_API !== 'false';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Handle local file image upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 4MB
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image size must be less than 4MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setSelectedAvatar(base64Url);
      setIsCustomUploaded(true);
      toast.success('Custom image uploaded! Click "Save Changes" to apply.');
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomAvatar = () => {
    setSelectedAvatar(ANIMATED_AVATAR_PRESETS[0].url);
    setIsCustomUploaded(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Reverted to animated preset avatar.');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      updateUser({
        name: name.trim(),
        department: department.trim(),
        avatar: selectedAvatar,
      });
      setIsSaving(false);
      toast.success('Profile & Avatar updated successfully!');
    }, 200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-indigo-600" />
          <span>Profile & Account</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your personal details, animated avatars, and backend connection status.
        </p>
      </div>

      {/* Main Profile Info & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: User Card with Animated Avatar */}
        <Card className="lg:col-span-1 p-6 text-center flex flex-col items-center justify-between">
          <div className="flex flex-col items-center w-full">
            {/* Interactive Animated Avatar Frame */}
            <div className="relative mb-4 group">
              <div
                className="w-28 h-28 rounded-full ring-4 ring-indigo-100/80 overflow-hidden bg-gradient-to-tr from-indigo-50 to-white shadow-lg flex items-center justify-center animate-avatar-float animate-avatar-glow transition-all"
                title="Your Active Avatar"
              >
                {selectedAvatar ? (
                  <img
                    src={selectedAvatar}
                    alt={user?.name || 'User avatar'}
                    className="w-full h-full object-cover select-none"
                  />
                ) : (
                  <span className="text-3xl font-bold text-indigo-600">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>

              {/* Pulsing Online Status Badge */}
              <div
                className="absolute bottom-1 right-2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] shadow-xs"
                title="Online & Active"
              >
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative text-[10px] font-bold">✓</span>
              </div>

              {/* Click-to-upload camera overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Photo"
                className="absolute inset-0 rounded-full bg-slate-900/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-2xs cursor-pointer"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-semibold">Change</span>
              </button>
            </div>

            <h2 className="text-lg font-bold text-slate-900 tracking-tight font-heading">
              {user?.name || 'User'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>

            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              <Badge variant={user?.role === 'admin' ? 'purple' : 'primary'} size="sm">
                {user?.role === 'admin' ? 'Admin Lead' : 'Normal User'}
              </Badge>
              <Badge variant="slate" size="sm">
                Group 18
              </Badge>
            </div>
          </div>

          {/* Quick Stats in Profile Card */}
          <div className="w-full grid grid-cols-2 gap-2 mt-6 pt-6 border-t border-slate-100 text-left">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Total Tasks</span>
              <span className="text-lg font-bold text-slate-900">{stats?.total || 0}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Completed</span>
              <span className="text-lg font-bold text-emerald-600">{stats?.completed || 0}</span>
            </div>
          </div>
        </Card>

        {/* Right: Edit Form & Avatar Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Avatar Customization Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Choose Animated Avatar or Upload Image</span>
                  </CardTitle>
                  <CardDescription>
                    Select an animated vector persona or upload your own custom photo
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
              />

              {/* Upload Buttons Bar */}
              <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<Upload className="w-4 h-4 text-indigo-600" />}
                >
                  Upload Image from Device
                </Button>

                {isCustomUploaded && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCustomAvatar}
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    Remove Custom Image
                  </Button>
                )}

                <span className="text-[11px] text-slate-400 ml-auto">
                  Supports JPG, PNG, GIF, WebP (Max 4MB)
                </span>
              </div>

              {/* Animated Avatar Presets Gallery */}
              <div>
                <p className="text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2.5">
                  Animated Persona Presets
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {ANIMATED_AVATAR_PRESETS.map((preset) => {
                    const isSelected = selectedAvatar === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(preset.url);
                          setIsCustomUploaded(false);
                        }}
                        className={`group relative flex flex-col items-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-white shadow-2xs mb-1.5 avatar-hover-effect flex items-center justify-center">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span
                          className={`text-[11px] font-medium truncate w-full ${
                            isSelected ? 'text-indigo-900 font-bold' : 'text-slate-600'
                          }`}
                        >
                          {preset.name}
                        </span>

                        {isSelected && (
                          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Personal Information</CardTitle>
              <CardDescription>Update your display name and role title across TaskFlow</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    leftIcon={<UserIcon className="w-4 h-4" />}
                  />
                  <Input
                    label="Department / Role Title"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Frontend Engineering Intern"
                    leftIcon={<Briefcase className="w-4 h-4" />}
                  />
                </div>

                <Input
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                  helperText="Managed by university / authentication provider"
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSaving}
                    leftIcon={<Save className="w-3.5 h-3.5" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Internship Project & Backend Connection Status */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-600" />
                    <span>Internship Environment & Architecture</span>
                  </CardTitle>
                  <CardDescription>
                    College project configuration & Flask REST API integration status
                  </CardDescription>
                </div>
                <Badge variant={isMockMode ? 'warning' : 'success'} size="sm">
                  {isMockMode ? 'Mock Mode Active' : 'Flask Connected'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px] uppercase">Group Assignment</span>
                  <p className="font-bold text-slate-800">Group 18 Internship Project</p>
                  <p className="text-slate-500 text-[11px]">To-Do & Productivity Application</p>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px] uppercase">Backend Technology</span>
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-indigo-500" />
                    Python Flask + MySQL
                  </p>
                  <p className="text-slate-500 text-[11px] font-mono">{apiBaseUrl}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
