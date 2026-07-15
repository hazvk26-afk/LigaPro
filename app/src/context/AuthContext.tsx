import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getCurrentUser, setCurrentUser as saveCurrentUser, getProfiles } from '../services/db';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginAsHincha: (clubId?: string | null) => void;
  loginAsAdmin: (username: string, password?: string) => Promise<boolean>;
  loginWithProfile: (profile: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadedUser = getCurrentUser();
    setUser(loadedUser);
    setLoading(false);
  }, []);

  const loginAsHincha = (clubId?: string | null) => {
    const defaultHincha: UserProfile = {
      id: 'user-hincha-temp',
      display_name: 'Invitado Hincha',
      role: 'hincha',
      favorite_club_id: clubId || 'club-barcelona',
      notification_preferences: {
        match_reminders: true,
        results: true,
        sanctions: false
      }
    };
    setUser(defaultHincha);
    saveCurrentUser(defaultHincha);
  };

  const loginAsAdmin = async (username: string, passwordInput?: string): Promise<boolean> => {
    // Check in database profiles for admin-like roles
    const profiles = await getProfiles();
    const found = profiles.find(
      p => p.display_name.toLowerCase().includes(username.toLowerCase()) || 
           p.role === username.toLowerCase() || 
           (username.toLowerCase() === 'admin' && p.role === 'maintenance_chief')
    );

    if (found) {
      // Validate password if it is stored in the profile
      if (found.password && found.password !== passwordInput) {
        return false;
      }
      setUser(found);
      saveCurrentUser(found);
      return true;
    }
    
    // Fallback default admin if typed 'admin'
    if (username.toLowerCase() === 'admin') {
      const defaultAdmin: UserProfile = {
        id: 'user-admin-default',
        display_name: 'Administrador General',
        role: 'maintenance_chief'
      };
      setUser(defaultAdmin);
      saveCurrentUser(defaultAdmin);
      return true;
    }

    return false;
  };

  const loginWithProfile = (profile: UserProfile) => {
    setUser(profile);
    saveCurrentUser(profile);
  };

  const logout = () => {
    setUser(null);
    saveCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAsHincha, loginAsAdmin, loginWithProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
