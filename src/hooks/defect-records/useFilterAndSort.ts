
import { useState } from "react";
import { DefectRecord, FilterType } from "../../components/defect-records/DefectRecord.types";

export const useFilterAndSort = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({
    key: 'time',
    direction: 'desc'
  });

  const handleSort = (column: string) => {
    setSortConfig(prevConfig => ({
      key: column,
      direction: prevConfig.key === column && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
    console.log(`Sorting by ${column} in ${sortConfig.direction === 'asc' ? 'desc' : 'asc'} order`);
  };

  const getFilteredRecords = (defectRecords: DefectRecord[]) => {
    let records = [...defectRecords];
    
    // Apply filters based on the selected filter type
    if (filter === 'sl') {
      // For "PENDING" filter: show records with SL = true OR both SL and OK are false
      records = records.filter(record => 
        (record.sl === true && record.ok === false) || 
        (record.sl === false && record.ok === false)
      );
    } else if (filter === 'ok') {
      records = records.filter(record => record.ok === true);
    } else if (filter === 'pln') {
      records = records.filter(record => record.pln === true);
    } else if (filter === 'nxs') {
      // For "NXS" filter: show records with NXS = true AND OK = false
      records = records.filter(record => record.nxs === true && record.ok === false);
    }
    
    // Sort the records based on the current sort configuration
    if (sortConfig.key) {
      records.sort((a, b) => {
        // Handle specific fields or default to string comparison
        let aValue = a[sortConfig.key as keyof DefectRecord];
        let bValue = b[sortConfig.key as keyof DefectRecord];
        
        // Handle boolean values
        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          return sortConfig.direction === 'asc' 
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        }
        
        // Handle string or other values
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';
        
        // Convert to strings for comparison
        const aString = String(aValue);
        const bString = String(bValue);
        
        return sortConfig.direction === 'asc'
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      });
    }
    
    return records;
  };

  return {
    filter,
    setFilter,
    sortConfig,
    handleSort,
    getFilteredRecords
  };
};
