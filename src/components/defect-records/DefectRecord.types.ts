
export interface RecordHistoryEntry {
  id: string;
  recordId: string;
  field: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: string;
  changeType: 'create' | 'update' | 'delete';
}

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
  isPublic: boolean;  // New field for public/private visibility
  status?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  history?: RecordHistoryEntry[];
}

export type FilterType = 'all' | 'sl' | 'ok' | 'pln' | 'nxs';
export type ExportType = 'pdf' | 'excel';

// Field mapping for Excel export
export interface ExcelColumnMapping {
  header: string;
  field: keyof DefectRecord | ((record: DefectRecord) => string);
}
