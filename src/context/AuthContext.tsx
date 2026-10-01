import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { getSavedSession, getUserById, getUsers, saveSession, subscribeDb } from '../services/db';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, pass?: string) => { success: boolean; error?: string };
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
  isCustomer: boolean;
  isStaff: boolean;
  isManager: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync with DB
  const refreshUser = () => {
    const saved = getSavedSession();
    if (saved) {
      // re-fetch from db to get latest status/role
      const fresh = getUserById(saved.user_id);
      if (fresh) {
        if (fresh.account_status === 'suspended') {
          // If suspended during session, auto logout
          saveSession(null);
          setCurrentUser(null);
        } else {
          setCurrentUser(fresh);
          saveSession(fresh);
        }
      } else {
        setCurrentUser(saved);
      }
    } else {
      // Default to customer on fresh first load so demo is instant
      const allUsers = getUsers();
      const defaultCustomer = allUsers.find((u) => u.role === 'customer') || allUsers[0];
      if (defaultCustomer && defaultCustomer.account_status !== 'suspended') {
        setCurrentUser(defaultCustomer);
        saveSession(defaultCustomer);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
    const unsub = subscribeDb(() => {
      const saved = getSavedSession();
      if (saved) {
        const fresh = getUserById(saved.user_id);
        if (fresh && fresh.account_status === 'suspended') {
          saveSession(null);
          setCurrentUser(null);
        } else if (fresh) {
          setCurrentUser(fresh);
        }
      }
    });
    return unsub;
  }, []);

  const login = (email: string, _pass?: string): { success: boolean; error?: string } => {
    const users = getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!found) {
      return { success: false, error: 'No account found with this email. Please check credentials.' };
    }

    if (found.account_status === 'suspended') {
      return {
        success: false,
        error: 'Account Suspended: Access has been disabled by an administrator. Please contact Canteen Support.',
      };
    }

    saveSession(found);
    setCurrentUser(found);
    return { success: true };
  };

  const logout = () => {
    saveSession(null);
    setCurrentUser(null);
  };

  // Instant switcher for demo & hackathon judging convenience
  const switchDemoRole = (role: UserRole) => {
    const users = getUsers();
    const target = users.find((u) => u.role === role && u.account_status === 'active');
    if (target) {
      saveSession(target);
      setCurrentUser(target);
    }
  };

  const isCustomer = currentUser?.role === 'customer';
  const isStaff = currentUser?.role === 'staff';
  const isManager = currentUser?.role === 'manager';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        logout,
        switchDemoRole,
        isCustomer,
        isStaff,
        isManager,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
