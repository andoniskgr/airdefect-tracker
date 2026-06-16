import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight, Printer } from "lucide-react";
import { format } from "date-fns";
import { RecordsTable } from "../components/defect-records/RecordsTable";
import { useDefectRecords } from "../hooks/useDefectRecords";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useDefectForm } from "../hooks/useDefectForm";
import { EditDefectModal } from "../components/defect-records/EditDefectModal";
import { printDefectRecords } from "../utils/printDefectRecords";
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
  const { currentUser, getUserData } = useAuth();
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
    unarchiveMultipleDates,
  } = useDefectRecords(currentUser?.email);

  const {
    isEditModalOpen,
    setIsEditModalOpen,
    editingRecord,
    setEditingRecord,
    handleEditRecord,
    handleEditSubmit,
  } = useDefectForm(currentUser?.email);

  const sortedArchivedDates = useMemo(
    () => [...archivedDates].sort((a, b) => b.localeCompare(a)),
    [archivedDates]
  );

  useEffect(() => {
    const storedArchivedDates = localStorage.getItem("archivedDates");
    if (storedArchivedDates) {
      const dates = JSON.parse(storedArchivedDates);
      setArchivedDates(dates);
      // Don't automatically select the first date - let user choose
    }
  }, []);

  const handleViewSelected = () => {
    if (selectedDates.length !== 1) {
      toast.error("Please select exactly one date to view");
      return;
    }
    setSelectedDate(selectedDates[0]);
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

  const handleUnarchiveSelected = async () => {
    if (selectedDates.length === 0) {
      toast.error("Please select at least one date to unarchive");
      return;
    }

    try {
      const success = await unarchiveMultipleDates(selectedDates);
      if (!success) return;

      if (currentUser?.email) {
        try {
          const { getUserArchivedDates } = await import("../utils/firebaseDB");
          const updatedDates = await getUserArchivedDates(currentUser.email);
          setArchivedDates(updatedDates);
          localStorage.setItem("archivedDates", JSON.stringify(updatedDates));

          if (selectedDate && selectedDates.includes(selectedDate)) {
            setSelectedDate(null);
          }
        } catch (error) {
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
      toast.error("Failed to unarchive selected dates");
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

  const handlePrint = async () => {
    if (recordsToShow.length === 0) {
      toast.error("No records to print");
      return;
    }

    await printDefectRecords(recordsToShow, {
      title: `Archived Defect Records - ${format(new Date(selectedDate!), "dd/MM/yyyy")}`,
      getUserCode: async () => {
        const userData = await getUserData();
        return userData?.userCode;
      },
    });
  };

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
                    {sortedArchivedDates.map((date) => (
                      <div key={date} className="flex items-center space-x-2">
                        <Checkbox
                          id={`date-${date}`}
                          checked={selectedDates.includes(date)}
                          onCheckedChange={(checked) =>
                            handleDateSelection(date, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`date-${date}`}
                          className={`text-sm cursor-pointer ${
                            selectedDate === date
                              ? "font-semibold text-blue-300"
                              : ""
                          }`}
                        >
                          {format(new Date(date), "dd/MM/yyyy")}
                          {selectedDate === date && " (viewing)"}
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Bulk Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="default"
                      disabled={selectedDates.length !== 1}
                      onClick={handleViewSelected}
                    >
                      View Selected
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="secondary"
                          disabled={selectedDates.length === 0}
                        >
                          Unarchive Selected ({selectedDates.length})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Unarchive Selected Dates
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to unarchive{" "}
                            {selectedDates.length} selected date(s)? These
                            records will reappear on the main records page.
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
                          <AlertDialogAction onClick={handleUnarchiveSelected}>
                            Unarchive Selected
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

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

          {archivedDates.length === 0 && (
            <p className="text-gray-400">No archived dates found</p>
          )}
        </div>

        {selectedDate ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Records from {format(new Date(selectedDate), "dd/MM/yyyy")}
              </h2>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
                disabled={loading || recordsToShow.length === 0}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>

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
              Select a date in Bulk Actions and click View Selected to see its
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
