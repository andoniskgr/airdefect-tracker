import { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc, addDoc, getDoc, query, where } from "firebase/firestore";
import { db, saveRecord, getAllRecords, deleteRecord, deleteRecordsByDate } from "../utils/firebaseDB";
import { DefectRecord } from "../components/defect-records/DefectRecord.types";
import { RecordsTable } from "../components/defect-records/RecordsTable";
import { AddDefectModal } from "../components/defect-records/AddDefectModal";
import { EditDefectModal } from "../components/defect-records/EditDefectModal";
import { FilterButtons } from "../components/defect-records/FilterButtons";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";

const Index = () => {
  const { currentUser } = useAuth();
  const [defectRecords, setDefectRecords] = useState<DefectRecord[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<DefectRecord | null>(null);
  const [filter, setFilter] = useState<'all' | 'sl' | 'ok' | 'pln'>('all');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({
    key: 'time',
    direction: 'asc'
  });
  
  const defaultFormData = {
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
  };
  
  const [formData, setFormData] = useState<Omit<DefectRecord, 'id'>>(defaultFormData);
  
  const [editingRecord, setEditingRecord] = useState<DefectRecord | null>(null);

  useEffect(() => {
    setLoading(true);
    const fetchRecords = async () => {
      try {
        const records = await getAllRecords(currentUser?.email);
        setDefectRecords(records);
        console.log(`Fetched ${records.length} records for user ${currentUser?.email}`);
      } catch (error) {
        console.error("Error fetching records:", error);
        toast.error("Failed to load records: " + (error instanceof Error ? error.message : "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();

    const recordsCollection = collection(db, "defectRecords");
    let recordsQuery;
    
    if (currentUser?.email) {
      recordsQuery = query(recordsCollection, where("createdBy", "==", currentUser.email));
    } else {
      recordsQuery = query(recordsCollection);
    }
    
    const unsubscribe = onSnapshot(recordsQuery, (snapshot) => {
      console.log(`Snapshot received, docs count: ${snapshot.docs.length} for user ${currentUser?.email}`);
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DefectRecord[];
      
      setDefectRecords(records);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      toast.error("Failed to load records: " + error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.email]);

  const handleAddRecord = () => {
    setIsAddModalOpen(true);
  };

  const handleEditRecord = (record: DefectRecord) => {
    console.log("Editing record with ID:", record.id);
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      console.log("Deleting record with ID:", id);
      await deleteRecord(id, currentUser?.email);
      toast.success("Record deleted successfully!");
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };
  
  const handleDeleteAllByDate = async (date: string) => {
    try {
      await deleteRecordsByDate(date, currentUser?.email);
      toast.success(`All records for ${format(new Date(date), 'dd/MM/yyyy')} deleted successfully!`);
    } catch (error) {
      console.error("Error deleting records:", error);
      toast.error("Failed to delete records: " + (error instanceof Error ? error.message : "Unknown error"));
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
      ...defaultFormData,
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
    });
  };
  
  const handleSubmit = async () => {
    try {
      const timestamp = new Date().toISOString();
      const userEmail = currentUser?.email || 'unknown';
      
      const newRecord = {
        ...formData,
        id: '', // Empty ID for new records, let Firestore generate it
        createdBy: userEmail,
        createdAt: timestamp,
        updatedBy: userEmail,
        updatedAt: timestamp
      };
      
      console.log("Saving new record with audit data:", newRecord);
      await saveRecord(newRecord);
      
      toast.success("Record added successfully!");
      setIsAddModalOpen(false);
      
      handleClear();
    } catch (error) {
      console.error("Error adding record:", error);
      toast.error("Failed to add record: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };
  
  const handleEditSubmit = async () => {
    if (!editingRecord) return;
    
    try {
      console.log("Updating record with ID:", editingRecord.id);
      
      const timestamp = new Date().toISOString();
      const userEmail = currentUser?.email || 'unknown';
      
      const updatedRecord = {
        ...editingRecord,
        updatedBy: userEmail,
        updatedAt: timestamp
      };
      
      await saveRecord(updatedRecord);
      
      toast.success("Record updated successfully!");
      setIsEditModalOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error("Failed to update record: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const exportToExcel = () => {
    try {
      const recordsToExport = filter !== 'all'
        ? defectRecords.filter((record) => {
            if (filter === 'sl') return record.sl;
            if (filter === 'ok') return record.ok;
            if (filter === 'pln') return record.pln;
            return true;
          })
        : defectRecords;
      
      if (recordsToExport.length === 0) {
        toast.error("No records to export");
        return;
      }
      
      const headers = [
        "Date", "Time", "Registration", "Station", "Defect", "Remarks", 
        "ETA", "STD", "UPD", "RST", "SL", "OK", "PLN"
      ];
      
      const data = recordsToExport.map(record => [
        format(new Date(record.date), 'dd/MM/yyyy'),
        record.time,
        record.registration,
        record.station,
        record.defect,
        record.remarks,
        record.eta,
        record.std,
        record.upd,
        record.rst ? "YES" : "NO",
        record.sl ? "YES" : "NO",
        record.ok ? "YES" : "NO",
        record.pln ? "YES" : "NO"
      ]);
      
      let csvContent = headers.join(',') + '\n';
      data.forEach(row => {
        const formattedRow = row.map(cell => {
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        });
        csvContent += formattedRow.join(',') + '\n';
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `defect-records-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Excel export completed successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export to Excel");
    }
  };

  const filteredRecords = filter !== 'all'
    ? defectRecords.filter((record) => {
        if (filter === 'sl') return record.sl;
        if (filter === 'ok') return record.ok;
        if (filter === 'pln') return record.pln;
        return true;
      })
    : defectRecords;

  return (
    <div className="container mx-auto mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Defect Records</h1>
        <div>
          <Button onClick={handleAddRecord}>
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
  );
};

export default Index;
