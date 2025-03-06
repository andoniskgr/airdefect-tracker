
import { useState } from "react";
import { DefectRecord } from "../components/defect-records/DefectRecord.types";
import { RecordsTable } from "../components/defect-records/RecordsTable";
import { AddDefectModal } from "../components/defect-records/AddDefectModal";
import { FilterButtons } from "../components/defect-records/FilterButtons";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDefectRecords } from "../hooks/useDefectRecords";
import { useDefectForm } from "../hooks/useDefectForm";

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
    saveRecord,
    getFilteredRecords
  } = useDefectRecords(currentUser?.email);

  const {
    formData,
    setFormData,
    isAddModalOpen,
    setIsAddModalOpen,
    handleClear,
    handleSubmit
  } = useDefectForm(currentUser?.email);

  const filteredRecords = getFilteredRecords();

  const handleSaveRecord = (record: DefectRecord) => {
    saveRecord(record);
  };

  return (
    <div className="container mx-auto mt-8">
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
          handleEditRecord={() => {}}
          handleSaveRecord={handleSaveRecord}
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
    </div>
  );
};

export default Index;
