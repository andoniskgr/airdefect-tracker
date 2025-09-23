import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DefectRecord, RecordHistoryEntry } from "./DefectRecord.types";
import { format } from "date-fns";
import { Clock, User, Edit, Trash2, Plus, Printer } from "lucide-react";

interface HistoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  record: DefectRecord | null;
}

export const HistoryModal = ({
  isOpen,
  onOpenChange,
  record,
}: HistoryModalProps) => {
  const [history, setHistory] = useState<RecordHistoryEntry[]>([]);

  useEffect(() => {
    if (record?.history) {
      // Sort history by most recent first
      const sortedHistory = [...record.history].sort(
        (a, b) =>
          new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
      );
      setHistory(sortedHistory);
    } else {
      setHistory([]);
    }
  }, [record]);

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case "create":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "update":
        return <Edit className="h-4 w-4 text-blue-600" />;
      case "delete":
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <Edit className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case "create":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-blue-100 text-blue-800";
      case "delete":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatValue = (value: any) => {
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (value === "" || value === null || value === undefined) {
      return "Empty";
    }
    return String(value);
  };

  const handlePrint = () => {
    if (!record) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Change History - ${record.registration}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 15px;
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
            .record-info {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 30px;
            }
            .record-info h3 {
              margin: 0 0 10px 0;
              font-size: 18px;
            }
            .record-info p {
              margin: 5px 0;
              font-size: 14px;
            }
            .history-entry {
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 15px;
              margin-bottom: 15px;
              background: #fff;
            }
            .history-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 1px solid #eee;
            }
            .change-type {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 3px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .change-type.create { background: #d4edda; color: #155724; }
            .change-type.update { background: #cce7ff; color: #004085; }
            .change-type.delete { background: #f8d7da; color: #721c24; }
            .field-name {
              font-weight: bold;
              margin-left: 10px;
            }
            .timestamp {
              font-size: 12px;
              color: #666;
            }
            .change-details {
              margin: 10px 0;
            }
            .change-details p {
              margin: 5px 0;
              font-size: 14px;
            }
            .from-value {
              color: #dc3545;
              font-weight: bold;
            }
            .to-value {
              color: #28a745;
              font-weight: bold;
            }
            .changed-by {
              font-size: 12px;
              color: #666;
              margin-top: 10px;
            }
            .no-history {
              text-align: center;
              padding: 40px;
              color: #666;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 5px;
              }
              .header {
                margin-bottom: 10px;
                padding-bottom: 8px;
              }
              .record-info {
                margin-bottom: 15px;
              }
              .history-entry {
                page-break-inside: avoid;
                margin-bottom: 10px;
              }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Change History - ${record.registration}</h1>
            <p>Complete history of changes made to this defect record</p>
          </div>

          <div class="record-info">
            <h3>Record Information</h3>
            <p><strong>Registration:</strong> ${record.registration}</p>
            <p><strong>Station:</strong> ${record.station}</p>
            <p><strong>Date:</strong> ${format(
              new Date(record.date),
              "dd/MM/yyyy"
            )}</p>
            <p><strong>Time:</strong> ${record.time}</p>
            <p><strong>Defect:</strong> ${record.defect}</p>
            <p><strong>Created:</strong> ${
              record.createdAt
                ? format(new Date(record.createdAt), "dd/MM/yyyy HH:mm")
                : "Unknown"
            }</p>
            <p><strong>Created By:</strong> ${record.createdBy || "Unknown"}</p>
          </div>

          ${
            history.length === 0
              ? `
            <div class="no-history">
              <p>No change history available for this record.</p>
            </div>
          `
              : `
            <h3>Change History (${history.length} entries)</h3>
            ${history
              .map(
                (entry, index) => `
              <div class="history-entry">
                <div class="history-header">
                  <div>
                    <span class="change-type ${
                      entry.changeType
                    }">${entry.changeType.toUpperCase()}</span>
                    <span class="field-name">${
                      entry.field.charAt(0).toUpperCase() + entry.field.slice(1)
                    }</span>
                  </div>
                  <div class="timestamp">
                    ${format(new Date(entry.changedAt), "dd/MM/yyyy HH:mm")}
                  </div>
                </div>
                
                <div class="change-details">
                  ${
                    entry.changeType === "create"
                      ? `
                    <p><strong>Initial value:</strong> <span class="to-value">${formatValue(
                      entry.newValue
                    )}</span></p>
                  `
                      : `
                    <p><strong>From:</strong> <span class="from-value">${formatValue(
                      entry.oldValue
                    )}</span></p>
                    <p><strong>To:</strong> <span class="to-value">${formatValue(
                      entry.newValue
                    )}</span></p>
                  `
                  }
                </div>
                
                <div class="changed-by">
                  <strong>Changed by:</strong> ${entry.changedBy}
                </div>
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
    
    // Wait for content to be fully rendered before printing
    setTimeout(() => {
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
    }, 500);
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl uppercase">
                Change History - {record.registration}
              </DialogTitle>
              <DialogDescription>
                Complete history of changes made to this defect record
              </DialogDescription>
            </div>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No change history available for this record.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getChangeIcon(entry.changeType)}
                      <Badge
                        variant="secondary"
                        className={getChangeTypeColor(entry.changeType)}
                      >
                        {entry.changeType.toUpperCase()}
                      </Badge>
                      <span className="font-medium text-sm">
                        {entry.field.charAt(0).toUpperCase() +
                          entry.field.slice(1)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(new Date(entry.changedAt), "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {entry.changeType === "create" ? (
                      <div className="text-sm">
                        <span className="text-gray-600">Initial value: </span>
                        <span className="font-medium">
                          {formatValue(entry.newValue)}
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">From: </span>
                          <span className="font-medium text-red-600">
                            {formatValue(entry.oldValue)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">To: </span>
                          <span className="font-medium text-green-600">
                            {formatValue(entry.newValue)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      <span>Changed by: {entry.changedBy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
