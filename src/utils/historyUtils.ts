import { DefectRecord, RecordHistoryEntry } from "@/components/defect-records/DefectRecord.types";

export const createHistoryEntry = (
  recordId: string,
  field: string,
  oldValue: any,
  newValue: any,
  changedBy: string,
  changeType: 'create' | 'update' | 'delete'
): RecordHistoryEntry => {
  return {
    id: `${recordId}_${field}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    recordId,
    field,
    oldValue,
    newValue,
    changedBy,
    changedAt: new Date().toISOString(),
    changeType
  };
};

export const trackFieldChanges = (
  oldRecord: DefectRecord,
  newRecord: DefectRecord,
  changedBy: string
): RecordHistoryEntry[] => {
  const changes: RecordHistoryEntry[] = [];
  const fieldsToTrack: (keyof DefectRecord)[] = [
    'date', 'time', 'registration', 'station', 'defect', 'remarks',
    'eta', 'std', 'upd', 'nxs', 'rst', 'dly', 'sl', 'ok', 'pln', 'isPublic', 'status'
  ];

  fieldsToTrack.forEach(field => {
    const oldValue = oldRecord[field];
    const newValue = newRecord[field];
    
    if (oldValue !== newValue) {
      changes.push(createHistoryEntry(
        newRecord.id,
        field,
        oldValue,
        newValue,
        changedBy,
        'update'
      ));
    }
  });

  return changes;
};

export const createInitialHistory = (
  record: DefectRecord,
  createdBy: string
): RecordHistoryEntry[] => {
  const fieldsToTrack: (keyof DefectRecord)[] = [
    'date', 'time', 'registration', 'station', 'defect', 'remarks',
    'eta', 'std', 'upd', 'nxs', 'rst', 'dly', 'sl', 'ok', 'pln', 'isPublic', 'status'
  ];

  return fieldsToTrack
    .filter(field => record[field] !== undefined && record[field] !== null && record[field] !== '')
    .map(field => createHistoryEntry(
      record.id,
      field,
      null,
      record[field],
      createdBy,
      'create'
    ));
};
