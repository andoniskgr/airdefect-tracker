import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash } from "lucide-react";
import { AircraftTable } from "@/components/aircraft/AircraftTable";
import { AddAircraftModal } from "@/components/aircraft/AddAircraftModal";
import { EditAircraftModal } from "@/components/aircraft/EditAircraftModal";
import { ImportExcel } from "@/components/aircraft/ImportExcel";
import { useAircraftAdmin } from "@/hooks/useAircraftAdmin";
import { useState } from "react";

const AircraftAdmin = () => {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const {
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
    existingTypes,
    existingEngines,
    openAddModal,
    openEditModal,
    handleAddSubmit,
    handleEditSubmit,
    handleExcelImport,
    handleDeleteAircraft,
    handleDeleteAllAircraft,
    addSampleAircraft,
    testFirebaseConnection,
  } = useAircraftAdmin();

  return (
    <div className="min-h-screen bg-slate-700 text-white p-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Aircraft Administration</h1>

        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Aircraft
            </Button>

            <Button
              onClick={addSampleAircraft}
              className="bg-green-600 hover:bg-green-700"
            >
              Add Sample Data
            </Button>

            <Button
              onClick={testFirebaseConnection}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Test Firebase
            </Button>

            {aircraftData.length > 0 && (
              <Button
                onClick={() => setIsDeleteAlertOpen(true)}
                variant="destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete All
              </Button>
            )}
          </div>

          <ImportExcel handleExcelImport={handleExcelImport} />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-white text-lg">Loading aircraft data...</div>
          </div>
        ) : (
          <AircraftTable
            aircraftData={aircraftData}
            onEditAircraft={openEditModal}
            onDeleteAircraft={handleDeleteAircraft}
          />
        )}
      </div>

      <AddAircraftModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        aircraftForm={aircraftForm}
        handleInputChange={handleInputChange}
        handleCheckboxChange={handleCheckboxChange}
        handleSelectChange={handleSelectChange}
        existingTypes={existingTypes}
        existingEngines={existingEngines}
        handleAddSubmit={handleAddSubmit}
      />

      <EditAircraftModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        aircraftForm={aircraftForm}
        handleInputChange={handleInputChange}
        handleCheckboxChange={handleCheckboxChange}
        handleSelectChange={handleSelectChange}
        existingTypes={existingTypes}
        existingEngines={existingEngines}
        handleEditSubmit={handleEditSubmit}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete all aircraft records from the
              database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDeleteAllAircraft();
                setIsDeleteAlertOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AircraftAdmin;
