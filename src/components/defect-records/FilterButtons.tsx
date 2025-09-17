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

  const handlePrint = () => {
    if (records.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

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
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              text-transform: uppercase;
            }
            .header p {
              margin: 5px 0 0 0;
              color: #666;
            }
            .date-group {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .date-header {
              background: #f5f5f5;
              padding: 10px 15px;
              font-weight: bold;
              font-size: 16px;
              border: 1px solid black;
              margin-bottom: 0;
            }
            .records-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid black;
              margin-bottom: 20px;
            }
            .records-table th {
              background: #333;
              color: black;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 12px;
              border-right: 1px solid black;
              border-bottom: 1px solid black;
            }
            .records-table th:last-child {
              border-right: none;
            }
            .records-table th:nth-child(1),
            .records-table th:nth-child(2),
            .records-table th:nth-child(3),
            .records-table th:nth-child(6),
            .records-table th:nth-child(7),
            .records-table th:nth-child(8) {
              width: 1%;
              white-space: nowrap;
            }
            .records-table th:nth-child(4),
            .records-table th:nth-child(5) {
              width: 50%;
            }
            .records-table td {
              padding: 8px;
              border-bottom: 1px solid black;
              border-right: 1px solid black;
              font-size: 12px;
            }
            .records-table td:last-child {
              border-right: none;
            }
            .records-table td:nth-child(1),
            .records-table td:nth-child(2),
            .records-table td:nth-child(3),
            .records-table td:nth-child(6),
            .records-table td:nth-child(7),
            .records-table td:nth-child(8) {
              width: 1%;
              white-space: nowrap;
              text-align: center;
              font-size: 12px;
            }
            .records-table td:nth-child(4),
            .records-table td:nth-child(5) {
              width: 50%;
            }
            .records-table tr:nth-child(even) {
              background: #f9f9f9;
            }
            .records-table tr:hover {
              background: #f5f5f5;
            }
            .yes {
              color: #28a745;
              font-weight: bold;
            }
            .no {
              color: #dc3545;
              font-weight: bold;
            }
            .checkbox {
              font-size: 40px;
              color: black;
            }
            .checkbox-unchecked {
              font-size: 40px;
              color: black;
            }
            .checkbox-input {
              width: 20px;
              height: 20px;
              margin: 0;
            }
            .no-records {
              text-align: center;
              padding: 40px;
              color: #666;
              font-style: italic;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Defect Records Report</h1>
            <p>Generated on ${format(new Date(), "dd/MM/yyyy HH:mm")}</p>
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
                        <td class="${
                          record.rst ? "checkbox" : "checkbox-unchecked"
                        }">
                          <input type="checkbox" ${
                            record.rst ? "checked" : ""
                          } disabled class="checkbox-input" />
                        </td>
                        <td class="${
                          record.dly ? "checkbox" : "checkbox-unchecked"
                        }">
                          <input type="checkbox" ${
                            record.dly ? "checked" : ""
                          } disabled class="checkbox-input" />
                        </td>
                        <td class="${
                          record.ok ? "checkbox" : "checkbox-unchecked"
                        }">
                          <input type="checkbox" ${
                            record.ok ? "checked" : ""
                          } disabled class="checkbox-input" />
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
    printWindow.focus();

    // Auto-close the tab when print dialog is cancelled or completed
    const handlePrintComplete = () => {
      // Close the tab after a short delay to allow for print dialog interaction
      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          printWindow.close();
        }
      }, 1000);
    };

    // Listen for print dialog events
    printWindow.addEventListener("afterprint", handlePrintComplete);

    // Also close if user navigates away or closes the tab
    printWindow.addEventListener("beforeunload", () => {
      if (printWindow && !printWindow.closed) {
        printWindow.close();
      }
    });

    // Start the print process
    printWindow.print();

    // Fallback: close after 30 seconds if still open
    setTimeout(() => {
      if (printWindow && !printWindow.closed) {
        printWindow.close();
      }
    }, 30000);
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
