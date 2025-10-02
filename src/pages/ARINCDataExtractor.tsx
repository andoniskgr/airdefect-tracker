import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Radio, Download, RefreshCw, Filter } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ARINCRecord {
  tail: string;
  description: string;
  smi: string;
  timestamp?: string;
}

const ARINCDataExtractor = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [records, setRecords] = useState<ARINCRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [extractionStatus, setExtractionStatus] = useState<string>("");

  const handleDataExtraction = async () => {
    try {
      setIsExtracting(true);
      setError(null);
      setExtractionStatus("Opening ARINC messenger...");

      // Create a data extraction page that opens ARINC and extracts data
      const extractionHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>ARINC Data Extractor</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                background: #f5f5f5;
              }
              .container { 
                max-width: 800px; 
                margin: 0 auto; 
                background: white; 
                padding: 30px; 
                border-radius: 8px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .status { 
                padding: 15px; 
                margin: 10px 0; 
                border-radius: 4px; 
                font-weight: bold;
              }
              .success { background: #d4edda; color: #155724; }
              .error { background: #f8d7da; color: #721c24; }
              .info { background: #d1ecf1; color: #0c5460; }
              .button { 
                background: #007bff; 
                color: white; 
                padding: 10px 20px; 
                border: none; 
                border-radius: 4px; 
                cursor: pointer; 
                margin: 5px;
              }
              .button:hover { background: #0056b3; }
              .data-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              .data-table th, .data-table td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              .data-table th {
                background-color: #f2f2f2;
              }
              .filtered-count {
                background: #fff3cd;
                padding: 10px;
                border-radius: 4px;
                margin: 10px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>ARINC Data Extractor</h2>
              <div id="status" class="status info">Initializing data extraction...</div>
              
              <div class="filtered-count" id="filteredCount">
                <strong>Filter:</strong> SMI = "CFD" | <strong>Columns:</strong> Tail, Description
              </div>
              
              <div id="controls">
                <button class="button" id="openARINCBtn">Open ARINC Messenger</button>
                <button class="button" id="extractDataBtn">Extract Data</button>
                <button class="button" id="downloadDataBtn">Download CSV</button>
              </div>
              
              <div id="dataContainer" style="display: none;">
                <h3>Extracted Data (SMI = CFD)</h3>
                <table class="data-table" id="dataTable">
                  <thead>
                    <tr>
                      <th>Tail</th>
                      <th>Description</th>
                      <th>SMI</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody id="dataBody">
                  </tbody>
                </table>
              </div>
            </div>
            
            <script>
              document.addEventListener('DOMContentLoaded', function() {
                let extractedData = [];
                
                function updateStatus(message, type) {
                  type = type || 'info';
                  const statusEl = document.getElementById('status');
                  statusEl.textContent = message;
                  statusEl.className = 'status ' + type;
                }
                
                function openARINC() {
                  updateStatus('Opening ARINC messenger...', 'info');
                  window.open('https://opcenter.arinc.eu/aegean/messenger/?mode=ALL&folder_name=inbox', '_blank');
                }
                
                function extractData() {
                  updateStatus('Extracting data from ARINC messenger...', 'info');
                  
                  // Create a simplified extraction script
                  const extractionScript = [
                    "(function(){",
                    "console.log('ARINC Data Extraction Started');",
                    "var allText = document.body.textContent || document.body.innerText || '';",
                    "console.log('Page contains CFD:', allText.indexOf('CFD') !== -1);",
                    "",
                    "var possibleSelectors = [",
                    "  'table tbody tr',",
                    "  'table tr',",
                    "  'tr',",
                    "  'div[class*=\"row\"]',",
                    "  'div[class*=\"item\"]',",
                    "  'li'",
                    "];",
                    "",
                    "var rows = [];",
                    "for(var i = 0; i < possibleSelectors.length; i++){",
                    "  var found = document.querySelectorAll(possibleSelectors[i]);",
                    "  if(found.length > 0){",
                    "    console.log('Found', found.length, 'elements using:', possibleSelectors[i]);",
                    "    rows = found;",
                    "    break;",
                    "  }",
                    "}",
                    "",
                    "if(rows.length === 0){",
                    "  alert('No data rows found. Current URL: ' + window.location.href);",
                    "  return;",
                    "}",
                    "",
                    "var extractedData = [];",
                    "var debugInfo = [];",
                    "",
                    "for(var i = 0; i < rows.length; i++){",
                    "  var row = rows[i];",
                    "  var rowText = row.textContent || row.innerText || '';",
                    "  ",
                    "  if(i < 3){",
                    "    debugInfo.push('Row ' + i + ': ' + rowText.substring(0, 80));",
                    "  }",
                    "  ",
                    "  if(rowText.indexOf('CFD') !== -1){",
                    "    console.log('Found CFD in row', i);",
                    "    ",
                    "    var tail = '';",
                    "    var description = '';",
                    "    var smi = 'CFD';",
                    "    ",
                    "    var cells = row.querySelectorAll('td, div, span, p');",
                    "    for(var j = 0; j < cells.length; j++){",
                    "      var cellText = (cells[j].textContent || cells[j].innerText || '').trim();",
                    "      if(/^[A-Z0-9-]{4,}$/.test(cellText) && cellText.length < 20){",
                    "        tail = cellText;",
                    "      }",
                    "      else if(cellText.length > 10 && cellText.length < 200){",
                    "        description = cellText;",
                    "      }",
                    "    }",
                    "    ",
                    "    if(tail === ''){",
                    "      var parts = rowText.split(/\\s+/);",
                    "      for(var k = 0; k < parts.length; k++){",
                    "        var part = parts[k].trim();",
                    "        if(/^[A-Z0-9-]{4,}$/.test(part) && part.length < 20){",
                    "          tail = part;",
                    "          break;",
                    "        }",
                    "      }",
                    "    }",
                    "    ",
                    "    extractedData.push({",
                    "      tail: tail || 'N/A',",
                    "      description: description || 'N/A',",
                    "      smi: smi,",
                    "      timestamp: new Date().toISOString()",
                    "    });",
                    "  }",
                    "}",
                    "",
                    "console.log('Extracted', extractedData.length, 'CFD records');",
                    "",
                    "if(extractedData.length > 0){",
                    "  if(window.opener){",
                    "    window.opener.postMessage({type:'ARINC_DATA_EXTRACTED',data:extractedData},'*');",
                    "  }",
                    "  alert('Found ' + extractedData.length + ' CFD records!');",
                    "}else{",
                    "  alert('No CFD records found. Debug: ' + debugInfo.join(' | '));",
                    "}",
                    "})();"
                  ].join('');
                  
                  const bookmarklet = "javascript:" + extractionScript;
                  
                  const bookmarkletDiv = document.createElement('div');
                  bookmarkletDiv.innerHTML = [
                    '<div style="background: #e8f4fd; padding: 15px; border-radius: 4px; margin: 20px 0;">',
                    '<h4>Data Extraction Bookmarklet:</h4>',
                    '<p>1. Go to the ARINC messenger inbox page</p>',
                    '<p>2. Drag this bookmarklet to your bookmarks bar:</p>',
                    '<a href="' + bookmarklet + '" style="background: #28a745; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0;">🔍 Extract CFD Data</a>',
                    '<p>3. Click the bookmarklet on the ARINC page to extract data</p>',
                    '</div>'
                  ].join('');
                  
                  document.body.appendChild(bookmarkletDiv);
                  
                  updateStatus('Bookmarklet created! Follow the instructions above.', 'success');
                }
                
                function downloadData() {
                  if (extractedData.length === 0) {
                    alert('No data to download. Please extract data first.');
                    return;
                  }
                  
                  const csv = [
                    ['Tail', 'Description', 'SMI', 'Timestamp'],
                    ...extractedData.map(function(record) {
                      return [
                        record.tail,
                        record.description,
                        record.smi,
                        record.timestamp
                      ];
                    })
                  ].map(function(row) {
                    return row.map(function(cell) {
                      return '"' + cell + '"';
                    }).join(',');
                  }).join('\\n');
                  
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'arinc-cfd-data-' + new Date().toISOString().split('T')[0] + '.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }
                
                function displayData(data) {
                  const container = document.getElementById('dataContainer');
                  const tbody = document.getElementById('dataBody');
                  
                  tbody.innerHTML = '';
                  data.forEach(function(record) {
                    const row = document.createElement('tr');
                    row.innerHTML = '<td>' + record.tail + '</td><td>' + record.description + '</td><td>' + record.smi + '</td><td>' + record.timestamp + '</td>';
                    tbody.appendChild(row);
                  });
                  
                  container.style.display = 'block';
                }
                
                // Add event listeners to buttons
                document.getElementById('openARINCBtn').addEventListener('click', openARINC);
                document.getElementById('extractDataBtn').addEventListener('click', extractData);
                document.getElementById('downloadDataBtn').addEventListener('click', downloadData);
                
                window.addEventListener('message', function(event) {
                  if (event.data.type === 'ARINC_DATA_EXTRACTED') {
                    extractedData = event.data.data;
                    displayData(extractedData);
                    updateStatus('Successfully extracted ' + extractedData.length + ' CFD records!', 'success');
                  }
                });
                
                updateStatus('Ready to extract data from ARINC messenger', 'info');
              });
            </script>
          </body>
          </html>
        `;

      // Create a blob and open it
      const blob = new Blob([extractionHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 60000);

      toast.success("Opening ARINC data extractor...");
    } catch (error: any) {
      console.error("Data extraction error:", error);
      const errorMessage =
        error?.message || error?.code || "Failed to open data extractor";
      setError(errorMessage);
      toast.error("Failed to open data extractor");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDirectAccess = () => {
    window.open(
      "https://opcenter.arinc.eu/aegean/messenger/?mode=ALL&folder_name=inbox",
      "_blank"
    );
  };

  // Listen for data from the extraction page
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "ARINC_DATA_EXTRACTED") {
        setRecords(event.data.data);
        setExtractionStatus(
          `Successfully extracted ${event.data.data.length} CFD records!`
        );
        toast.success(
          `Extracted ${event.data.data.length} CFD records from ARINC`
        );
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const downloadCSV = () => {
    if (records.length === 0) {
      toast.error("No data to download");
      return;
    }

    const csv = [
      ["Tail", "Description", "SMI", "Timestamp"],
      ...records.map((record) => [
        record.tail,
        record.description,
        record.smi,
        record.timestamp || new Date().toISOString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arinc-cfd-data-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("CSV file downloaded");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Radio className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">ARINC Data Extractor</CardTitle>
          <CardDescription>
            Extract CFD records from ARINC OpCenter messenger inbox
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Extract data from ARINC messenger where SMI = "CFD", showing only
              Tail and Description columns.
            </p>

            <div className="space-y-4">
              <Button
                onClick={handleDataExtraction}
                disabled={isExtracting}
                size="lg"
                className="w-full"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting Data...
                  </>
                ) : (
                  <>
                    <Radio className="mr-2 h-4 w-4" />
                    Extract ARINC Data
                  </>
                )}
              </Button>

              {extractionStatus && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-800 text-sm">{extractionStatus}</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Having trouble with data extraction?
                </p>
                <Button
                  variant="outline"
                  onClick={handleDirectAccess}
                  className="w-full"
                >
                  <Radio className="mr-2 h-4 w-4" />
                  Open ARINC Messenger Directly
                </Button>
              </div>
            </div>
          </div>

          {records.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Extracted CFD Records ({records.length})
                </h3>
                <Button onClick={downloadCSV} size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tail</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>SMI</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">
                          {record.tail}
                        </TableCell>
                        <TableCell>{record.description}</TableCell>
                        <TableCell className="font-mono">
                          {record.smi}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.timestamp
                            ? new Date(record.timestamp).toLocaleString()
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-semibold text-blue-900 mb-2">
              Extraction Instructions
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <strong>1.</strong> Click "Extract ARINC Data" to open the
                extraction tool
              </p>
              <p>
                <strong>2.</strong> Click "Open ARINC Messenger" in the tool
              </p>
              <p>
                <strong>3.</strong> Drag the bookmarklet to your bookmarks bar
              </p>
              <p>
                <strong>4.</strong> Click the bookmarklet on the ARINC page
              </p>
              <p>
                <strong>5.</strong> Data will be automatically extracted and
                displayed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ARINCDataExtractor;
