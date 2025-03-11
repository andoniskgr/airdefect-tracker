
import { useState, useEffect } from "react";
import { Aircraft } from "@/types/aircraft";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  writeBatch,
  getFirestore
} from "firebase/firestore";
import { db } from "@/utils/firebaseDB";

const COLLECTION_NAME = 'aircraft';

export const useAircraftAdmin = () => {
  // State for the aircraft data
  const [aircraftData, setAircraftData] = useState<Aircraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAircraftId, setEditAircraftId] = useState<string | null>(null);
  
  // State for the aircraft form (used for both add and edit)
  const [aircraftForm, setAircraftForm] = useState<Omit<Aircraft, 'id'>>({
    registration: "",
    type: "",
    engine: "",
    msn: "",
    cls: false,
    wifi: false,
  });

  // Fetch aircraft data from Firestore on component mount
  useEffect(() => {
    fetchAircraftData();
  }, []);

  // Fetch aircraft data from Firestore
  const fetchAircraftData = async () => {
    setIsLoading(true);
    try {
      const aircraftCollection = collection(db, COLLECTION_NAME);
      const aircraftSnapshot = await getDocs(aircraftCollection);
      const aircraftList = aircraftSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Aircraft[];
      
      setAircraftData(aircraftList);
    } catch (error) {
      console.error("Error fetching aircraft data:", error);
      toast.error("Failed to load aircraft data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle the form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAircraftForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setAircraftForm(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Open add modal with empty form
  const openAddModal = () => {
    setAircraftForm({
      registration: "",
      type: "",
      engine: "",
      msn: "",
      cls: false,
      wifi: false,
    });
    setIsAddModalOpen(true);
  };

  // Open edit modal with aircraft data
  const openEditModal = (aircraft: Aircraft) => {
    setAircraftForm({
      registration: aircraft.registration,
      type: aircraft.type,
      engine: aircraft.engine,
      msn: aircraft.msn,
      cls: aircraft.cls,
      wifi: aircraft.wifi,
    });
    setEditAircraftId(aircraft.id);
    setIsEditModalOpen(true);
  };

  // Handle add form submission
  const handleAddSubmit = async () => {
    // Validate form data
    if (!aircraftForm.registration || !aircraftForm.type || !aircraftForm.engine || !aircraftForm.msn) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Add to Firestore
      const docRef = await addDoc(collection(db, COLLECTION_NAME), aircraftForm);
      
      // Add to local state with Firestore ID
      const newAircraftWithId: Aircraft = {
        ...aircraftForm,
        id: docRef.id,
      };
      
      setAircraftData(prev => [...prev, newAircraftWithId]);
      
      // Reset form and close modal
      setAircraftForm({
        registration: "",
        type: "",
        engine: "",
        msn: "",
        cls: false,
        wifi: false,
      });
      setIsAddModalOpen(false);
      
      toast.success("Aircraft added successfully");
    } catch (error) {
      console.error("Error adding aircraft:", error);
      toast.error("Failed to add aircraft");
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    // Validate form data
    if (!aircraftForm.registration || !aircraftForm.type || !aircraftForm.engine || !aircraftForm.msn) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!editAircraftId) {
      toast.error("No aircraft selected for editing");
      return;
    }

    try {
      // Update in Firestore
      const aircraftRef = doc(db, COLLECTION_NAME, editAircraftId);
      await updateDoc(aircraftRef, aircraftForm);
      
      // Update in local state
      setAircraftData(prev => 
        prev.map(aircraft => 
          aircraft.id === editAircraftId 
            ? { ...aircraftForm, id: editAircraftId } 
            : aircraft
        )
      );
      
      // Reset form and close modal
      setAircraftForm({
        registration: "",
        type: "",
        engine: "",
        msn: "",
        cls: false,
        wifi: false,
      });
      setEditAircraftId(null);
      setIsEditModalOpen(false);
      
      toast.success("Aircraft updated successfully");
    } catch (error) {
      console.error("Error updating aircraft:", error);
      toast.error("Failed to update aircraft");
    }
  };

  // Handle aircraft deletion
  const handleDeleteAircraft = async (id: string) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      
      // Remove from local state
      setAircraftData(prev => prev.filter(aircraft => aircraft.id !== id));
      
      toast.success("Aircraft deleted successfully");
    } catch (error) {
      console.error("Error deleting aircraft:", error);
      toast.error("Failed to delete aircraft");
    }
  };

  // Handle deletion of all aircraft records
  const handleDeleteAllAircraft = async () => {
    try {
      const batch = writeBatch(getFirestore());
      
      // Add all documents to batch delete
      aircraftData.forEach((aircraft) => {
        const aircraftRef = doc(db, COLLECTION_NAME, aircraft.id);
        batch.delete(aircraftRef);
      });
      
      // Commit the batch
      await batch.commit();
      
      // Clear local state
      setAircraftData([]);
      
      toast.success("All aircraft records deleted successfully");
    } catch (error) {
      console.error("Error deleting all aircraft:", error);
      toast.error("Failed to delete all aircraft records");
    }
  };

  // Handle Excel import
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast.error("Please upload a valid Excel or CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const binaryStr = evt.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        
        // Assume the first sheet contains our data
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map JSON data to our Aircraft type
        const importedData = jsonData.map((row: any) => ({
          registration: row['A/C'] || row['Registration'] || row['registration'] || '',
          type: row['Type'] || row['type'] || row['TYPE'] || '',
          engine: row['Engine'] || row['engine'] || row['ENGINE'] || '',
          msn: row['MSN'] || row['msn'] || '',
          cls: Boolean(row['CLS'] || row['cls'] || false),
          wifi: Boolean(row['WIFI'] || row['wifi'] || false),
        }));
        
        if (importedData.length === 0) {
          toast.error("No valid data found in the file");
          return;
        }
        
        // Add to Firestore in batch
        const batch = writeBatch(getFirestore());
        const newAircraftData: Aircraft[] = [];
        
        try {
          // First clear existing data
          await handleDeleteAllAircraft();
          
          // Now add all imported data
          for (const aircraft of importedData) {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), aircraft);
            newAircraftData.push({
              id: docRef.id,
              ...aircraft,
            } as Aircraft);
          }
          
          // Update local state
          setAircraftData(newAircraftData);
          
          toast.success(`Successfully imported ${importedData.length} aircraft records`);
        } catch (error) {
          console.error("Error importing records to Firestore:", error);
          toast.error("Failed to import records to database");
        }
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast.error("Failed to parse the Excel file. Please check the format.");
      }
    };
    
    reader.onerror = () => {
      toast.error("Error reading the file");
    };
    
    reader.readAsBinaryString(file);
    
    // Reset the file input
    e.target.value = "";
  };

  return {
    aircraftData,
    isLoading,
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    aircraftForm,
    handleInputChange,
    handleCheckboxChange,
    openAddModal,
    openEditModal,
    handleAddSubmit,
    handleEditSubmit,
    handleExcelImport,
    handleDeleteAircraft,
    handleDeleteAllAircraft,
  };
};
