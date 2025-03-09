
export type DefectType = "PIREP" | "MAINT";

export interface ServiceOrderData {
  defectType: DefectType;
  aircraft: string;
  flight: string;
  from: string;
  to: string;
  date: Date;
  etaUtc: string;
  atDestAirport: boolean;
  defectDescription: string;
  mel: string;
  melDescription: string;
  preparedText: string;
}
