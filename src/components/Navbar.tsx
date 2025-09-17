import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Archive, User, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { getVersionString } from "@/utils/version";

const Navbar = () => {
  const { currentUser, logout, getUserData } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userCode, setUserCode] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
          <Link
            to="/"
            className={cn("font-bold", isMobile ? "text-lg" : "text-xl")}
          >
            {isMobile ? "MCC App" : "Defect Records Application"}
          </Link>

          {/* Desktop Navigation */}
          {currentUser && !isMobile && (
            <>
              <Link
                to="/archive-records"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Archive className="h-4 w-4" />
                <span>Archives</span>
              </Link>
            </>
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
            <Link
              to="/archive-records"
              className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Archive className="h-5 w-5" />
              <span className="text-base">Archives</span>
            </Link>
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
                {userCode || currentUser.email}
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
