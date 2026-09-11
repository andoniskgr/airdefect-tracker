import { FormEvent, useCallback, useEffect, useState } from "react";
import { Plane, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatMovementLine,
  type FlightMovementLine,
} from "@/types/flightMovement";
import {
  fetchFlightMovementLines,
  loginOpCenter,
  logoutOpCenter,
  REFRESH_MS,
  TARGET_TAIL,
} from "@/utils/flightMovements";

const FlightMovements = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [lines, setLines] = useState<FlightMovementLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const next = await fetchFlightMovementLines(TARGET_TAIL);
      setLines(next.filter((line) => line.tailNumber === TARGET_TAIL));
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to refresh movements";
      setError(message);
      if (/sign in again|session missing|expired|unauthenticated/i.test(message)) {
        setAuthenticated(false);
        setPassword("");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    void load();
    const id = window.setInterval(() => {
      void load();
    }, REFRESH_MS);

    return () => {
      window.clearInterval(id);
    };
  }, [authenticated, load]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      await loginOpCenter(username.trim(), password);
      setPassword("");
      setAuthenticated(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "OpCenter login failed";
      setLoginError(message);
      setAuthenticated(false);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutOpCenter();
    } catch {
      // ignore
    }
    setAuthenticated(false);
    setLines([]);
    setLastUpdated(null);
    setError(null);
    setPassword("");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-700 text-white p-4">
        <div className="container mx-auto max-w-md">
          <div className="mb-6 flex items-center gap-3">
            <Plane className="h-7 w-7 text-blue-300" />
            <div>
              <h1 className="text-2xl font-bold">OpCenter login</h1>
              <p className="text-sm text-slate-300">
                Enter OpCenter credentials to poll {TARGET_TAIL} movements.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-4 rounded-lg border border-slate-500/50 bg-slate-800/50 p-6"
          >
            <div className="space-y-2">
              <Label htmlFor="opcenter-username">Username / email</Label>
              <Input
                id="opcenter-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-slate-900 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opcenter-password">Password</Label>
              <Input
                id="opcenter-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-900 border-slate-600 text-white"
              />
            </div>

            {loginError && (
              <p className="text-sm text-red-300" role="alert">
                {loginError}
              </p>
            )}

            <Button type="submit" disabled={loginLoading} className="w-full">
              {loginLoading ? "Signing in…" : "Sign in & start polling"}
            </Button>

            <p className="text-xs text-slate-400">
              Credentials are sent to a secure Cloud Function over HTTPS. The
              password is not stored; only a short-lived OpCenter session cookie
              is kept for background refresh every {REFRESH_MS / 1000}s.
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-700 text-white p-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Plane className="h-7 w-7 text-blue-300" />
            <div>
              <h1 className="text-2xl font-bold">Takeoffs / Landings</h1>
              <p className="text-sm text-slate-300">
                {TARGET_TAIL} — background poll every {REFRESH_MS / 1000}s
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString()}`
                : "Loading…"}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-slate-200"
            >
              OpCenter logout
            </Button>
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-300" role="alert">
            {error}
          </p>
        )}

        {lines.length === 0 && !loading ? (
          <div className="rounded-lg border border-slate-500/50 bg-slate-800/50 p-8 text-center">
            <p className="text-lg font-medium text-slate-100">
              No flight movements yet
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Polling OpCenter for {TARGET_TAIL} A80 Off/On events…
            </p>
          </div>
        ) : (
          <ul className="space-y-2 font-mono text-base tracking-wide">
            {lines.map((line) => (
              <li
                key={line.id}
                className="rounded border border-slate-500/40 bg-slate-800/40 px-4 py-3"
              >
                {formatMovementLine(line)}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-xs text-slate-400">
          Format: tail - flight - dep(out) - arr(on)
        </p>
      </div>
    </div>
  );
};

export default FlightMovements;
