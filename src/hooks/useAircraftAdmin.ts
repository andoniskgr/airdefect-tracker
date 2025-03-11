
import { useState } from "react";
import { Aircraft } from "@/types/aircraft";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

export const useAircraftAdmin = () => {
  // State for the aircraft data
  const [aircraftData, setAircraftData] = useState<Aircraft[]>([]);
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
  const handleAddSubmit = () => {
    // Validate form data
    if (!aircraftForm.registration || !aircraftForm.type || !aircraftForm.engine || !aircraftForm.msn) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Create new aircraft with a unique ID
    const newAircraftWithId: Aircraft = {
      ...aircraftForm,
      id: crypto.randomUUID(),
    };

    // Add to the list
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
  };

  // Handle edit form submission
  const handleEditSubmit = () => {
    // Validate form data
    if (!aircraftForm.registration || !aircraftForm.type || !aircraftForm.engine || !aircraftForm.msn) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!editAircraftId) {
      toast.error("No aircraft selected for editing");
      return;
    }

    // Update the existing aircraft
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
  };

  // Handle Excel import
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast.error("Please upload a valid Excel or CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        
        // Assume the first sheet contains our data
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map JSON data to our Aircraft type
        const importedData: Aircraft[] = jsonData.map((row: any) => ({
          id: crypto.randomUUID(),
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
        
        setAircraftData(importedData);
        toast.success(`Successfully imported ${importedData.length} aircraft records`);
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
  };
};
