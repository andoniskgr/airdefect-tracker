import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";

const UserProfile = () => {
  const { currentUser, updateUserCode, getUserData, changePassword } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [newUserCode, setNewUserCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setDataLoading(true);
        const data = await getUserData();
        setUserData(data);
        // If no user data exists, initialize with empty string
        setNewUserCode(data?.userCode || "");
      } catch (error) {
        // If user data doesn't exist, that's okay - they can create their first code
        setUserData(null);
        setNewUserCode("");
      } finally {
        setDataLoading(false);
      }
    };

    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser, getUserData]);

  const handleUpdateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserCode || newUserCode.length !== 4) {
      return toast.error("User code must be exactly 4 characters");
    }
    
    if (!/^[A-Z0-9]{4}$/.test(newUserCode)) {
      return toast.error("User code must be 4 uppercase letters or numbers");
    }
    
    if (userData?.userCode && newUserCode === userData.userCode) {
      return toast.error("New code must be different from current code");
    }
    
    try {
      setLoading(true);
      await updateUserCode(newUserCode);
      setUserData({ ...userData, userCode: newUserCode });
      toast.success(userData?.userCode ? "User code updated successfully!" : "User code created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update user code");
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handlePasswordDialogChange = (open: boolean) => {
    setPasswordDialogOpen(open);
    if (!open) {
      resetPasswordForm();
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      return toast.error("Enter your current password");
    }

    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }

    if (newPassword === currentPassword) {
      return toast.error("New password must be different from current password");
    }

    try {
      setPasswordLoading(true);
      await changePassword(currentPassword, newPassword);
      toast.success("Password updated successfully");
      handlePasswordDialogChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            Manage your account settings, password, and user code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Information */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Email Address</Label>
            <Input
              value={currentUser?.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email address cannot be changed
            </p>
          </div>

          {/* Change Password */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Password</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setPasswordDialogOpen(true)}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            <p className="text-xs text-muted-foreground">
              Update the password you use to sign in
            </p>
          </div>

          {/* Current User Code */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current User Code</Label>
            <Input
              value={userData?.userCode || "No code set"}
              disabled
              className="bg-muted font-mono"
            />
            <p className="text-xs text-muted-foreground">
              {userData?.userCode ? "Your current 4-character login code" : "You don't have a user code yet. Create one below."}
            </p>
          </div>

          {/* Update User Code Form */}
          <form onSubmit={handleUpdateCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-user-code" className="text-sm font-medium">
                {userData?.userCode ? "New User Code" : "Create User Code"}
              </Label>
              <Input
                id="new-user-code"
                type="text"
                value={newUserCode}
                onChange={(e) => setNewUserCode(e.target.value.toUpperCase())}
                placeholder="ABCD"
                maxLength={4}
                className="font-mono"
                style={{ textTransform: 'uppercase' }}
              />
              <p className="text-xs text-muted-foreground">
                4 uppercase letters or numbers (e.g., ABCD, 1234)
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || (userData?.userCode && newUserCode === userData.userCode) || !newUserCode}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {userData?.userCode ? "Updating..." : "Creating..."}
                </>
              ) : (
                userData?.userCode ? "Update User Code" : "Create User Code"
              )}
            </Button>
          </form>

          {/* Account Information */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Account Information</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Account created: {userData?.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}</p>
              {userData?.updatedAt && (
                <p>Last updated: {new Date(userData.updatedAt.seconds * 1000).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={passwordDialogOpen} onOpenChange={handlePasswordDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm new password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handlePasswordDialogChange(false)}
                disabled={passwordLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;
