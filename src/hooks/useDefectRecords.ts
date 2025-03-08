
import { useFilterAndSort } from "./defect-records/useFilterAndSort";
import { useRecordOperations } from "./defect-records/useRecordOperations";
import { useFetchRecords } from "./defect-records/useFetchRecords";
import { FilterType } from "../components/defect-records/DefectRecord.types";

export const useDefectRecords = (userEmail: string | null | undefined) => {
  const { defectRecords, loading } = useFetchRecords(userEmail);
  
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
    exportToExcel 
  } = useRecordOperations(userEmail);

  // Provide a wrapper function to avoid passing defectRecords to other components
  const exportToExcelWrapper = () => {
    exportToExcel(() => getFilteredRecords(defectRecords));
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
    exportToExcel: exportToExcelWrapper,
    getFilteredRecords: () => getFilteredRecords(defectRecords)
  };
};
