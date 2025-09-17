import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  setupFirstAdmin,
  hasAdminUser,
  getAdminConfig,
} from "../utils/setupAdmin";

const AdminSetup = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [formData, setFormData] = useState({
    email: "admin@mcc-application.com",
    password: "Admin123!",
    userCode: "ADM1",
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setIsChecking(true);
      const adminExists = await hasAdminUser();
      setHasAdmin(adminExists);

      if (adminExists) {
        const config = await getAdminConfig();
        if (config) {
          setFormData({
            email: config.email,
            password: "••••••••", // Hide password
            userCode: config.userCode,
          });
        }
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast.error("Failed to check admin status");
    } finally {
      setIsChecking(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.userCode) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.userCode.length !== 4) {
      toast.error("User code must be exactly 4 characters");
      return;
    }

    if (!/^[A-Z0-9]{4}$/.test(formData.userCode)) {
      toast.error("User code must be 4 uppercase letters or numbers");
      return;
    }

    try {
      setIsSettingUp(true);
      await setupFirstAdmin(formData);
      setSetupComplete(true);
      toast.success("Admin user created successfully!");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Setup error:", error);
      toast.error(error.message || "Failed to create admin user");
    } finally {
      setIsSettingUp(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-700 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking admin status...</p>
        </div>
      </div>
    );
  }

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-slate-700 text-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Setup Complete!</CardTitle>
            <CardDescription>
              Admin user has been created successfully. You will be redirected
              to the login page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-slate-100 p-4 rounded-lg mb-4">
              <p className="text-sm text-slate-600">
                <strong>Email:</strong> {formData.email}
                <br />
                <strong>User Code:</strong> {formData.userCode}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Please change the default password after logging in.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-700 text-white p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {hasAdmin ? "Admin Already Exists" : "Setup Admin User"}
          </CardTitle>
          <CardDescription className="text-center">
            {hasAdmin
              ? "An admin user already exists in the system."
              : "Create the first admin user to manage the application."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasAdmin ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Admin user is already configured. You can proceed to the login
                  page.
                </AlertDescription>
              </Alert>

              <div className="bg-slate-100 p-4 rounded-lg">
                <p className="text-sm text-slate-600">
                  <strong>Email:</strong> {formData.email}
                  <br />
                  <strong>User Code:</strong> {formData.userCode}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => navigate("/login")} className="flex-1">
                  Go to Login
                </Button>
                <Button
                  onClick={checkAdminStatus}
                  variant="outline"
                  className="flex-1"
                >
                  Refresh
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSetup} className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will create the first admin user. Make sure to use a
                  secure password and remember these credentials.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use a strong password. You can change this after logging in.
                </p>
              </div>

              <div>
                <Label htmlFor="userCode">User Code (4 characters)</Label>
                <Input
                  id="userCode"
                  name="userCode"
                  type="text"
                  value={formData.userCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      userCode: e.target.value.toUpperCase(),
                    }))
                  }
                  required
                  className="mt-1"
                  maxLength={4}
                  style={{ textTransform: "uppercase" }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  4 uppercase letters or numbers (e.g., ADM1, 1234)
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isSettingUp}>
                {isSettingUp ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Admin...
                  </>
                ) : (
                  "Create Admin User"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
