import { Plane, PlaneLanding, PlaneTakeoff } from "lucide-react";
import type { FlightMovement } from "@/types/flightMovement";

/** Placeholder until an external takeoff/landing source is connected. */
const movements: FlightMovement[] = [];

const formatOccurredAt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const FlightMovements = () => {
  return (
    <div className="min-h-screen bg-slate-700 text-white p-4">
      <div className="container mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Plane className="h-7 w-7 text-blue-300" />
          <div>
            <h1 className="text-2xl font-bold">Takeoffs / Landings</h1>
            <p className="text-sm text-slate-300">
              Flight movements will appear here once a data source is connected.
            </p>
          </div>
        </div>

        {movements.length === 0 ? (
          <div className="rounded-lg border border-slate-500/50 bg-slate-800/50 p-8 text-center">
            <p className="text-lg font-medium text-slate-100">
              No flight movements yet
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Waiting for data source. Connect the external takeoff/landing feed
              to populate this list.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-500/50">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Aircraft</th>
                  <th className="px-4 py-3 font-medium">Flight</th>
                  <th className="px-4 py-3 font-medium">Airport</th>
                  <th className="px-4 py-3 font-medium">Runway</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr
                    key={movement.id}
                    className="border-t border-slate-600/60 bg-slate-800/30"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 capitalize">
                        {movement.type === "takeoff" ? (
                          <PlaneTakeoff className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <PlaneLanding className="h-4 w-4 text-sky-400" />
                        )}
                        {movement.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {movement.aircraftRegistration || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {movement.flightNumber || "—"}
                    </td>
                    <td className="px-4 py-3">{movement.airport || "—"}</td>
                    <td className="px-4 py-3">{movement.runway || "—"}</td>
                    <td className="px-4 py-3">
                      {formatOccurredAt(movement.occurredAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightMovements;
