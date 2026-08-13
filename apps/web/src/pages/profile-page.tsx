import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Camera } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { apiRequest } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/get-initials';

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth/login', { replace: true });
    }
  }, [user, navigate]);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email] = useState(user?.email || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const initials = getInitials(fullName, email);

  // Use preview if available, otherwise use the stored profile photo URL
  const displayAvatarUrl = avatarPreview || user?.profilePhotoUrl;

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!fullName.trim()) {
      alert('Please enter your full name');
      return;
    }

    setIsSaving(true);
    try {
      // Create FormData for multipart request
      const formData = new FormData();

      if (fullName) {
        formData.append('full_name', fullName);
      }

      if (avatarFile) {
        formData.append('profile_photo', avatarFile);
      }

      // Call API to update profile
      const updatedUser = await apiRequest<typeof user>('/users/me', {
        method: 'PUT',
        body: formData,
      });

      // Update auth store with new user data
      useAuthStore.setState((state) => ({
        user: updatedUser,
      }));

      // Reset avatar file after successful save
      setAvatarFile(null);
      setAvatarPreview(null);

      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to update profile: ${message}`);
    } finally {
      setIsSaving(false);
    }
  }, [fullName, avatarFile]);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Settings"
        description="Manage your account information and preferences."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SurfaceCard>
            <div className="flex flex-col items-center text-center">
              <div
                className="relative mb-4 group cursor-pointer"
                onClick={handleAvatarClick}
              >
                <Avatar className="size-16">
                  <AvatarImage src={displayAvatarUrl || undefined} />
                  <AvatarFallback className="bg-blue-600 text-lg font-medium text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="size-5 text-white" />
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                aria-label="Upload profile picture"
              />

              <p className="text-sm font-medium text-slate-900">
                {fullName || 'User'}
              </p>

              <p className="text-xs text-slate-500">{email}</p>
            </div>
          </SurfaceCard>
        </div>

        <div className="lg:col-span-2">
          <SurfaceCard>
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Personal Information
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Profile Picture
                  </label>
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm font-medium"
                  >
                    <Camera className="size-4 mx-auto mb-1" />
                    Click to upload a profile picture
                  </button>
                  <p className="text-xs text-slate-500 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
