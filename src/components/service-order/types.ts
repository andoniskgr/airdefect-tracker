
export interface ServiceOrderData {
  defectType: string;
  maintenanceAction: boolean;
  aircraft: string;
  flight: string;
  from: string;
  to: string;
  date: Date;
  etaUtc: string;
  atDestAirport: boolean;
  defectDescription: string;
  preparedText: string;
}
