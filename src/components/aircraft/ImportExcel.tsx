
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet } from "lucide-react";

interface ImportExcelProps {
  handleExcelImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImportExcel = ({ handleExcelImport }: ImportExcelProps) => {
  return (
    <div className="relative">
      <Input
        type="file"
        id="excel-upload"
        className="hidden"
        accept=".xlsx,.xls,.csv"
        onChange={handleExcelImport}
      />
      <Label 
        htmlFor="excel-upload" 
        className="cursor-pointer inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Import from Excel
      </Label>
    </div>
  );
};
