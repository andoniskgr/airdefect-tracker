
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { registerUser } from '../utils/firebaseAuth';
import { UserPlus, User } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Password is too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { user, error } = await registerUser(email, password);
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      if (user) {
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center mb-6">
          <User className="w-12 h-12 text-primary mb-2" />
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-gray-500 mt-1">Sign up to start using MCC Tracker</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <span>Creating account...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
