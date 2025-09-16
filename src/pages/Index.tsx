import { useState } from "react";
import { DefectRecord } from "../components/defect-records/DefectRecord.types";
import { RecordsTable } from "../components/defect-records/RecordsTable";
import { AddDefectModal } from "../components/defect-records/AddDefectModal";
import { EditDefectModal } from "../components/defect-records/EditDefectModal";
import { FilterButtons } from "../components/defect-records/FilterButtons";
import { useAuth } from "../context/AuthContext";
import { useDefectRecords } from "../hooks/useDefectRecords";
import { useDefectForm } from "../hooks/useDefectForm";
import { Toaster } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();

  const {
    loading,
    filter,
    setFilter,
    visibilityFilter,
    setVisibilityFilter,
    sortConfig,
    handleSort,
    handleDeleteRecord,
    handleUpdateRecord,
    handleToggleVisibility,
    handleDeleteAllByDate,
    handleArchiveDate,
    exportToExcel,
    getFilteredRecords,
  } = useDefectRecords(currentUser?.email);

  const {
    formData,
    setFormData,
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingRecord,
    setEditingRecord,
    handleClear,
    handleSubmit,
    handleEditRecord,
    handleEditSubmit,
  } = useDefectForm(currentUser?.email);

  const filteredRecords = getFilteredRecords();

  return (
    <div
      className="min-h-screen bg-slate-700 text-white p-0 w-full"
      style={{ margin: 0, maxWidth: "100%" }}
    >
      <Toaster position="top-right" />
      <div className="w-full max-w-full px-2" style={{ margin: 0 }}>
        <div className="mb-4 flex items-center justify-between sticky top-0 z-10 bg-slate-700 pt-4 pb-2">
          <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold`}>
            Defect Records
          </h1>
        </div>

        <div className="sticky top-16 z-10 bg-slate-700 pb-2">
          <FilterButtons
            filter={filter}
            setFilter={setFilter}
            visibilityFilter={visibilityFilter}
            setVisibilityFilter={setVisibilityFilter}
            exportToExcel={exportToExcel}
            onAddRecord={() => setIsAddModalOpen(true)}
            records={filteredRecords}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className={`${isMobile ? "overflow-x-auto" : ""}`}>
            <RecordsTable
              records={filteredRecords}
              handleSort={handleSort}
              handleEditRecord={handleEditRecord}
              handleDeleteRecord={handleDeleteRecord}
              handleUpdateRecord={handleUpdateRecord}
              handleToggleVisibility={handleToggleVisibility}
              handleDeleteAllByDate={handleDeleteAllByDate}
              handleArchiveDate={handleArchiveDate}
              sortConfig={sortConfig}
              currentUserEmail={currentUser?.email}
            />
          </div>
        )}

        <AddDefectModal
          isOpen={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          formData={formData}
          setFormData={setFormData}
          handleClear={handleClear}
          handleSubmit={handleSubmit}
        />

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
    </div>
  );
};

export default Index;
