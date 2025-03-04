
import { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../utils/firebaseDB";
import { DefectRecord } from "../components/defect-records/DefectRecord.types";
import { RecordsTable } from "../components/defect-records/RecordsTable";
import { AddDefectModal } from "../components/defect-records/AddDefectModal";
import { EditDefectModal } from "../components/defect-records/EditDefectModal";
import { FilterButtons } from "../components/defect-records/FilterButtons";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { exportRecordsToPDF } from "@/utils/pdfExport";
import { toast } from "sonner";

const Index = () => {
  const [defectRecords, setDefectRecords] = useState<DefectRecord[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<DefectRecord | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recordsCollection = collection(db, "defectRecords");

    const unsubscribe = onSnapshot(recordsCollection, (snapshot) => {
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DefectRecord[];
      setDefectRecords(records);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddRecord = () => {
    setIsAddModalOpen(true);
  };

  const handleEditRecord = (record: DefectRecord) => {
    setRecordToEdit(record);
    setIsEditModalOpen(true);
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      const recordDoc = doc(db, "defectRecords", id);
      await deleteDoc(recordDoc);
      toast.success("Record deleted successfully!");
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record.");
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setRecordToEdit(null);
  };

  const handleFilterChange = (newFilter: string | null) => {
    setFilter(newFilter);
  };

  const filteredRecords = filter
    ? defectRecords.filter((record) => {
        if (filter === 'sl') return record.sl;
        if (filter === 'ok') return record.ok;
        return true;
      })
    : defectRecords;

  return (
    <div className="container mx-auto mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Defect Records</h1>
        <div className="space-x-2">
          <Button onClick={() => exportRecordsToPDF(defectRecords)}>
            Export to PDF
          </Button>
          <Button onClick={handleAddRecord}>
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </div>
      </div>

      <FilterButtons onFilterChange={handleFilterChange} />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <RecordsTable
          records={filteredRecords}
          onEdit={handleEditRecord}
          onDelete={handleDeleteRecord}
        />
      )}

      <AddDefectModal isOpen={isAddModalOpen} onClose={handleCloseModal} />

      {recordToEdit && (
        <EditDefectModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          record={recordToEdit}
        />
      )}
    </div>
  );
};

export default Index;
