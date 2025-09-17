import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getVersionString } from "@/utils/version";

const Login = () => {
  const [emailOrCode, setEmailOrCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await login(emailOrCode, password);
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      // Display the specific error message from the AuthContext
      const errorMessage = error?.message || "Failed to login. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative">
      {/* Version number */}
      <div className="absolute top-4 right-4">
        <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
          {getVersionString()}
        </span>
      </div>
      <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-card p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email-or-code"
                className="block text-sm font-medium"
              >
                Email address or User Code
              </label>
              <Input
                id="email-or-code"
                type="text"
                value={emailOrCode}
                onChange={(e) => setEmailOrCode(e.target.value.toUpperCase())}
                required
                className="mt-1"
                placeholder="Email address or ABCD"
                style={{ textTransform: "uppercase" }}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Enter your email address or 4-character user code
              </p>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Password"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="mt-4 text-center text-sm">
            <p>
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-primary-foreground hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
