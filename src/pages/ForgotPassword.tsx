import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [emailOrCode, setEmailOrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleInputChange = (value: string) => {
    if (!value.includes("@") && value.length <= 4) {
      setEmailOrCode(value.toUpperCase());
      return;
    }
    setEmailOrCode(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = emailOrCode.trim();
    if (!trimmed) {
      return toast.error("Enter your email address or 4-character user code.");
    }

    const isUserCode = /^[A-Z0-9]{4}$/i.test(trimmed) && !trimmed.includes("@");
    const isEmail = trimmed.includes("@");

    if (!isUserCode && !isEmail) {
      return toast.error("Enter your email address or 4-character user code.");
    }

    try {
      setLoading(true);
      await resetPassword(trimmed);
      setSent(true);
    } catch (error: any) {
      toast.error(error?.message || "Unable to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-card p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {sent
              ? "If an account exists, a reset link has been sent."
              : "We'll email you a link to choose a new password."}
          </p>
        </div>

        {sent ? (
          <div className="space-y-6">
            <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
              Check your inbox (and spam folder) for a password reset email.
              The link expires after a short time.
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setSent(false);
                setEmailOrCode("");
              }}
            >
              Try a different email or code
            </Button>
            <div className="text-center text-sm">
              <Link
                to="/login"
                className="font-medium text-primary-foreground hover:underline"
              >
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
                onChange={(e) => handleInputChange(e.target.value)}
                required
                className="mt-1"
                placeholder="Email address or ABCD"
                autoComplete="username"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Enter the email or 4-character user code for your account
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending reset link..." : "Send reset link"}
            </Button>

            <div className="mt-4 text-center text-sm">
              <Link
                to="/login"
                className="font-medium text-primary-foreground hover:underline"
              >
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
