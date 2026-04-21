import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, initialHash } from '../../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isRecoveryMode: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const recoveryInProgress = useRef(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(() => {
    const recovery = initialHash.includes('type=recovery');
    return recovery;
  });

  useEffect(() => {
    const recovery = initialHash.includes('type=recovery');

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!recovery) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        recoveryInProgress.current = true;
        setIsRecoveryMode(true);
        return;
      }
      if (recoveryInProgress.current && (event === 'INITIAL_SESSION' || event === 'USER_UPDATED')) {
        if (event === 'USER_UPDATED') {
          recoveryInProgress.current = false;
          setIsRecoveryMode(false);
          supabase.auth.signOut();
        }
        return;
      }
      recoveryInProgress.current = false;
      setIsRecoveryMode(false);
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('makeen_chats');
    localStorage.removeItem('makeen_active_chat_id');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isRecoveryMode, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
