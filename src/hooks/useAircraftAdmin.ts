
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

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    try {
      console.log("Testing Firebase connection...");
      console.log("Firebase app:", db.app);
      console.log("Firebase project ID:", db.app.options.projectId);
      
      // Try to read from users collection (which should have rules)
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      console.log("Users collection accessible, size:", usersSnapshot.size);
      
      // Try to read from aircraft collection
      const aircraftCollection = collection(db, 'aircraft');
      const aircraftSnapshot = await getDocs(aircraftCollection);
      console.log("Aircraft collection accessible, size:", aircraftSnapshot.size);
      
      return true;
    } catch (error) {
      console.error("Firebase connection test failed:", error);
      return false;
    }
  };

  // Fetch aircraft data from Firestore on component mount
  useEffect(() => {
    testFirebaseConnection().then((connected) => {
      if (connected) {
        fetchAircraftData();
      } else {
        console.error("Firebase connection test failed, skipping aircraft fetch");
        setIsLoading(false);
      }
    });
  }, []);

  // Fetch aircraft data from Firestore
  const fetchAircraftData = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching aircraft data from collection:", COLLECTION_NAME);
      console.log("Firebase db instance:", db);
      console.log("Firebase app:", db.app);
      
      const aircraftCollection = collection(db, COLLECTION_NAME);
      console.log("Aircraft collection reference:", aircraftCollection);
      
      const aircraftSnapshot = await getDocs(aircraftCollection);
      console.log("Aircraft snapshot size:", aircraftSnapshot.size);
      console.log("Aircraft snapshot empty:", aircraftSnapshot.empty);
      console.log("Aircraft snapshot docs:", aircraftSnapshot.docs);
      
      if (aircraftSnapshot.empty) {
        console.log("No aircraft documents found in the collection");
        setAircraftData([]);
        return;
      }
      
      const aircraftList = aircraftSnapshot.docs.map(doc => {
        console.log("Processing aircraft doc:", doc.id, doc.data());
        return {
          id: doc.id,
          ...doc.data()
        };
      }) as Aircraft[];
      
      console.log("Processed aircraft list:", aircraftList);
      setAircraftData(aircraftList);
    } catch (error) {
      console.error("Error fetching aircraft data:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // Check for specific Firebase errors
      if (error.code === 'permission-denied') {
        toast.error("Permission denied: Please check Firestore security rules for aircraft collection");
      } else if (error.code === 'unavailable') {
        toast.error("Firebase service unavailable. Please check your internet connection.");
      } else {
        toast.error(`Failed to load aircraft data: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle the form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Convert to uppercase for text fields
    const processedValue = ['registration', 'type', 'engine', 'msn'].includes(name) 
      ? value.toUpperCase() 
      : value;
    setAircraftForm(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setAircraftForm(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    // Convert to uppercase for text fields
    const processedValue = ['type', 'engine'].includes(name) 
      ? value.toUpperCase() 
      : value;
    setAircraftForm(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // Get unique existing types and engines from current aircraft data
  const getExistingTypes = () => {
    const types = aircraftData.map(aircraft => aircraft.type).filter(Boolean);
    return [...new Set(types)].sort();
  };

  const getExistingEngines = () => {
    const engines = aircraftData.map(aircraft => aircraft.engine).filter(Boolean);
    return [...new Set(engines)].sort();
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
      console.log("Adding aircraft to Firestore:", aircraftForm);
      // Add to Firestore
      const docRef = await addDoc(collection(db, COLLECTION_NAME), aircraftForm);
      console.log("Aircraft added with ID:", docRef.id);
      
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

  // Function to add sample aircraft data for testing
  const addSampleAircraft = async () => {
    const sampleAircraft = [
      {
        registration: "N123AB",
        type: "BOEING 737",
        engine: "CFM56-7B",
        msn: "12345",
        cls: true,
        wifi: false,
      },
      {
        registration: "N456CD",
        type: "AIRBUS A320",
        engine: "CFM56-5B",
        msn: "67890",
        cls: false,
        wifi: true,
      },
      {
        registration: "N789EF",
        type: "BOEING 777",
        engine: "GE90-115B",
        msn: "11111",
        cls: true,
        wifi: true,
      }
    ];

    try {
      console.log("Attempting to add sample aircraft data...");
      console.log("Sample data:", sampleAircraft);
      
      const batch = writeBatch(getFirestore());
      
      for (const aircraft of sampleAircraft) {
        const docRef = doc(collection(db, COLLECTION_NAME));
        console.log("Adding aircraft to batch:", aircraft);
        batch.set(docRef, aircraft);
      }
      
      console.log("Committing batch...");
      await batch.commit();
      console.log("Sample aircraft data added successfully");
      toast.success("Sample aircraft data added successfully");
      
      // Refresh the data
      console.log("Refreshing aircraft data...");
      await fetchAircraftData();
    } catch (error) {
      console.error("Error adding sample aircraft:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      if (error.code === 'permission-denied') {
        toast.error("Permission denied: Cannot add aircraft data. Check Firestore rules.");
      } else {
        toast.error(`Failed to add sample aircraft data: ${error.message}`);
      }
    }
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
    handleSelectChange,
    existingTypes: getExistingTypes(),
    existingEngines: getExistingEngines(),
    openAddModal,
    openEditModal,
    handleAddSubmit,
    handleEditSubmit,
    handleExcelImport,
    handleDeleteAircraft,
    handleDeleteAllAircraft,
    addSampleAircraft,
    testFirebaseConnection,
  };
};
