
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Archive, FileText, Settings } from "lucide-react";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

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
            Defect Records App
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
              <span className="text-sm text-muted-foreground">
                {currentUser.email}
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
