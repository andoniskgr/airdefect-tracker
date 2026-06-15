import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Plus, Filter, Printer } from "lucide-react";
import {
  FilterType,
  DefectRecord,
  VisibilityFilterType,
} from "./DefectRecord.types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { printDefectRecords } from "@/utils/printDefectRecords";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { SearchInput } from "./SearchInput";

interface FilterButtonsProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  visibilityFilter: VisibilityFilterType;
  setVisibilityFilter: (visibilityFilter: VisibilityFilterType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  exportToExcel: () => void;
  onAddRecord: () => void;
  records: DefectRecord[];
}

export const FilterButtons = ({
  filter,
  setFilter,
  visibilityFilter,
  setVisibilityFilter,
  searchQuery,
  setSearchQuery,
  exportToExcel,
  onAddRecord,
  records,
}: FilterButtonsProps) => {
  const isMobile = useIsMobile();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { getUserData } = useAuth();

  const handlePrint = async () => {
    await printDefectRecords(records, {
      getUserCode: async () => {
        const userData = await getUserData();
        return userData?.userCode;
      },
    });
  };

  // Mobile filter buttons in drawer
  const renderMobileFilters = () => (
    <>
      <div className="mb-4 p-2 bg-slate-100 rounded-md shadow-md">
        <div className="mb-3">
          <SearchInput
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search records..."
            className="w-full"
          />
        </div>
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setFiltersOpen(true)}
            variant="outline"
            className="text-sm uppercase font-semibold bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
          >
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={onAddRecord}
              className="bg-slate-700 text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add Record</span>
            </Button>
          </div>
        </div>
      </div>

      <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filter Records</DrawerTitle>
            <DrawerDescription>
              Select a filter to apply to your records
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-3 p-4">
            <Button
              onClick={() => {
                setFilter("all");
                setFiltersOpen(false);
              }}
              variant={filter === "all" ? "default" : "outline"}
              className={`text-sm uppercase font-semibold w-full ${
                filter === "all"
                  ? "bg-slate-700 text-white"
                  : "bg-white text-slate-800 border-slate-300"
              }`}
            >
              All Records
            </Button>
            <Button
              onClick={() => {
                setFilter("sl");
                setFiltersOpen(false);
              }}
              variant={filter === "sl" ? "default" : "outline"}
              className={`text-sm uppercase font-semibold w-full ${
                filter === "sl"
                  ? "bg-slate-700 text-white"
                  : "bg-white text-slate-800 border-slate-300"
              }`}
            >
              Pending Only
            </Button>
            <Button
              onClick={() => {
                setFilter("ok");
                setFiltersOpen(false);
              }}
              variant={filter === "ok" ? "default" : "outline"}
              className={`text-sm uppercase font-semibold w-full ${
                filter === "ok"
                  ? "bg-slate-700 text-white"
                  : "bg-white text-slate-800 border-slate-300"
              }`}
            >
              SOLVED
            </Button>
            <Button
              onClick={() => {
                setFilter("pln");
                setFiltersOpen(false);
              }}
              variant={filter === "pln" ? "default" : "outline"}
              className={`text-sm uppercase font-semibold w-full ${
                filter === "pln"
                  ? "bg-slate-700 text-white"
                  : "bg-white text-slate-800 border-slate-300"
              }`}
            >
              PLN
            </Button>
            <Button
              onClick={() => {
                setFilter("nxs");
                setFiltersOpen(false);
              }}
              variant={filter === "nxs" ? "default" : "outline"}
              title="Rows with NXS checked"
              className={`text-sm uppercase font-semibold w-full ${
                filter === "nxs"
                  ? "bg-slate-700 text-white"
                  : "bg-white text-slate-800 border-slate-300"
              }`}
            >
              NXS
            </Button>
          </div>
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3 text-slate-700">
              Visibility
            </h3>
            <div className="grid gap-2">
              <Button
                onClick={() => {
                  setVisibilityFilter("both");
                  setFiltersOpen(false);
                }}
                variant={visibilityFilter === "both" ? "default" : "outline"}
                className={`text-sm uppercase font-semibold w-full ${
                  visibilityFilter === "both"
                    ? "bg-slate-700 text-white"
                    : "bg-white text-slate-800 border-slate-300"
                }`}
              >
                BOTH
              </Button>
              <Button
                onClick={() => {
                  setVisibilityFilter("public");
                  setFiltersOpen(false);
                }}
                variant={visibilityFilter === "public" ? "default" : "outline"}
                className={`text-sm uppercase font-semibold w-full ${
                  visibilityFilter === "public"
                    ? "bg-slate-700 text-white"
                    : "bg-white text-slate-800 border-slate-300"
                }`}
              >
                PUBLIC
              </Button>
              <Button
                onClick={() => {
                  setVisibilityFilter("private");
                  setFiltersOpen(false);
                }}
                variant={visibilityFilter === "private" ? "default" : "outline"}
                className={`text-sm uppercase font-semibold w-full ${
                  visibilityFilter === "private"
                    ? "bg-slate-700 text-white"
                    : "bg-white text-slate-800 border-slate-300"
                }`}
              >
                PRIVATE
              </Button>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );

  // Desktop filter buttons - the original layout
  const renderDesktopFilters = () => (
    <div className="mb-4 p-2 bg-slate-100 rounded-md shadow-md">
      <div className="mb-3">
        <SearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search records..."
          className="max-w-md"
        />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            className={`text-sm uppercase font-semibold ${
              filter === "all"
                ? "bg-slate-700 text-white"
                : "bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
            }`}
          >
            All
          </Button>
          <Button
            onClick={() => setFilter("sl")}
            variant={filter === "sl" ? "default" : "outline"}
            className={`text-sm uppercase font-semibold ${
              filter === "sl"
                ? "bg-slate-700 text-white"
                : "bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
            }`}
          >
            PENDING
          </Button>
          <Button
            onClick={() => setFilter("ok")}
            variant={filter === "ok" ? "default" : "outline"}
            className={`text-sm uppercase font-semibold ${
              filter === "ok"
                ? "bg-slate-700 text-white"
                : "bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
            }`}
          >
            SOLVED
          </Button>
          <Button
            onClick={() => setFilter("pln")}
            variant={filter === "pln" ? "default" : "outline"}
            className={`text-sm uppercase font-semibold ${
              filter === "pln"
                ? "bg-slate-700 text-white"
                : "bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
            }`}
          >
            PLN
          </Button>
          <Button
            onClick={() => setFilter("nxs")}
            variant={filter === "nxs" ? "default" : "outline"}
            title="Rows with NXS checked"
            className={`text-sm uppercase font-semibold ${
              filter === "nxs"
                ? "bg-slate-700 text-white"
                : "bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
            }`}
          >
            NXS
          </Button>
          <div className="border-l border-slate-300 pl-3 ml-3">
            <span className="text-xs text-slate-600 mr-2">Visibility:</span>
            <Button
              onClick={() => setVisibilityFilter("both")}
              variant={visibilityFilter === "both" ? "default" : "outline"}
              size="sm"
              className={`text-xs uppercase font-semibold ${
                visibilityFilter === "both"
                  ? "bg-slate-700 text-white"
                  : "bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
              }`}
            >
              BOTH
            </Button>
            <Button
              onClick={() => setVisibilityFilter("public")}
              variant={visibilityFilter === "public" ? "default" : "outline"}
              size="sm"
              className={`text-xs uppercase font-semibold ml-1 ${
                visibilityFilter === "public"
                  ? "bg-slate-700 text-white"
                  : "bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
              }`}
            >
              PUBLIC
            </Button>
            <Button
              onClick={() => setVisibilityFilter("private")}
              variant={visibilityFilter === "private" ? "default" : "outline"}
              size="sm"
              className={`text-xs uppercase font-semibold ml-1 ${
                visibilityFilter === "private"
                  ? "bg-slate-700 text-white"
                  : "bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
              }`}
            >
              PRIVATE
            </Button>
          </div>
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="text-sm uppercase ml-2 bg-white text-slate-800 border-slate-300 hover:bg-slate-100 font-semibold"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="text-sm uppercase ml-2 bg-white text-slate-800 border-slate-300 hover:bg-slate-100 font-semibold"
          >
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>

        <Button
          onClick={onAddRecord}
          className="bg-slate-700 text-white hover:bg-slate-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>
    </div>
  );

  return isMobile ? renderMobileFilters() : renderDesktopFilters();
};
