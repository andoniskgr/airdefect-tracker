
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AircraftTable } from "@/components/aircraft/AircraftTable";
import { AddAircraftModal } from "@/components/aircraft/AddAircraftModal";
import { EditAircraftModal } from "@/components/aircraft/EditAircraftModal";
import { ImportExcel } from "@/components/aircraft/ImportExcel";
import { useAircraftAdmin } from "@/hooks/useAircraftAdmin";

const AircraftAdmin = () => {
  const {
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
  } = useAircraftAdmin();

  return (
    <div className="min-h-screen bg-slate-700 text-white p-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Aircraft Administration</h1>
        
        <div className="mb-6 flex justify-between items-center">
          <Button 
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Aircraft
          </Button>
          
          <ImportExcel handleExcelImport={handleExcelImport} />
        </div>
        
        <AircraftTable 
          aircraftData={aircraftData} 
          onEditAircraft={openEditModal} 
        />
      </div>

      <AddAircraftModal 
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        aircraftForm={aircraftForm}
        handleInputChange={handleInputChange}
        handleCheckboxChange={handleCheckboxChange}
        handleAddSubmit={handleAddSubmit}
      />

      <EditAircraftModal 
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        aircraftForm={aircraftForm}
        handleInputChange={handleInputChange}
        handleCheckboxChange={handleCheckboxChange}
        handleEditSubmit={handleEditSubmit}
      />
    </div>
  );
};

export default AircraftAdmin;
