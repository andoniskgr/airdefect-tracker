import { useState, useCallback } from "react";
import { DefectRecord } from "../components/defect-records/DefectRecord.types";
import { saveRecord } from "../utils/firebaseDB";
import { format } from "date-fns";
import { toast } from "sonner";

export const useDefectForm = (currentUserEmail: string | null | undefined) => {
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
    nxs: false,
    rst: false,
    sl: false,
    ok: false,
    pln: false,
    status: 'active'
  };

  const [formData, setFormData] = useState<Omit<DefectRecord, 'id'>>(defaultFormData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DefectRecord | null>(null);
  
  const handleClear = useCallback(() => {
    console.log('Clearing form data');
    setFormData({
      ...defaultFormData,
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
    });
  }, []);
  
  const handleSubmit = async () => {
    try {
      const timestamp = new Date().toISOString();
      const userEmail = currentUserEmail || 'unknown';
      
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
  
  const handleEditRecord = (record: DefectRecord) => {
    console.log("Editing record with ID:", record.id);
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };
  
  const handleEditSubmit = async () => {
    if (!editingRecord) return;
    
    try {
      console.log("Updating record with ID:", editingRecord.id);
      
      const timestamp = new Date().toISOString();
      const userEmail = currentUserEmail || 'unknown';
      
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

  return {
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
  };
};
