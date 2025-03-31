
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
  nxs: boolean;
  rst: boolean;
  dly: boolean;  // New DLY field
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

// Field mapping for Excel export
export interface ExcelColumnMapping {
  header: string;
  field: keyof DefectRecord | ((record: DefectRecord) => string);
}
