
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../utils/firebaseAuth';
import { useToast } from '../hooks/use-toast';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { success, error } = await logoutUser();
      
      if (success) {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully",
        });
        navigate('/login');
      } else if (error) {
        toast({
          title: "Sign out failed",
          description: error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5">
      <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="self-center text-xl font-semibold whitespace-nowrap">MCC Tracker</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700">
                {currentUser?.email}
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                asChild
              >
                <Link to="/login">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
