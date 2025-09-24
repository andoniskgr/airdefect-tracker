import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Plus, Filter, Printer } from "lucide-react";
import {
  FilterType,
  DefectRecord,
  VisibilityFilterType,
} from "./DefectRecord.types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

interface FilterButtonsProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  visibilityFilter: VisibilityFilterType;
  setVisibilityFilter: (visibilityFilter: VisibilityFilterType) => void;
  exportToExcel: () => void;
  onAddRecord: () => void;
  records: DefectRecord[];
}

export const FilterButtons = ({
  filter,
  setFilter,
  visibilityFilter,
  setVisibilityFilter,
  exportToExcel,
  onAddRecord,
  records,
}: FilterButtonsProps) => {
  const isMobile = useIsMobile();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { getUserData } = useAuth();

  const handlePrint = async () => {
    if (records.length === 0) return;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    // Get user data for the header
    let userCode = "USER";
    try {
      const userData = await getUserData();
      userCode = userData?.userCode || "USER";
    } catch (error) {
      console.error("Error getting user data:", error);
    }

    // Group records by date
    const groupRecordsByDate = () => {
      const groups: { [key: string]: DefectRecord[] } = {};

      records.forEach((record) => {
        const dateKey = format(new Date(record.date), "yyyy-MM-dd");
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(record);
      });

      return Object.keys(groups)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        .map((dateKey) => ({
          date: dateKey,
          formattedDate: format(new Date(dateKey), "dd/MM/yyyy"),
          records: groups[dateKey],
        }));
    };

    const groupedRecords = groupRecordsByDate();

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Defect Records Report</title>
          <style>
            @page {
              margin: 0.5in;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10px;
              color: #000;
              font-size: 14px;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .header h1 {
              margin: 0;
              font-size: 20px;
              font-weight: bold;
            }
            .header p {
              margin: 2px 0 0 0;
              font-size: 12px;
            }
            .date-group {
              margin-bottom: 15px;
            }
            .date-header {
              background: #f0f0f0;
              padding: 5px 8px;
              font-weight: bold;
              font-size: 12px;
              border: 1px solid #000;
              margin-bottom: 0;
            }
            .records-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000;
              margin-bottom: 10px;
              font-size: 11px;
            }
            .records-table th {
              background: #e0e0e0;
              color: #000;
              padding: 4px 6px;
              text-align: left;
              font-weight: bold;
              font-size: 10px;
              border: 1px solid #000;
            }
            .records-table td {
              padding: 4px 6px;
              border: 1px solid #000;
              font-size: 10px;
            }
            .records-table tr:nth-child(even) {
              background: #f9f9f9;
            }
            .checkbox {
              text-align: center;
            }
            .checkbox input {
              width: 12px;
              height: 12px;
              border: none !important;
              background-color: white !important;
              -webkit-appearance: none;
              -moz-appearance: none;
              appearance: none;
              position: relative;
            }
            .checkbox input:checked {
              background-color: white !important;
            }
            .checkbox input:checked::after {
              content: "✓";
              position: absolute;
              top: -2px;
              left: 1px;
              color: black !important;
              font-size: 10px;
              font-weight: bold;
              text-shadow: none;
            }
            .checkbox input:checked::before {
              content: "✓";
              position: absolute;
              top: -2px;
              left: 1px;
              color: black !important;
              font-size: 10px;
              font-weight: bold;
              z-index: 1;
              text-shadow: none;
            }
            .no-records {
              text-align: center;
              padding: 20px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Defect Records Report - ${format(new Date(), "dd/MM/yyyy")}</h1>
            <p>Generated by ${userCode}</p>
          </div>

          ${
            records.length === 0
              ? `
            <div class="no-records">
              <p>No records found</p>
            </div>
          `
              : `
            ${groupedRecords
              .map(
                (group) => `
              <div class="date-group">
                <div class="date-header">
                  ${group.formattedDate} (${group.records.length} Records)
                </div>
                <table class="records-table">
                  <thead>
                    <tr>
                      <th>TIME</th>
                      <th>A/C</th>
                      <th>STA</th>
                      <th>DEFECT</th>
                      <th>REMARK</th>
                      <th>RST</th>
                      <th>DLY</th>
                      <th>OK</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${group.records
                      .map(
                        (record) => `
                      <tr>
                        <td>${record.time}</td>
                        <td>${record.registration}</td>
                        <td>${record.station}</td>
                        <td>${record.defect}</td>
                        <td>${(record.remarks || "").toUpperCase()}</td>
                        <td class="checkbox">
                          <input type="checkbox" ${
                            record.rst ? "checked" : ""
                          } disabled />
                        </td>
                        <td class="checkbox">
                          <input type="checkbox" ${
                            record.dly ? "checked" : ""
                          } disabled />
                        </td>
                        <td class="checkbox">
                          <input type="checkbox" ${
                            record.ok ? "checked" : ""
                          } disabled />
                        </td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            `
              )
              .join("")}
          `
          }
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for the window to be fully loaded and rendered
    printWindow.addEventListener("load", () => {
      setTimeout(() => {
        // Force a reflow to ensure content is rendered
        printWindow.document.body.offsetHeight;
        // Start the print process
        printWindow.print();

        // Auto-close the tab when print dialog is cancelled or completed
        const handlePrintComplete = () => {
          setTimeout(() => {
            if (printWindow && !printWindow.closed) {
              printWindow.close();
            }
          }, 1000);
        };

        // Listen for print dialog events
        printWindow.addEventListener("afterprint", handlePrintComplete);

        // Also listen for beforeunload to catch cancel events
        printWindow.addEventListener("beforeunload", () => {
          if (printWindow && !printWindow.closed) {
            printWindow.close();
          }
        });

        // Fallback: close after 1 second if still open (covers cancel case)
        setTimeout(() => {
          if (printWindow && !printWindow.closed) {
            printWindow.close();
          }
        }, 1000);
      }, 1000);
    });
  };

  // Mobile filter buttons in drawer
  const renderMobileFilters = () => (
    <>
      <div className="flex justify-between items-center mb-4 p-2 bg-slate-100 rounded-md shadow-md">
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
    <div className="flex justify-between items-center mb-4 p-2 bg-slate-100 rounded-md shadow-md">
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
  );

  return isMobile ? renderMobileFilters() : renderDesktopFilters();
};
