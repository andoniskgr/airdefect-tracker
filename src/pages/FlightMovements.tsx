import { Plane, PlaneLanding, PlaneTakeoff } from "lucide-react";
import type { FlightMovement } from "@/types/flightMovement";

/**
 * Demo movements for SX-DVY until OpCenter HTML ingest is connected.
 * Shape matches A80 Off Event (OFFRP) / On Event (ONRP) message summaries.
 */
const movements: FlightMovement[] = [
  {
    id: "sx-dvy-off-demo",
    type: "off",
    tailNumber: "SX-DVY",
    flightId: "—",
    departureStation: "—",
    arrivalAirport: "—",
    outTime: "—",
    offTime: "—",
    eta: "—",
    fuelOnBoard: "—",
    smi: "A80",
    pattern: "OPC_A80_OFFRP_Collins",
    messageTime: "Awaiting OpCenter",
    freetext: undefined,
  },
  {
    id: "sx-dvy-on-demo",
    type: "on",
    tailNumber: "SX-DVY",
    flightId: "—",
    departureStation: "—",
    arrivalAirport: "—",
    onTime: "—",
    fuelOnBoard: "—",
    smi: "A80",
    pattern: "OPC_A80_ONRP_Collins",
    messageTime: "Awaiting OpCenter",
    freetext: undefined,
  },
];


const eventLabel = (type: FlightMovement["type"]) =>
  type === "off" ? "Off Event (takeoff)" : "On Event (landing)";

const eventTime = (m: FlightMovement) => {
  if (m.type === "off") {
    return `OUT ${m.outTime || "—"} / OFF ${m.offTime || "—"}`;
  }
  return `ON ${m.onTime || "—"}`;
};

const FlightMovements = () => {
  const sxDvy = movements.filter((m) => m.tailNumber === "SX-DVY");

  return (
    <div className="min-h-screen bg-slate-700 text-white p-4">
      <div className="container mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Plane className="h-7 w-7 text-blue-300" />
          <div>
            <h1 className="text-2xl font-bold">Takeoffs / Landings</h1>
            <p className="text-sm text-slate-300">
              SX-DVY — OpCenter A80 Off / On events (demo layout until live HTML
              ingest is connected).
            </p>
          </div>
        </div>

        {sxDvy.length === 0 ? (
          <div className="rounded-lg border border-slate-500/50 bg-slate-800/50 p-8 text-center">
            <p className="text-lg font-medium text-slate-100">
              No flight movements yet
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Waiting for OpCenter data for SX-DVY.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-500/50">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Tail</th>
                  <th className="px-4 py-3 font-medium">Flight</th>
                  <th className="px-4 py-3 font-medium">Dep</th>
                  <th className="px-4 py-3 font-medium">Arr</th>
                  <th className="px-4 py-3 font-medium">Times (z)</th>
                  <th className="px-4 py-3 font-medium">FOB</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                </tr>
              </thead>
              <tbody>
                {sxDvy.map((movement) => (
                  <tr
                    key={movement.id}
                    className="border-t border-slate-600/60 bg-slate-800/30"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        {movement.type === "off" ? (
                          <PlaneTakeoff className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <PlaneLanding className="h-4 w-4 text-sky-400" />
                        )}
                        {eventLabel(movement.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {movement.tailNumber}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {movement.flightId}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {movement.departureStation}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {movement.arrivalAirport}
                    </td>
                    <td className="px-4 py-3 font-mono">{eventTime(movement)}</td>
                    <td className="px-4 py-3 font-mono">
                      {movement.fuelOnBoard || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {movement.messageTime || "—"}
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
