import { useState, useRef } from 'react';
import { LogOut, User, Mail, Save, MapPin, Calendar as CalendarIcon, Settings, Shield, Bell, Book, Building, Camera, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { useUser } from '../contexts/UserContext';

interface ProfilePageProps {
  user: {
    name: string;
    email: string;
    department: string;
    phone: string;
  };
  onLogout: () => void;
  isDarkMode: boolean;
  userType: 'admin' | 'dean' | 'director';
}

export function ProfilePage({ user, onLogout, isDarkMode, userType }: ProfilePageProps) {
  const { userProfile, updateProfile, uploadProfileImage, deleteProfileImage, changePassword } = useUser();
  const [address, setAddress] = useState(userProfile.address);
  const [university, setUniversity] = useState(userProfile.university);
  const [academicDept, setAcademicDept] = useState(userProfile.academicDepartment);
  const [adminDept, setAdminDept] = useState(userProfile.administrativeDepartment);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        uploadProfileImage(imageData);
        toast.success('Profile picture updated successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    deleteProfileImage();
    toast.success('Profile picture deleted successfully');
  };

  const handleSaveChanges = () => {
    updateProfile({
      address,
      university,
      academicDepartment: academicDept,
      administrativeDepartment: adminDept,
      email: user.email, // Update email with new university domain
    });
    toast.success('Profile updated successfully');
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const success = changePassword(oldPassword, newPassword);
    if (success) {
      toast.success('Password changed successfully');
      setIsPasswordDialogOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error('Old password is incorrect');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0e1a]' : 'bg-[#f8f9fa]'} p-8`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
        {/* Left Profile Card */}
        <div className={`rounded-lg p-6 border h-fit ${
          isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'
        }`}>
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              {userProfile.profileImage ? (
                <img 
                  src={userProfile.profileImage} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-[#2463eb] rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">{initials}</span>
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 w-24 h-24 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <h3 className={`text-center mb-1 mt-4 ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>{user.name}</h3>
            <p className={`text-center text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
              {user.email}@{university}.edu.tr
            </p>
            <span className="mt-2 px-3 py-1 bg-[#6366f1] text-white text-xs rounded-full capitalize">
              {userType}
            </span>
          </div>

          <Separator className={`my-4 ${isDarkMode ? 'bg-[#2a3544]' : 'bg-[#e5e7eb]'}`} />

          {/* University */}
          <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-[#0f1621]' : 'bg-[#f8f9fa]'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Building className={`w-4 h-4 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>University</span>
            </div>
            <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>{university}</span>
          </div>

          {/* Academic Department */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Book className={`w-4 h-4 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>Academic Department</span>
            </div>
            <Select value={academicDept} onValueChange={setAcademicDept}>
              <SelectTrigger className={isDarkMode 
                ? 'bg-[#0f1621] border-[#2a3544] text-white'
                : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a]'
              }>
                <SelectValue placeholder="-- Select Academic Department --" />
              </SelectTrigger>
              <SelectContent className={isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'}>
                <SelectItem value="none" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>-- Select Academic Department --</SelectItem>
                <SelectItem value="computer-eng" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Computer Engineer</SelectItem>
                <SelectItem value="cs" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Computer Science</SelectItem>
                <SelectItem value="software-eng" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Software Engineering</SelectItem>
                <SelectItem value="electrical-eng" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Electrical Engineering</SelectItem>
                <SelectItem value="mechanical-eng" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Mechanical Engineering</SelectItem>
                <SelectItem value="civil-eng" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Civil Engineering</SelectItem>
                <SelectItem value="industrial-eng" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Industrial Engineering</SelectItem>
                <SelectItem value="mathematics" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Mathematics</SelectItem>
                <SelectItem value="physics" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Physics</SelectItem>
                <SelectItem value="chemistry" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Chemistry</SelectItem>
                <SelectItem value="biology" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Biology</SelectItem>
                <SelectItem value="medicine" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Medicine</SelectItem>
                <SelectItem value="business" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Business Administration</SelectItem>
                <SelectItem value="economics" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Economics</SelectItem>
                <SelectItem value="law" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Law</SelectItem>
                <SelectItem value="architecture" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Architecture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Administrative Department */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Building className={`w-4 h-4 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>Administrative Department</span>
            </div>
            <Select value={adminDept} onValueChange={setAdminDept}>
              <SelectTrigger className={isDarkMode 
                ? 'bg-[#0f1621] border-[#2a3544] text-white'
                : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a]'
              }>
                <SelectValue placeholder="-- Select Administrative Department --" />
              </SelectTrigger>
              <SelectContent className={isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'}>
                <SelectItem value="none" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>-- Select Administrative Department --</SelectItem>
                <SelectItem value="admin" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Administration</SelectItem>
                <SelectItem value="hr" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Human Resources</SelectItem>
                <SelectItem value="finance" className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Address */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className={`w-4 h-4 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>Address</span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>
              {userProfile.address || 'Not specified'}
            </p>
          </div>

          {/* Member Since */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className={`w-4 h-4 ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>Member Since</span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>Oct 2025</p>
          </div>

          <Separator className={`my-4 ${isDarkMode ? 'bg-[#2a3544]' : 'bg-[#e5e7eb]'}`} />

          {/* Delete Picture Button */}
          {userProfile.profileImage && (
            <Button
              onClick={handleDeleteImage}
              variant="outline"
              className={`w-full mb-2 ${
                isDarkMode 
                  ? 'border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626] hover:text-white' 
                  : 'border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626] hover:text-white'
              }`}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Picture
            </Button>
          )}

          {/* Sign Out Button */}
          <Button
            onClick={onLogout}
            className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Right Account Settings Card */}
        <div className={`lg:col-span-2 rounded-lg p-6 border ${
          isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'
        }`}>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Settings className={`w-5 h-5 ${isDarkMode ? 'text-[#2463eb]' : 'text-[#2463eb]'}`} />
              <h2 className={`${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>Account Settings</h2>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
              Update your personal information and preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className={`w-4 h-4 ${isDarkMode ? 'text-[#2463eb]' : 'text-[#2463eb]'}`} />
                <h3 className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`text-sm mb-2 block ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                    FULL NAME
                  </label>
                  <Input
                    value={user.name}
                    className={isDarkMode 
                      ? 'bg-[#0f1621] border-[#2a3544] text-white'
                      : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a]'
                    }
                    readOnly
                  />
                </div>
                <div>
                  <label className={`text-sm mb-2 block ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                    EMAIL ADDRESS
                  </label>
                  <Input
                    value={`${user.email}@${university}.edu.tr`}
                    className={isDarkMode 
                      ? 'bg-[#0f1621] border-[#2a3544] text-white'
                      : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a]'
                    }
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm mb-2 block ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                    ADDRESS
                  </label>
                  <Input
                    placeholder="Enter your address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={isDarkMode 
                      ? 'bg-[#0f1621] border-[#2a3544] text-white placeholder:text-[#4a5568]'
                      : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a] placeholder:text-[#999999]'
                    }
                  />
                </div>
                <div>
                  <label className={`text-sm mb-2 block ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                    UNIVERSITY
                  </label>
                  <Input
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className={isDarkMode 
                      ? 'bg-[#0f1621] border-[#2a3544] text-white'
                      : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a]'
                    }
                  />
                </div>
              </div>
            </div>

            <Separator className={isDarkMode ? 'bg-[#2a3544]' : 'bg-[#e5e7eb]'} />

            {/* Security Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className={`w-4 h-4 ${isDarkMode ? 'text-[#2463eb]' : 'text-[#2463eb]'}`} />
                <h3 className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Security</h3>
              </div>
              
              <div className={`p-4 rounded-lg flex items-center justify-between ${
                isDarkMode ? 'bg-[#0f1621]' : 'bg-[#f8f9fa]'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#fbbf24] rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>Password</p>
                    <p className={`text-xs ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                      Last changed Nov 24, 2025
                    </p>
                  </div>
                </div>
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm"
                      className="bg-[#fbbf24] hover:bg-[#f59e0b] text-white"
                    >
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className={isDarkMode ? 'bg-[#1a2332] border-[#2a3544]' : 'bg-white border-[#e5e7eb]'}>
                    <DialogHeader>
                      <DialogTitle className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Change Password</DialogTitle>
                      <DialogDescription className={isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}>
                        Enter your current password and a new password
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Current Password</Label>
                        <Input
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className={`mt-2 ${isDarkMode
                            ? 'bg-[#0f1621] border-[#2a3544] text-white'
                            : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a]'
                          }`}
                        />
                      </div>
                      <div>
                        <Label className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>New Password</Label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`mt-2 ${isDarkMode
                            ? 'bg-[#0f1621] border-[#2a3544] text-white'
                            : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a]'
                          }`}
                        />
                      </div>
                      <div>
                        <Label className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Confirm New Password</Label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`mt-2 ${isDarkMode
                            ? 'bg-[#0f1621] border-[#2a3544] text-white'
                            : 'bg-[#f8f9fa] border-[#e5e7eb] text-[#1a1a1a]'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsPasswordDialogOpen(false)}
                        className={isDarkMode ? 'border-[#2a3544] text-white' : ''}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleChangePassword}
                        className="bg-[#fbbf24] hover:bg-[#f59e0b] text-white"
                      >
                        Change Password
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Separator className={isDarkMode ? 'bg-[#2a3544]' : 'bg-[#e5e7eb]'} />

            {/* Notifications Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bell className={`w-4 h-4 ${isDarkMode ? 'text-[#2463eb]' : 'text-[#2463eb]'}`} />
                <h3 className={isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}>Notifications</h3>
              </div>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg flex items-center justify-between ${
                  isDarkMode ? 'bg-[#0f1621]' : 'bg-[#f8f9fa]'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2463eb] rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>Push Notifications</p>
                      <p className={`text-xs ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                        Receive push notifications on your device
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className={`p-4 rounded-lg flex items-center justify-between ${
                  isDarkMode ? 'bg-[#0f1621]' : 'bg-[#f8f9fa]'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#10b981] rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>Daily Email Digest</p>
                      <p className={`text-xs ${isDarkMode ? 'text-[#8b94a8]' : 'text-[#666666]'}`}>
                        Get a daily summary of activity via email
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <Separator className={isDarkMode ? 'bg-[#2a3544]' : 'bg-[#e5e7eb]'} />

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveChanges} className="bg-[#2463eb] hover:bg-[#1d4ed8] text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}