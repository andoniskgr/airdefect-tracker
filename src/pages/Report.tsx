import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, BarChart3, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const Report = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [manualData, setManualData] = useState<string>("");
  const [autoDownload, setAutoDownload] = useState<boolean>(true);

  // Function to filter data for CFD rows and expand CFD descriptions
  const filterAndExpandCFDData = (data: any[]) => {
    console.log("Filtering data:", data);
    
    if (data.length === 0) {
      console.log("No data to filter");
      return [];
    }

    // Find the SMI column index (look for "SMI" in header or common positions)
    let smiColumnIndex = -1;
    let descriptionColumnIndex = -1;

    // Check header row for column names
    if (data.length > 0) {
      const headerRow = data[0].data;
      console.log("Header row:", headerRow);
      
      smiColumnIndex = headerRow.findIndex((cell: string) => 
        cell.toUpperCase().includes('SMI') || cell.toUpperCase().includes('SM')
      );
      descriptionColumnIndex = headerRow.findIndex((cell: string) => 
        cell.toUpperCase().includes('DESCRIPTION') || cell.toUpperCase().includes('DESC')
      );
    }

    // If not found in header, assume common positions (SMI is often 3rd column, Description 2nd)
    if (smiColumnIndex === -1) {
      smiColumnIndex = 2; // 3rd column (0-indexed)
    }
    if (descriptionColumnIndex === -1) {
      descriptionColumnIndex = 1; // 2nd column (0-indexed)
    }

    console.log("SMI column index:", smiColumnIndex);
    console.log("Description column index:", descriptionColumnIndex);

    // Filter rows where SMI column contains "CFD"
    const filteredData = data.filter((row, index) => {
      // Skip header row
      if (index === 0) return true;
      
      const smiValue = row.data[smiColumnIndex] || '';
      console.log(`Row ${index} SMI value:`, smiValue);
      return smiValue.toUpperCase().includes('CFD');
    });

    console.log("Filtered data:", filteredData);

    // Expand CFD descriptions
    const expandedData = filteredData.map((row, index) => {
      if (index === 0) return row; // Keep header as is
      
      const newRow = { ...row };
      const description = newRow.data[descriptionColumnIndex] || '';
      
      // Expand CFD to full description
      if (description.toUpperCase().includes('CFD')) {
        newRow.data[descriptionColumnIndex] = description.replace(/CFD/gi, 'CFD - Central Fault Display');
      }
      
      return newRow;
    });

    console.log("Expanded data:", expandedData);
    return expandedData;
  };

  const handleARINCLogin = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Create a new window for ARINC login
      const loginWindow = window.open(
        "https://opcenter.arinc.eu/aegean/authentication/login",
        "_blank",
        "width=800,height=600,scrollbars=yes,resizable=yes"
      );

      if (!loginWindow) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      // Wait a moment for the window to load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create a script to auto-fill the login form
      const autoFillScript = `
        (function() {
          console.log('Attempting to auto-fill ARINC login form...');
          
          // Wait for the page to load
          setTimeout(() => {
            // Try different selectors for username and password fields
            const usernameSelectors = [
              'input[name="username"]',
              'input[name="user"]',
              'input[name="login"]',
              'input[type="text"]',
              'input[placeholder*="username" i]',
              'input[placeholder*="user" i]'
            ];
            
            const passwordSelectors = [
              'input[name="password"]',
              'input[name="pass"]',
              'input[type="password"]',
              'input[placeholder*="password" i]'
            ];
            
            let usernameField = null;
            let passwordField = null;
            
            // Find username field
            for (const selector of usernameSelectors) {
              usernameField = document.querySelector(selector);
              if (usernameField) break;
            }
            
            // Find password field
            for (const selector of passwordSelectors) {
              passwordField = document.querySelector(selector);
              if (passwordField) break;
            }
            
            if (usernameField && passwordField) {
              console.log('Found login fields, auto-filling...');
              usernameField.value = 'MAINTROLL';
              passwordField.value = 'maintroll123';
              
              // Trigger change events
              usernameField.dispatchEvent(new Event('input', { bubbles: true }));
              passwordField.dispatchEvent(new Event('input', { bubbles: true }));
              
              // Try to find and click submit button
              const submitSelectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:contains("Login")',
                'button:contains("Sign In")',
                'button:contains("Submit")'
              ];
              
              for (const selector of submitSelectors) {
                const submitBtn = document.querySelector(selector);
                if (submitBtn) {
                  console.log('Found submit button, clicking...');
                  submitBtn.click();
                  break;
                }
              }
              
              console.log('Auto-fill completed');
            } else {
              console.log('Could not find login fields, manual entry required');
            }
          }, 1000);
        })();
      `;

      // Try to inject the auto-fill script
      try {
        loginWindow.postMessage(
          {
            type: "AUTO_FILL_LOGIN",
            script: autoFillScript,
          },
          "https://opcenter.arinc.eu"
        );
      } catch (e) {
        console.log("Could not inject auto-fill script, user will need to fill manually");
      }

      toast.success("ARINC login window opened. Auto-fill attempted - please complete login if needed.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to open ARINC login");
      toast.error("Failed to open ARINC login");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataExtraction = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Create a new window for ARINC messenger
      const messengerWindow = window.open(
        "https://opcenter.arinc.eu/aegean/messenger/?mode=ALL&folder_name=inbox",
        "_blank",
        "width=1200,height=800,scrollbars=yes,resizable=yes"
      );

      if (!messengerWindow) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      // Wait for the window to load
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Create a comprehensive data extraction script
      const extractionScript = `
        (function() {
          console.log('Starting ARINC data extraction...');
          
          // Function to extract all table data from the page
          function extractAllTableData() {
            const allData = [];
            const tables = document.querySelectorAll('table');
            
            console.log('Found', tables.length, 'tables on the page');
            
            tables.forEach((table, tableIndex) => {
              const rows = table.querySelectorAll('tr');
              console.log('Table', tableIndex, 'has', rows.length, 'rows');
              
              rows.forEach((row, rowIndex) => {
                const cells = row.querySelectorAll('td, th');
                if (cells.length > 0) {
                  const rowData = Array.from(cells).map(cell => {
                    // Get text content and clean it up
                    let text = cell.textContent || cell.innerText || '';
                    text = text.trim().replace(/\\s+/g, ' ');
                    return text;
                  });
                  
                  // Only add rows that have meaningful data
                  if (rowData.some(cell => cell.length > 0)) {
                    allData.push({
                      table: tableIndex,
                      row: rowIndex,
                      data: rowData
                    });
                  }
                }
              });
            });
            
            return allData;
          }
          
          // Function to extract data from specific elements (divs, spans, etc.)
          function extractElementData() {
            const allData = [];
            const dataElements = document.querySelectorAll('div[class*="row"], div[class*="item"], div[class*="message"], tr, .data-row, .message-row');
            
            console.log('Found', dataElements.length, 'potential data elements');
            
            dataElements.forEach((element, index) => {
              const text = element.textContent || element.innerText || '';
              if (text.trim().length > 10) { // Only elements with substantial content
                // Try to split by common delimiters
                const parts = text.split(/\\s{2,}|\\t|\\|/).map(part => part.trim()).filter(part => part.length > 0);
                if (parts.length >= 2) {
                  allData.push({
                    table: 0,
                    row: index,
                    data: parts
                  });
                }
              }
            });
            
            return allData;
          }
          
          // Extract data using multiple methods
          const tableData = extractAllTableData();
          const elementData = extractElementData();
          
          // Combine all data
          const allExtractedData = [...tableData, ...elementData];
          
          console.log('Total extracted data:', allExtractedData.length, 'rows');
          console.log('Sample data:', allExtractedData.slice(0, 3));
          
          // Send data back to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'ARINC_DATA_EXTRACTED',
              data: allExtractedData,
              success: true
            }, '*');
          }
          
          // Also try to download directly
          if (allExtractedData.length > 0) {
            // Convert to CSV
            const csvRows = [];
            allExtractedData.forEach(item => {
              const csvRow = item.data.map(cell => '"' + cell.replace(/"/g, '""') + '"').join(',');
              csvRows.push(csvRow);
            });
            
            const csvData = csvRows.join('\\n');
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'arinc_raw_data_' + new Date().toISOString().slice(0, 10) + '.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            console.log('Raw data downloaded as CSV');
          }
        })();
      `;

      // Inject the extraction script
      try {
        messengerWindow.postMessage(
          {
            type: "EXTRACT_DATA",
            script: extractionScript,
          },
          "https://opcenter.arinc.eu"
        );
      } catch (e) {
        console.log("Could not inject extraction script due to CORS restrictions");
      }

      // Listen for the extracted data
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== "https://opcenter.arinc.eu") return;
        
        if (event.data.type === "ARINC_DATA_EXTRACTED" && event.data.success) {
          const rawData = event.data.data;
          console.log("Received extracted data:", rawData);
          
          // Apply CFD filtering and expansion
          const filteredData = filterAndExpandCFDData(rawData);
          setExtractedData(filteredData);
          
          // Auto-download the CSV if enabled
          if (autoDownload) {
            setTimeout(() => {
              downloadCSV(filteredData);
            }, 500);
            toast.success(`Real data extracted and filtered (${filteredData.length} CFD rows). CSV download started automatically.`);
          } else {
            toast.success(`Real data extracted and filtered (${filteredData.length} CFD rows). Click download button to save CSV.`);
          }
          
          setIsProcessing(false);
          window.removeEventListener("message", handleMessage);
        }
      };

      window.addEventListener("message", handleMessage);

      // Fallback: If no data is received after 10 seconds, show manual input option
      setTimeout(() => {
        if (extractedData.length === 0) {
          toast.info("Automatic extraction may not work due to CORS restrictions. Please use the manual data input below.");
          setIsProcessing(false);
        }
      }, 10000);

      toast.success("ARINC messenger opened. Data extraction script injected. Please wait for results...");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to extract data");
      toast.error("Failed to extract data");
      setIsProcessing(false);
    }
  };

  const handleManualDataSubmit = () => {
    if (!manualData.trim()) {
      toast.error("Please enter some data");
      return;
    }

    try {
      // Parse the manual data (assuming tab-separated or comma-separated)
      const lines = manualData.trim().split('\n');
      const parsedData = lines.map((line, index) => ({
        table: 0,
        row: index,
        data: line.split(/\t|,|\s{2,}/).map(cell => cell.trim())
      }));

      // Filter and process the data
      const filteredData = filterAndExpandCFDData(parsedData);
      setExtractedData(filteredData);
      
      // Auto-download the CSV if enabled
      if (autoDownload) {
        setTimeout(() => {
          downloadCSV(filteredData);
        }, 500);
        toast.success(`Successfully parsed and filtered ${filteredData.length} CFD rows of data. CSV download started automatically.`);
      } else {
        toast.success(`Successfully parsed and filtered ${filteredData.length} CFD rows of data. Click download button to save CSV.`);
      }
    } catch (error) {
      toast.error("Failed to parse data. Please check the format.");
    }
  };

  const downloadCSV = (dataToDownload?: any[]) => {
    const data = dataToDownload || extractedData;
    
    console.log("Download CSV called with data:", data);
    console.log("Data length:", data.length);
    
    if (data.length === 0) {
      toast.error("No data to download");
      console.error("No data available for download");
      return;
    }

    // Convert extracted data to CSV
    const allColumns = new Set();
    data.forEach((item) => {
      item.data.forEach((_, index) => {
        allColumns.add("Column_" + (index + 1));
      });
    });

    const columns = Array.from(allColumns);
    const csvRows = [];

    // Add header row
    csvRows.push(columns.join(","));

    // Add data rows
    data.forEach((item) => {
      const row = columns.map((_, index) => {
        const value = item.data[index] || "";
        return '"' + value.replace(/"/g, '""') + '"';
      });
      csvRows.push(row.join(","));
    });

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arinc_data_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("CSV file downloaded successfully");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BarChart3 className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">ARINC CFD Data Report</CardTitle>
          <CardDescription>
            Access ARINC OpCenter and extract CFD (Central Fault Display) data for reporting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

            <div className="text-center">
              <p className="text-muted-foreground mb-6">
                This tool will help you access ARINC OpCenter and extract data for reporting.
                Click the buttons below to start the process.
              </p>

              {/* Auto-download toggle */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <input
                  type="checkbox"
                  id="autoDownload"
                  checked={autoDownload}
                  onChange={(e) => setAutoDownload(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoDownload" className="text-sm text-muted-foreground">
                  Auto-download CSV after data extraction
                </label>
              </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleARINCLogin}
                  disabled={isProcessing}
                  size="lg"
                  className="flex-1 sm:flex-none"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Step 1: Login to ARINC
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleDataExtraction}
                  disabled={isProcessing}
                  size="lg"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Step 2: Extract Data
                    </>
                  )}
                </Button>
              </div>

              {extractedData.length > 0 && (
                <div className="mt-6">
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                    Successfully loaded {extractedData.length} rows of data
                  </div>
                  
                  <Button
                    onClick={downloadCSV}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV ({extractedData.length} rows)
                  </Button>
                </div>
              )}

              {/* Browser Extension Instructions */}
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Browser Extension Method (Recommended)</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 mb-3">
                    <strong>For reliable data extraction, use a browser extension:</strong>
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                    <li>Install a web scraping extension like "Web Scraper" or "Data Miner"</li>
                    <li>Go to ARINC messenger page manually</li>
                    <li>Use the extension to extract table data</li>
                    <li>Copy the extracted data and paste it in the manual input below</li>
                  </ol>
                </div>
              </div>

              {/* Manual Data Input Section */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Manual Data Input</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Copy data from ARINC and paste it here (one row per line, columns separated by tabs or commas):
                </p>
                
                <div className="bg-gray-50 border rounded p-3 mb-4">
                  <p className="text-xs text-gray-600 mb-2">Example format:</p>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
{`Tail	Description	SMI	Timestamp
SX-ABC	CFD Message	CFD	2024-01-15 10:30:00
SX-DEF	Maintenance Alert	CFD	2024-01-15 11:15:00`}
                  </pre>
                </div>
                
                <div className="space-y-4">
                  <textarea
                    value={manualData}
                    onChange={(e) => setManualData(e.target.value)}
                    placeholder="Paste your data here (tab-separated or comma-separated)..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none"
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleManualDataSubmit}
                      disabled={!manualData.trim()}
                      className="flex-1"
                    >
                      Parse Data
                    </Button>
                    <Button
                      onClick={() => {
                        const testData = [
                          { table: 0, row: 0, data: ["Tail", "Description", "SMI", "Timestamp"] },
                          { table: 0, row: 1, data: ["SX-TEST", "CFD Test Message", "CFD", "2024-01-15 16:00:00"] }
                        ];
                        const filtered = filterAndExpandCFDData(testData);
                        setExtractedData(filtered);
                        if (autoDownload) {
                          setTimeout(() => downloadCSV(filtered), 100);
                        }
                        toast.success("Test data loaded. Download should start automatically if enabled.");
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Test Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Click "Step 1: Login to ARINC" to open the ARINC login page</li>
              <li>Complete the login process with your credentials</li>
              <li>Click "Step 2: Extract Data" to open the ARINC messenger and attempt automatic extraction</li>
              <li><strong>If automatic extraction fails:</strong> Use a browser extension or manually copy data</li>
              <li>Paste the copied data in the "Manual Data Input" section below</li>
              <li>Click "Parse Data" to process the manually entered data</li>
              <li><strong>Note:</strong> Only rows with SMI = "CFD" will be included in the CSV</li>
              <li>CFD descriptions will be automatically expanded to "CFD - Central Fault Display"</li>
              <li>Download the filtered CSV file using the download button</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Report;
