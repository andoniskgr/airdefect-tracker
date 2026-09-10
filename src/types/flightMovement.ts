export type FlightMovementType = "takeoff" | "landing";

export interface FlightMovement {
  id: string;
  type: FlightMovementType;
  aircraftRegistration?: string;
  flightNumber?: string;
  airport?: string;
  runway?: string;
  occurredAt: string; // ISO timestamp
}
