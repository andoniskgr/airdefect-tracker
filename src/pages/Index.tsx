
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
import { format } from "date-fns";

const Index = () => {
  const [defectRecords, setDefectRecords] = useState<DefectRecord[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<DefectRecord | null>(null);
  const [filter, setFilter] = useState<'all' | 'sl' | 'ok'>('all');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({
    key: 'time',
    direction: 'asc'
  });
  
  // Form data for adding a new record
  const [formData, setFormData] = useState<Omit<DefectRecord, 'id'>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    registration: '',
    station: '',
    defect: '',
    remarks: '',
    eta: '',
    std: '',
    upd: '',
    rst: false,
    sl: false,
    ok: false,
    pln: false,
    status: 'active'
  });
  
  // Editing record state
  const [editingRecord, setEditingRecord] = useState<DefectRecord | null>(null);

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
    setEditingRecord(record);
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
  
  const handleDeleteAllByDate = async (date: string) => {
    try {
      const recordsToDelete = defectRecords.filter(record => record.date === date);
      
      // Delete each record for the selected date
      for (const record of recordsToDelete) {
        const recordDoc = doc(db, "defectRecords", record.id);
        await deleteDoc(recordDoc);
      }
      
      toast.success(`All records for ${format(new Date(date), 'dd/MM/yyyy')} deleted successfully!`);
    } catch (error) {
      console.error("Error deleting records:", error);
      toast.error("Failed to delete records.");
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };
  
  const handleSort = (column: string) => {
    setSortConfig(prevConfig => ({
      key: column,
      direction: prevConfig.key === column && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const handleClear = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      registration: '',
      station: '',
      defect: '',
      remarks: '',
      eta: '',
      std: '',
      upd: '',
      rst: false,
      sl: false,
      ok: false,
      pln: false,
      status: 'active'
    });
  };
  
  const handleSubmit = async () => {
    // This would be implemented to save the form data to Firebase
    console.log("Form submitted:", formData);
    setIsAddModalOpen(false);
  };
  
  const handleEditSubmit = async () => {
    // This would be implemented to update the record in Firebase
    console.log("Edit submitted:", editingRecord);
    setIsEditModalOpen(false);
  };

  const filteredRecords = filter !== 'all'
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

      <FilterButtons 
        filter={filter}
        setFilter={setFilter}
        exportToPdf={() => exportRecordsToPDF(defectRecords)}
        exportToExcel={() => console.log("Export to Excel")}
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
  );
};

export default Index;
