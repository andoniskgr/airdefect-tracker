
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { observeAuthState, getCurrentUser } from '../utils/firebaseAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

interface AuthContextProps {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  loading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = observeAuthState((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate, toast]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
};
