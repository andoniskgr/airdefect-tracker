
export interface DefectRecord {
  id: string;
  date: string;
  time: string;
  registration: string;
  station: string;
  defect: string;
  remarks: string;
  eta: string;
  std: string;
  upd: string;
  rst: boolean;
  sl: boolean;
  ok: boolean;
  pln: boolean;
  status?: string; // Add status property
}

export type FilterType = 'all' | 'sl' | 'ok';
export type ExportType = 'pdf' | 'excel';
