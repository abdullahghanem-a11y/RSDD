import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  university: string;
  department: string;
  phone: string;
  address: string;
  profileImage: string | null;
  academicDepartment: string;
  administrativeDepartment: string;
}

interface UserContextType {
  userProfile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  uploadProfileImage: (imageData: string) => void;
  deleteProfileImage: () => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children, initialUser }: { children: ReactNode; initialUser: { name: string; email: string; } }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const stored = localStorage.getItem('rsdd-user-profile');
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      name: initialUser.name,
      email: initialUser.email,
      university: 'final',
      department: 'Computer Science',
      phone: '+1 (555) 123-4567',
      address: '',
      profileImage: null,
      academicDepartment: 'computer-eng',
      administrativeDepartment: 'none',
    };
  });

  useEffect(() => {
    localStorage.setItem('rsdd-user-profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const uploadProfileImage = (imageData: string) => {
    setUserProfile(prev => ({ ...prev, profileImage: imageData }));
  };

  const deleteProfileImage = () => {
    setUserProfile(prev => ({ ...prev, profileImage: null }));
  };

  const changePassword = (oldPassword: string, newPassword: string) => {
    // In a real app, this would validate and update the password
    // For now, we'll just return true
    return true;
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        updateProfile,
        uploadProfileImage,
        deleteProfileImage,
        changePassword,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
