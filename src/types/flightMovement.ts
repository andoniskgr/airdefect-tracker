/** OpCenter A80 Off Event (takeoff) or On Event (landing). */
export type FlightMovementType = "off" | "on";

export interface FlightMovement {
  id: string;
  /** off = takeoff (OFFRP), on = landing (ONRP) */
  type: FlightMovementType;
  tailNumber: string;
  flightId: string;
  departureStation: string;
  arrivalAirport: string;
  /** Zulu HH:mm — pushback (Off events) */
  outTime?: string;
  /** Zulu HH:mm — airborne (Off events) */
  offTime?: string;
  /** Zulu HH:mm — on blocks (On events) */
  onTime?: string;
  /** Zulu HH:mm — ETA from OFFRP freetext when present */
  eta?: string;
  fuelOnBoard?: string;
  smi?: string;
  pattern?: string;
  messageTime?: string; // e.g. 09/10 2217z
  freetext?: string;
}
