
import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { RecordsTable } from "../components/defect-records/RecordsTable";
import { useDefectRecords } from "../hooks/useDefectRecords";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useDefectForm } from "../hooks/useDefectForm";
import { EditDefectModal } from "../components/defect-records/EditDefectModal";
import { DefectRecord } from "../components/defect-records/DefectRecord.types";

const ArchiveRecords = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [archivedDates, setArchivedDates] = useState<string[]>([]);
  
  const {
    loading,
    filter,
    setFilter,
    sortConfig,
    handleSort,
    handleDeleteRecord,
    handleDeleteAllByDate,
    handleArchiveDate,
    exportToExcel,
    getArchivedRecordsByDate,
    unarchiveDate
  } = useDefectRecords(currentUser?.email);

  const {
    isEditModalOpen,
    setIsEditModalOpen,
    editingRecord,
    setEditingRecord,
    handleEditRecord,
    handleEditSubmit
  } = useDefectForm(currentUser?.email);

  useEffect(() => {
    // Load archived dates from localStorage on component mount
    const storedArchivedDates = localStorage.getItem('archivedDates');
    if (storedArchivedDates) {
      const dates = JSON.parse(storedArchivedDates);
      setArchivedDates(dates);
      
      // Set first date as default selected if available
      if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    }
  }, []);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleUnarchive = () => {
    if (selectedDate) {
      const success = unarchiveDate(selectedDate);
      if (success) {
        // Remove date from archivedDates locally
        const updatedDates = archivedDates.filter(date => date !== selectedDate);
        setArchivedDates(updatedDates);
        
        // If there are other dates, select the first one
        if (updatedDates.length > 0) {
          setSelectedDate(updatedDates[0]);
        } else {
          setSelectedDate(null);
        }
        
        toast.success(`Date ${format(new Date(selectedDate), 'dd/MM/yyyy')} unarchived successfully!`);
      }
    }
  };

  const recordsToShow = selectedDate ? getArchivedRecordsByDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-slate-700 text-white p-4">
      <div className="w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6">Archived Records</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium mb-2">Select Archived Date</label>
            {archivedDates.length > 0 ? (
              <Select onValueChange={handleDateChange} value={selectedDate || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a date" />
                </SelectTrigger>
                <SelectContent>
                  {archivedDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {format(new Date(date), 'dd/MM/yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p>No archived dates found</p>
            )}
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleUnarchive} 
              variant="secondary"
              disabled={!selectedDate}
            >
              Unarchive Selected Date
            </Button>
          </div>
        </div>

        {selectedDate && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Records from {format(new Date(selectedDate), 'dd/MM/yyyy')}
            </h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <RecordsTable
                  records={recordsToShow}
                  handleSort={handleSort}
                  handleEditRecord={handleEditRecord}
                  handleDeleteRecord={handleDeleteRecord}
                  handleDeleteAllByDate={handleDeleteAllByDate}
                  handleArchiveDate={handleArchiveDate}
                  sortConfig={sortConfig}
                />
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Add the edit modal */}
      {editingRecord && (
        <EditDefectModal
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          editingRecord={editingRecord}
          setEditingRecord={setEditingRecord}
          handleEditSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
};

export default ArchiveRecords;
