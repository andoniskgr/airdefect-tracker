import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getVersionString } from "@/utils/version";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userCode, setUserCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (!userCode || userCode.length !== 4) {
      return toast.error("User code must be exactly 4 characters");
    }

    if (!/^[A-Z0-9]{4}$/.test(userCode)) {
      return toast.error("User code must be 4 uppercase letters or numbers");
    }

    try {
      setLoading(true);
      await signup(email, password, userCode);
      toast.success(
        "Account created successfully! Your account is pending approval. You will receive an email once approved."
      );
      navigate("/pending-approval");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account.");
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
          <h1 className="text-2xl font-bold tracking-tight">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="user-code" className="block text-sm font-medium">
                User Code (4 characters)
              </label>
              <Input
                id="user-code"
                type="text"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value.toUpperCase())}
                required
                className="mt-1"
                placeholder="ABCD"
                maxLength={4}
                style={{ textTransform: "uppercase" }}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                4 uppercase letters or numbers (e.g., ABCD, 1234)
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
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium"
              >
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </Button>

          <div className="mt-4 text-center text-sm">
            <p>
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary-foreground hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
