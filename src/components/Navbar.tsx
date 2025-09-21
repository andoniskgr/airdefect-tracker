import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  User,
  Menu,
  X,
  Settings,
  Users,
  FileText,
  Bell,
  Archive,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { getVersionString } from "@/utils/version";

const Navbar = () => {
  const { currentUser, userData, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
          <Link
            to="/"
            className={cn("font-bold", isMobile ? "text-lg" : "text-xl")}
          >
            {isMobile ? "MCC App" : "Defect Records Application"}
          </Link>

          {/* Desktop Navigation - Hidden on mobile and tablet */}
          {currentUser && !isMobile && (
            <div className="hidden lg:flex items-center gap-4">
              <Link
                to="/service-order"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Service Order</span>
              </Link>
              <Link
                to="/internal-notices"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Bell className="h-4 w-4" />
                <span>Internal Notices</span>
              </Link>
              <Link
                to="/archive-records"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Archive className="h-4 w-4" />
                <span>Archive</span>
              </Link>
              <Link
                to="/aircraft-admin"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Admin Aircraft</span>
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          {isMobile && currentUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Desktop User Actions */}
          {currentUser && !isMobile ? (
            <div className="flex items-center gap-4">
              {/* Admin Links */}
              {userData?.role === "admin" && (
                <Link
                  to="/user-management"
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </Link>
              )}

              <Link
                to="/profile"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <span className="text-sm text-muted-foreground font-mono">
                {userData?.userCode || currentUser.email}
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
          ) : !currentUser ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          ) : null}

          {/* Version number */}
          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
            {getVersionString()}
          </span>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && currentUser && isMobileMenuOpen && (
        <div className="border-t border-border bg-card">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* Admin Links */}
            {userData?.role === "admin" && (
              <Link
                to="/user-management"
                className="flex items-center gap-3 text-purple-600 hover:text-purple-800 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Users className="h-5 w-5" />
                <span className="text-base">User Management</span>
              </Link>
            )}

            <Link
              to="/profile"
              className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="h-5 w-5" />
              <span className="text-base">Profile</span>
            </Link>
            <div className="pt-3 border-t border-border">
              <div className="text-sm text-muted-foreground font-mono mb-3">
                {userData?.userCode || currentUser.email}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
