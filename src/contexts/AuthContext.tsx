import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus;
  isPremium: boolean;
  checkSubscription: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PREMIUM_PRODUCT_ID = 'prod_TMARhd5DIPYBVy'; // Plan Premium

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    product_id: null,
    subscription_end: null,
  });

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscriptionStatus({
          subscribed: false,
          product_id: null,
          subscription_end: null,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      if (data) {
        setSubscriptionStatus(data);
      }
    } catch (error) {
      console.error('Error in checkSubscription:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkSubscription();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkSubscription();
      } else {
        setSubscriptionStatus({
          subscribed: false,
          product_id: null,
          subscription_end: null,
        });
      }
    });

    // Check subscription periodically
    const interval = setInterval(() => {
      if (user) {
        checkSubscription();
      }
    }, 60000); // Every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSubscriptionStatus({
      subscribed: false,
      product_id: null,
      subscription_end: null,
    });
  };

  const isPremium = subscriptionStatus.subscribed && 
    subscriptionStatus.product_id === PREMIUM_PRODUCT_ID;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        subscriptionStatus,
        isPremium,
        checkSubscription,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}