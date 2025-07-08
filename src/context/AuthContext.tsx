import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Session,
  User,
  AuthError,
} from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  created_at: string | null;
  updated_at: string | null;
}

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: AuthError | null;
    data: Session | null;
  }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user profile for development
const createMockUserProfile = (userId: string, email: string, isAdmin = false): UserProfile => {
  return {
    id: userId,
    full_name: email.split('@')[0],
    email: email,
    role: isAdmin ? 'admin' : 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Check for stored mock auth in localStorage
  useEffect(() => {
    const checkMockAuth = () => {
      const mockAuthData = localStorage.getItem('mockAuthData');
      if (mockAuthData) {
        try {
          const { mockUser, mockSession, mockProfile } = JSON.parse(mockAuthData);
          console.log("Found stored mock auth data:", { mockUser, mockSession, mockProfile });
          setUser(mockUser);
          setSession(mockSession);
          setUserProfile(mockProfile);
          setIsAdmin(mockProfile?.role === 'admin');
        } catch (error) {
          console.error("Error parsing stored mock auth data:", error);
          localStorage.removeItem('mockAuthData');
        }
      }
      setIsLoading(false);
    };
    
    checkMockAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Signing in with email:", email);
      
      // Special case for "admin" username - auto login without password
      if (email.toLowerCase() === "admin") {
        console.log("Admin auto-login detected");
        const mockUserId = `admin-user-${Date.now()}`;
        const mockUser = {
          id: mockUserId,
          email: "admin@example.com",
          user_metadata: { name: "Administrator" }
        };
        const mockSession = {
          user: mockUser,
          access_token: "mock-token",
          refresh_token: "mock-refresh-token"
        };
        
        const mockProfile = createMockUserProfile(mockUserId, "admin@example.com", true);
        
        // Store mock auth data in localStorage
        localStorage.setItem('mockAuthData', JSON.stringify({
          mockUser,
          mockSession,
          mockProfile
        }));
        
        setUser(mockUser as User);
        setSession(mockSession as Session);
        setUserProfile(mockProfile);
        setIsAdmin(true);
        setIsLoading(false);
        
        return {
          error: null,
          data: mockSession as Session
        };
      }
      
      // For development, allow any login
      if (import.meta.env.DEV) {
        console.log("DEV mode: Creating mock user session");
        const mockUserId = `mock-user-${Date.now()}`;
        const mockUser = {
          id: mockUserId,
          email: email,
          user_metadata: { name: email.split('@')[0] }
        };
        const mockSession = {
          user: mockUser,
          access_token: "mock-token",
          refresh_token: "mock-refresh-token"
        };
        
        // Determine if this should be an admin user (first user or specific email)
        const isFirstUser = localStorage.getItem('userCount') === null;
        const isAdminEmail = email.includes('admin');
        const shouldBeAdmin = isFirstUser || isAdminEmail;
        
        if (isFirstUser) {
          localStorage.setItem('userCount', '1');
        }
        
        const mockProfile = createMockUserProfile(mockUserId, email, shouldBeAdmin);
        
        // Store mock auth data in localStorage
        localStorage.setItem('mockAuthData', JSON.stringify({
          mockUser,
          mockSession,
          mockProfile
        }));
        
        setUser(mockUser as User);
        setSession(mockSession as Session);
        setUserProfile(mockProfile);
        setIsAdmin(shouldBeAdmin);
        setIsLoading(false);
        
        return {
          error: null,
          data: mockSession as Session
        };
      }
      
      // Use the actual Supabase auth in production
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (response.error) {
        console.error("Sign in error:", response.error);
        setIsLoading(false);
        return {
          error: response.error,
          data: null
        };
      }
      
      console.log("Sign in successful");
      setIsLoading(false);
      return {
        error: response.error,
        data: response.data.session,
      };
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
      setIsLoading(false);
      return {
        error: new Error("An unexpected error occurred") as AuthError,
        data: null,
      };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      console.log("Signing out");
      
      // Clear mock auth data from localStorage
      localStorage.removeItem('mockAuthData');
      
      // Reset state
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsAdmin(false);
      
      // Also call Supabase signOut to be thorough
      await supabase.auth.signOut();
      
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    userProfile,
    isLoading,
    signIn,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};