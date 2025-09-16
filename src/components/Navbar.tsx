
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Archive, FileText, Settings, Bell, User } from "lucide-react";

const Navbar = () => {
  const { currentUser, logout, getUserData } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userCode, setUserCode] = useState<string>("");
  const navigate = useNavigate();

  // Fetch user data to get user code
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && getUserData) {
        try {
          const userData = await getUserData();
          if (userData && userData.userCode) {
            setUserCode(userData.userCode);
          } else {
            setUserCode(""); // Clear user code if not found
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserCode(""); // Clear user code on error
        }
      } else {
        setUserCode(""); // Clear user code when not logged in
      }
    };

    fetchUserData();
  }, [currentUser, getUserData]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-card border-b border-border py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold">
            Defect Records Application
          </Link>
          {currentUser && (
            <>
              <Link 
                to="/archive-records"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Archive className="h-4 w-4" />
                <span>Archives</span>
              </Link>
              <Link 
                to="/internal-notices"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Bell className="h-4 w-4" />
                <span>Internal Notices</span>
              </Link>
              <a 
                href="/service-order" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Service Order</span>
              </a>
              <a 
                href="/aircraft-admin" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>A/C ADMIN</span>
              </a>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-4">
              <Link 
                to="/profile"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <span className="text-sm text-muted-foreground font-mono">
                {userCode || currentUser.email}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
          
          {/* Version number at the end */}
          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
            v1.0.0
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
