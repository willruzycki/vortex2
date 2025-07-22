import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { motion } from 'framer-motion';
import { Camera, Save, User as UserIcon, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/SidebarContext';
import { createPageUrl } from '@/utils';

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    avatar_url: '',
    cover_image_url: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(null); // 'avatar' or 'cover'

  const { isDesktopSidebarOpen } = useSidebar();
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setFormData({
          full_name: currentUser.full_name || '',
          username: currentUser.username || '',
          bio: currentUser.bio || '',
          avatar_url: currentUser.avatar_url || '',
          cover_image_url: currentUser.cover_image_url || '',
        });
      } catch (e) {
        console.error("Failed to fetch user", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(type);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, [`${type}_url`]: file_url }));
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error);
    } finally {
      setIsUploading(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await User.updateMyUserData(formData);
      // Redirect to profile page after saving
      window.location.href = createPageUrl('Profile');
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-800 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mx-auto px-4 transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? 'max-w-4xl' : 'max-w-full md:px-12'}`}
      >
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Cover Image */}
            <div className="relative h-48 md:h-64 bg-gray-200">
              {formData.cover_image_url && <img src={formData.cover_image_url} alt="Cover" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Button type="button" variant="outline" onClick={() => coverInputRef.current.click()} disabled={isUploading === 'cover'}>
                  {isUploading === 'cover' ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                  {isUploading === 'cover' ? 'Uploading...' : 'Change Cover'}
                </Button>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'cover')} />
              </div>
            </div>

            {/* Avatar & Content */}
            <div className="p-6 md:p-8">
              <div className="relative -mt-24 md:-mt-32">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto relative border-4 border-white shadow-lg bg-gray-300">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <UserIcon className="w-1/2 h-1/2 text-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button type="button" size="icon" variant="ghost" className="text-white hover:text-white" onClick={() => avatarInputRef.current.click()} disabled={isUploading === 'avatar'}>
                      {isUploading === 'avatar' ? <Loader className="w-5 h-5 animate-spin" /> : <Camera className="w-6 h-6" />}
                    </Button>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'avatar')} />
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="mt-8 max-w-lg mx-auto space-y-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} />
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <Input id="username" name="username" value={formData.username} onChange={handleInputChange} placeholder="e.g., aicreator123" />
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                  <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell us about yourself..." />
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}