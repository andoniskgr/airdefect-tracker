
import { useState, useEffect } from "react";
import { useFilterAndSort } from "./defect-records/useFilterAndSort";
import { useRecordOperations } from "./defect-records/useRecordOperations";
import { useFetchRecords } from "./defect-records/useFetchRecords";
import { FilterType } from "../components/defect-records/DefectRecord.types";

export const useDefectRecords = (userEmail: string | null | undefined) => {
  const { defectRecords, loading } = useFetchRecords(userEmail);
  const [archivedDates, setArchivedDates] = useState<string[]>([]);
  
  // Load archived dates from localStorage on component mount
  useEffect(() => {
    const storedArchivedDates = localStorage.getItem('archivedDates');
    if (storedArchivedDates) {
      setArchivedDates(JSON.parse(storedArchivedDates));
    }
  }, []);
  
  const { 
    filter, 
    setFilter, 
    sortConfig, 
    handleSort, 
    getFilteredRecords 
  } = useFilterAndSort();
  
  const { 
    handleDeleteRecord, 
    handleDeleteAllByDate, 
    archiveDate,
    unarchiveDate,
    exportToExcel 
  } = useRecordOperations(userEmail, setArchivedDates);

  // Filter out records from archived dates
  const getFilteredAndNonArchivedRecords = () => {
    // First apply regular filters
    const filteredRecords = getFilteredRecords(defectRecords);
    
    // Then exclude any records from archived dates
    if (archivedDates.length > 0) {
      return filteredRecords.filter(record => {
        const recordDate = record.date.split('T')[0]; // Get YYYY-MM-DD part
        return !archivedDates.includes(recordDate);
      });
    }
    
    return filteredRecords;
  };
  
  // Get records for a specific archived date
  const getArchivedRecordsByDate = (date: string) => {
    return defectRecords.filter(record => {
      const recordDate = record.date.split('T')[0]; // Get YYYY-MM-DD part
      return recordDate === date;
    });
  };

  // Handle archiving a date
  const handleArchiveDate = (date: string) => {
    const success = archiveDate(date);
    if (success) {
      setArchivedDates(prev => [...prev, date]);
    }
  };

  // Provide a wrapper function to avoid passing defectRecords to other components
  const exportToExcelWrapper = () => {
    exportToExcel(() => getFilteredAndNonArchivedRecords());
  };

  return {
    defectRecords,
    loading,
    filter,
    setFilter,
    sortConfig,
    handleSort,
    handleDeleteRecord,
    handleDeleteAllByDate,
    handleArchiveDate,
    unarchiveDate,
    exportToExcel: exportToExcelWrapper,
    getFilteredRecords: getFilteredAndNonArchivedRecords,
    getArchivedRecordsByDate
  };
};
