import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const UserProfile = () => {
  const { currentUser, updateUserCode, getUserData } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [newUserCode, setNewUserCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setDataLoading(true);
        const data = await getUserData();
        setUserData(data);
        // If no user data exists, initialize with empty string
        setNewUserCode(data?.userCode || "");
      } catch (error) {
        console.error("Error fetching user data:", error);
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
      console.error("Error updating user code:", error);
      toast.error(error.message || "Failed to update user code");
    } finally {
      setLoading(false);
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
            Manage your account settings and user code
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
    </div>
  );
};

export default UserProfile;
