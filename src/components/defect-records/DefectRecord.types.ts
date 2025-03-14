
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
  status?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export type FilterType = 'all' | 'sl' | 'ok' | 'pln';
export type ExportType = 'pdf' | 'excel';
