import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useFilterAndSort } from "./defect-records/useFilterAndSort";
import { useRecordOperations } from "./defect-records/useRecordOperations";
import { useFetchRecords } from "./defect-records/useFetchRecords";
import { FilterType } from "../components/defect-records/DefectRecord.types";

const getArchivePromptKey = (userEmail: string) =>
  `archivePastDatesPrompted_${userEmail}`;

const hasArchivePromptBeenAnswered = (userEmail: string) =>
  localStorage.getItem(getArchivePromptKey(userEmail)) === "true";

const markArchivePromptAnswered = (userEmail: string) => {
  localStorage.setItem(getArchivePromptKey(userEmail), "true");
};

export const useDefectRecords = (
  userEmail: string | null | undefined,
  options?: { promptArchivePastDates?: boolean }
) => {
  const promptArchivePastDates = options?.promptArchivePastDates ?? false;
  const { defectRecords, loading } = useFetchRecords(userEmail);
  const [archivedDates, setArchivedDates] = useState<string[]>([]);
  const [archivePastDatesDialogOpen, setArchivePastDatesDialogOpen] = useState(false);
  const [pastDatesToArchive, setPastDatesToArchive] = useState<string[]>([]);
  
  // useRecordOperations now handles loading archived dates from Firebase
  const { 
    handleDeleteRecord, 
    handleUpdateRecord,
    handleToggleVisibility,
    handleDeleteAllByDate,
    handleDeleteMultipleDates,
    handleDeleteAllRecords, 
    archiveDate,
    archiveDatesSilent,
    unarchiveDate,
    unarchiveMultipleDates,
    unarchiveDateSilent,
    archivedDatesLoaded,
    exportToExcel 
  } = useRecordOperations(userEmail, setArchivedDates);

  useEffect(() => {
    if (
      !promptArchivePastDates ||
      !userEmail ||
      loading ||
      !archivedDatesLoaded ||
      hasArchivePromptBeenAnswered(userEmail)
    ) {
      return;
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const pastDates = [
      ...new Set(
        defectRecords
          .map((record) => record.date.split("T")[0])
          .filter((date) => date !== today && !archivedDates.includes(date))
      ),
    ].sort((a, b) => b.localeCompare(a));

    if (pastDates.length > 0) {
      setPastDatesToArchive(pastDates);
      setArchivePastDatesDialogOpen(true);
    }
  }, [
    promptArchivePastDates,
    userEmail,
    loading,
    archivedDatesLoaded,
    defectRecords,
    archivedDates,
  ]);

  const confirmArchivePastDates = useCallback(async () => {
    if (pastDatesToArchive.length === 0) {
      setArchivePastDatesDialogOpen(false);
      return;
    }

    const today = format(new Date(), "yyyy-MM-dd");
    let updatedArchived = [...archivedDates];

    if (updatedArchived.includes(today)) {
      const success = await unarchiveDateSilent(today);
      if (success) {
        updatedArchived = updatedArchived.filter((d) => d !== today);
        setArchivedDates(updatedArchived);
      }
    }

    const success = await archiveDatesSilent(pastDatesToArchive);
    if (success) {
      setArchivedDates((prev) => [...new Set([...prev, ...pastDatesToArchive])]);
      toast.success(
        `${pastDatesToArchive.length} past date${pastDatesToArchive.length === 1 ? "" : "s"} archived successfully`
      );
    } else {
      toast.error("Failed to archive past dates");
    }

    setArchivePastDatesDialogOpen(false);
    setPastDatesToArchive([]);
    if (userEmail) {
      markArchivePromptAnswered(userEmail);
    }
  }, [
    archivedDates,
    archiveDatesSilent,
    pastDatesToArchive,
    unarchiveDateSilent,
    userEmail,
  ]);

  const dismissArchivePastDates = useCallback(() => {
    setArchivePastDatesDialogOpen(false);
    setPastDatesToArchive([]);
    if (userEmail) {
      markArchivePromptAnswered(userEmail);
    }
  }, [userEmail]);
  
  const { 
    filter, 
    setFilter, 
    visibilityFilter,
    setVisibilityFilter,
    searchQuery,
    setSearchQuery,
    sortConfig, 
    handleSort, 
    getFilteredRecords 
  } = useFilterAndSort();

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
  const handleArchiveDate = async (date: string) => {
    const success = await archiveDate(date);
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
    visibilityFilter,
    setVisibilityFilter,
    searchQuery,
    setSearchQuery,
    sortConfig,
    handleSort,
    handleDeleteRecord,
    handleUpdateRecord,
    handleToggleVisibility,
    handleDeleteAllByDate,
    handleDeleteMultipleDates,
    handleDeleteAllRecords,
    handleArchiveDate,
    unarchiveDate,
    unarchiveMultipleDates,
    exportToExcel: exportToExcelWrapper,
    getFilteredRecords: getFilteredAndNonArchivedRecords,
    getArchivedRecordsByDate,
    archivePastDatesDialogOpen,
    pastDatesToArchive,
    confirmArchivePastDates,
    dismissArchivePastDates,
  };
};
