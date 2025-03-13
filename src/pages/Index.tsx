
import { useState } from "react";
import { DefectRecord } from "../components/defect-records/DefectRecord.types";
import { RecordsTable } from "../components/defect-records/RecordsTable";
import { AddDefectModal } from "../components/defect-records/AddDefectModal";
import { EditDefectModal } from "../components/defect-records/EditDefectModal";
import { FilterButtons } from "../components/defect-records/FilterButtons";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDefectRecords } from "../hooks/useDefectRecords";
import { useDefectForm } from "../hooks/useDefectForm";
import { Toaster } from "sonner";

const Index = () => {
  const { currentUser } = useAuth();
  
  const {
    loading,
    filter,
    setFilter,
    sortConfig,
    handleSort,
    handleDeleteRecord,
    handleDeleteAllByDate,
    exportToExcel,
    getFilteredRecords
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
    handleEditSubmit
  } = useDefectForm(currentUser?.email);

  const filteredRecords = getFilteredRecords();

  return (
    <div className="min-h-screen bg-slate-700 text-white p-0 w-full" style={{ margin: 0, maxWidth: '100%' }}>
      <Toaster position="top-right" />
      <div className="w-full max-w-full px-2" style={{ margin: 0 }}>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Defect Records</h1>
          <div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </div>
        </div>

        <FilterButtons 
          filter={filter}
          setFilter={setFilter}
          exportToExcel={exportToExcel}
        />

        {loading ? (
          <p>Loading...</p>
        ) : (
          <RecordsTable
            records={filteredRecords}
            handleSort={handleSort}
            handleEditRecord={handleEditRecord}
            handleDeleteRecord={handleDeleteRecord}
            handleDeleteAllByDate={handleDeleteAllByDate}
            sortConfig={sortConfig}
          />
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
