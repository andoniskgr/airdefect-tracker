import { useCallback, useEffect, useState } from "react";
import { Plane, RefreshCw } from "lucide-react";
import {
  formatMovementLine,
  type FlightMovementLine,
} from "@/types/flightMovement";
import {
  fetchFlightMovementLines,
  REFRESH_MS,
  TARGET_TAIL,
} from "@/utils/flightMovements";

const FlightMovements = () => {
  const [lines, setLines] = useState<FlightMovementLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const next = await fetchFlightMovementLines();
      setLines(next.filter((line) => line.tailNumber === TARGET_TAIL));
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh movements"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      void load();
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-700 text-white p-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Plane className="h-7 w-7 text-blue-300" />
            <div>
              <h1 className="text-2xl font-bold">Takeoffs / Landings</h1>
              <p className="text-sm text-slate-300">
                {TARGET_TAIL} — refreshes every {REFRESH_MS / 1000}s
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString()}`
                : "Loading…"}
            </span>
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
              Waiting for OpCenter data for {TARGET_TAIL}.
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
          Format: tail - flight - dep(out) - arr(on). Live OpCenter HTML still
          needs a logged-in server fetch; this page polls every{" "}
          {REFRESH_MS / 1000}s once that source is connected.
        </p>
      </div>
    </div>
  );
};

export default FlightMovements;
