import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { auth } from "../utils/firebaseDB";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode") || "";
  const continueUrl = searchParams.get("continueUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifying, setVerifying] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setInvalid(true);
        setVerifying(false);
        return;
      }

      try {
        const accountEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(accountEmail);
      } catch {
        setInvalid(true);
      } finally {
        setVerifying(false);
      }
    };

    verifyCode();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    try {
      setLoading(true);
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Password updated. You can now log in.");

      if (continueUrl) {
        try {
          const nextUrl = new URL(continueUrl, window.location.origin);
          if (nextUrl.origin === window.location.origin) {
            navigate(`${nextUrl.pathname}${nextUrl.search}`);
            return;
          }
        } catch {
          // Fall through to the login page
        }
      }

      navigate("/login?reset=success");
    } catch (error: any) {
      if (
        error.code === "auth/expired-action-code" ||
        error.code === "auth/invalid-action-code"
      ) {
        toast.error("This reset link is invalid or has expired.");
        setInvalid(true);
      } else if (error.code === "auth/weak-password") {
        toast.error("Please choose a stronger password.");
      } else {
        toast.error("Unable to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-card p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Set a new password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {verifying
              ? "Checking your reset link..."
              : invalid
                ? "This reset link is invalid or has expired."
                : email
                  ? `Choose a new password for ${email}`
                  : "Choose a new password for your account."}
          </p>
        </div>

        {verifying ? (
          <div className="flex justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : invalid ? (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Request a new reset link and try again.
            </p>
            <Button asChild className="w-full">
              <Link to="/forgot-password">Request a new reset link</Link>
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
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  New password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1"
                  placeholder="New password"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium"
                >
                  Confirm new password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1"
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating password..." : "Update password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
