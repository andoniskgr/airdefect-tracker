
import { useState, useCallback } from "react";
import { DefectRecord } from "../components/defect-records/DefectRecord.types";
import { saveRecord } from "../utils/firebaseDB";
import { createInitialHistory, trackFieldChanges } from "../utils/historyUtils";
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
    dly: false,  // Added DLY field with default false
    sl: false,
    ok: false,
    pln: false,
    isPublic: true,  // Changed to true - new records are public by default
    status: 'active'
  };

  const [formData, setFormData] = useState<Omit<DefectRecord, 'id'>>(defaultFormData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DefectRecord | null>(null);
  const [originalRecord, setOriginalRecord] = useState<DefectRecord | null>(null);
  
  const handleClear = useCallback(() => {
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
      } as DefectRecord;

      // Create initial history for the new record
      newRecord.history = createInitialHistory(newRecord, userEmail);
      
      await saveRecord(newRecord);
      
      toast.success("Record added successfully!");
      setIsAddModalOpen(false);
      
      handleClear();
    } catch (error) {
      toast.error("Failed to add record: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };
  
  const handleEditRecord = (record: DefectRecord) => {
    setEditingRecord(record);
    setOriginalRecord({ ...record }); // Store a copy of the original record
    setIsEditModalOpen(true);
  };
  
  const handleEditSubmit = async () => {
    if (!editingRecord || !originalRecord) return;
    
    try {
      
      const timestamp = new Date().toISOString();
      const userEmail = currentUserEmail || 'unknown';
      
      // Create the updated record with proper metadata
      const updatedRecord: DefectRecord = {
        ...editingRecord,
        updatedBy: userEmail,
        updatedAt: timestamp
      };
      
      // Track changes by comparing original record with updated record
      const changes = trackFieldChanges(originalRecord, updatedRecord, userEmail);
      if (changes.length > 0) {
        updatedRecord.history = [...(originalRecord.history || []), ...changes];
      }
      
      await saveRecord(updatedRecord);
      
      toast.success("Record updated successfully!");
      setIsEditModalOpen(false);
      setEditingRecord(null);
      setOriginalRecord(null);
    } catch (error) {
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
    originalRecord,
    setOriginalRecord,
    handleClear,
    handleSubmit,
    handleEditRecord,
    handleEditSubmit
  };
};
