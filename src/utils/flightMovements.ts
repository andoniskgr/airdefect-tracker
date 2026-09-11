import type { FlightMovementLine } from "@/types/flightMovement";

const REFRESH_MS = 10_000;
const TARGET_TAIL = "SX-DVY";

/**
 * Load movement lines for the Movements page.
 * Until OpCenter HTML ingest runs on a backend with a logged-in session,
 * this returns the SX-DVY placeholder line (live fetch cannot run from the
 * browser alone: Auth0 + HTML + CORS).
 */
export async function fetchFlightMovementLines(): Promise<FlightMovementLine[]> {
  // Placeholder: replace with Cloud Function / server poll of OpCenter HTML.
  return [
    {
      id: "sx-dvy-current",
      tailNumber: TARGET_TAIL,
      flightId: "—",
      departureStation: "—",
      outTime: "—",
      arrivalAirport: "—",
      onTime: "—",
    },
  ];
}

export { REFRESH_MS, TARGET_TAIL };
