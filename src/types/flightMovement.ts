/** OpCenter A80 Off Event (takeoff) or On Event (landing). */
export type FlightMovementType = "off" | "on";

export interface FlightMovement {
  id: string;
  type: FlightMovementType;
  tailNumber: string;
  flightId: string;
  departureStation: string;
  arrivalAirport: string;
  outTime?: string;
  offTime?: string;
  onTime?: string;
  eta?: string;
  fuelOnBoard?: string;
  smi?: string;
  pattern?: string;
  messageTime?: string;
  freetext?: string;
}

/**
 * One display line pairing dep OUT (Off event) with arr ON (On event):
 * `tail - flight - dep(out) - arr(on)`
 */
export interface FlightMovementLine {
  id: string;
  tailNumber: string;
  flightId: string;
  departureStation: string;
  outTime: string;
  arrivalAirport: string;
  onTime: string;
}

export const formatMovementLine = (line: FlightMovementLine): string =>
  `${line.tailNumber} - ${line.flightId} - ${line.departureStation}(${line.outTime}) - ${line.arrivalAirport}(${line.onTime})`;
