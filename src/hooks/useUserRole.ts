import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useUserRole = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<{ role?: string; [key: string]: unknown } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setUserProfile(null);
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        // Use secure role checking function
        const { data: hasAdminRole, error: roleError } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (!roleError) {
          setIsAdmin(hasAdminRole || false);
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user role:', error);
        setIsAdmin(false);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  return { isAdmin, userProfile, loading };
};