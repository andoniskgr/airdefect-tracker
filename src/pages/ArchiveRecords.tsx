import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { RecordsTable } from "../components/defect-records/RecordsTable";
import { useDefectRecords } from "../hooks/useDefectRecords";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useDefectForm } from "../hooks/useDefectForm";
import { EditDefectModal } from "../components/defect-records/EditDefectModal";
import { DefectRecord } from "../components/defect-records/DefectRecord.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ArchiveRecords = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [archivedDates, setArchivedDates] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkActionsExpanded, setIsBulkActionsExpanded] = useState(false);

  const {
    loading,
    filter,
    setFilter,
    sortConfig,
    handleSort,
    handleDeleteRecord,
    handleUpdateRecord,
    handleToggleVisibility,
    handleDeleteAllByDate,
    handleDeleteMultipleDates,
    handleDeleteAllRecords,
    handleArchiveDate,
    exportToExcel,
    getArchivedRecordsByDate,
    unarchiveDate,
  } = useDefectRecords(currentUser?.email);

  const {
    isEditModalOpen,
    setIsEditModalOpen,
    editingRecord,
    setEditingRecord,
    handleEditRecord,
    handleEditSubmit,
  } = useDefectForm(currentUser?.email);

  useEffect(() => {
    const storedArchivedDates = localStorage.getItem("archivedDates");
    if (storedArchivedDates) {
      const dates = JSON.parse(storedArchivedDates);
      setArchivedDates(dates);
      // Don't automatically select the first date - let user choose
    }
  }, []);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleUnarchive = async () => {
    if (selectedDate) {
      try {
        const success = await unarchiveDate(selectedDate);
        if (success) {
          const updatedDates = archivedDates.filter(
            (date) => date !== selectedDate
          );
          setArchivedDates(updatedDates);

          // Clear selected date after unarchiving
          setSelectedDate(null);
        }
      } catch (error) {
        toast.error("Failed to unarchive date");
      }
    }
  };

  const handleDateSelection = (date: string, checked: boolean) => {
    if (checked) {
      setSelectedDates((prev) => [...prev, date]);
    } else {
      setSelectedDates((prev) => prev.filter((d) => d !== date));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedDates([...archivedDates]);
    } else {
      setSelectedDates([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedDates.length === 0) {
      toast.error("Please select at least one date to delete");
      return;
    }

    try {
      await handleDeleteMultipleDates(selectedDates);

      // Reload archived dates from Firebase to get the updated list
      if (currentUser?.email) {
        try {
          const { getUserArchivedDates } = await import("../utils/firebaseDB");
          const updatedDates = await getUserArchivedDates(currentUser.email);
          setArchivedDates(updatedDates);

          // Update localStorage
          localStorage.setItem("archivedDates", JSON.stringify(updatedDates));

          // Clear selected date if it was deleted
          if (selectedDate && selectedDates.includes(selectedDate)) {
            setSelectedDate(null);
          }
        } catch (error) {
          // Fallback to local state update
          const updatedDates = archivedDates.filter(
            (date) => !selectedDates.includes(date)
          );
          setArchivedDates(updatedDates);
          localStorage.setItem("archivedDates", JSON.stringify(updatedDates));
        }
      }

      setSelectedDates([]);
      setSelectAll(false);
    } catch (error) {
    }
  };

  const handleDeleteAll = async () => {
    try {
      await handleDeleteAllRecords();

      // Reload archived dates from Firebase to get the updated list
      if (currentUser?.email) {
        try {
          const { getUserArchivedDates } = await import("../utils/firebaseDB");
          const updatedDates = await getUserArchivedDates(currentUser.email);
          setArchivedDates(updatedDates);
          localStorage.setItem("archivedDates", JSON.stringify(updatedDates));
        } catch (error) {
          // Fallback to clearing local state
          setArchivedDates([]);
          localStorage.setItem("archivedDates", JSON.stringify([]));
        }
      } else {
        // Clear all local state
        setArchivedDates([]);
        localStorage.setItem("archivedDates", JSON.stringify([]));
      }

      setSelectedDates([]);
      setSelectAll(false);
      setSelectedDate(null);
    } catch (error) {
    }
  };

  const recordsToShow = selectedDate
    ? getArchivedRecordsByDate(selectedDate)
    : [];

  return (
    <div className="min-h-screen bg-slate-700 text-white p-4">
      <div className="w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6">Archived Records</h1>

        <div className="flex flex-col gap-4 mb-6">
          {/* Bulk Actions Section */}
          {archivedDates.length > 0 && (
            <div className="bg-slate-600 p-4 rounded-lg">
              <button
                onClick={() => setIsBulkActionsExpanded(!isBulkActionsExpanded)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-semibold">Bulk Actions</h3>
                {isBulkActionsExpanded ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>

              {isBulkActionsExpanded && (
                <div className="mt-4">
                  {/* Select All Checkbox */}
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="select-all"
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium">
                      Select All Dates ({archivedDates.length} dates)
                    </label>
                  </div>

                  {/* Individual Date Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                    {archivedDates.map((date) => (
                      <div key={date} className="flex items-center space-x-2">
                        <Checkbox
                          id={`date-${date}`}
                          checked={selectedDates.includes(date)}
                          onCheckedChange={(checked) =>
                            handleDateSelection(date, checked as boolean)
                          }
                        />
                        <label htmlFor={`date-${date}`} className="text-sm">
                          {format(new Date(date), "dd/MM/yyyy")}
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Bulk Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={selectedDates.length === 0}
                        >
                          Delete Selected ({selectedDates.length})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Selected Dates
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete all records from{" "}
                            {selectedDates.length} selected date(s)? This action
                            cannot be undone.
                            <br />
                            <br />
                            Selected dates:{" "}
                            {selectedDates
                              .map((date) =>
                                format(new Date(date), "dd/MM/yyyy")
                              )
                              .join(", ")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteSelected}>
                            Delete Selected
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          Delete All Records
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete All Records
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete ALL records? This
                            will permanently delete all defect records and
                            cannot be undone. This action is irreversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAll}>
                            Delete All
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Single Date Selection */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium mb-2">
                Select Archived Date to View
              </label>
              {archivedDates.length > 0 ? (
                <Select
                  onValueChange={handleDateChange}
                  value={selectedDate || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a date" />
                  </SelectTrigger>
                  <SelectContent>
                    {archivedDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {format(new Date(date), "dd/MM/yyyy")}
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
        </div>

        {selectedDate ? (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Records from {format(new Date(selectedDate), "dd/MM/yyyy")}
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
                  handleUpdateRecord={handleUpdateRecord}
                  handleToggleVisibility={handleToggleVisibility}
                  handleDeleteAllByDate={handleDeleteAllByDate}
                  handleArchiveDate={handleArchiveDate}
                  sortConfig={sortConfig}
                  currentUserEmail={currentUser?.email}
                  isArchiveView={true}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2 text-gray-300">
              No Date Selected
            </h2>
            <p className="text-gray-400">
              Please select an archived date from the dropdown above to view its
              records.
            </p>
          </div>
        )}
      </div>

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
