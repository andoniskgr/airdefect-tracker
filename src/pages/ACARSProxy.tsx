import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Radio, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const ACARSProxy = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleACARSAuthentication = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);

      console.log("Attempting ACARS authentication...");

      // Simulate authentication delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate credentials locally (in production, this would be done server-side)
      const username = "MAINTROLL";
      const password = "maintroll123";

      if (username === "MAINTROLL" && password === "maintroll123") {
        // Create a helper page with auto-fill instructions
        const autoLoginHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>ACARS Auto-Login Helper</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px; 
                background: #f5f5f5;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                padding: 30px; 
                border-radius: 8px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .credentials { 
                background: #e8f4fd; 
                padding: 20px; 
                border-radius: 4px; 
                margin: 20px 0; 
                font-family: monospace;
                font-size: 16px;
              }
              .button { 
                background: #007bff; 
                color: white; 
                padding: 12px 24px; 
                border: none; 
                border-radius: 4px; 
                cursor: pointer; 
                font-size: 16px;
                margin: 10px;
                text-decoration: none;
                display: inline-block;
              }
              .button:hover { background: #0056b3; }
              .instructions {
                text-align: left;
                background: #fff3cd;
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
                border-left: 4px solid #ffc107;
              }
              .bookmarklet {
                background: #d4edda;
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
                font-family: monospace;
                word-break: break-all;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>ACARS Auto-Login Helper</h2>
              
              <div class="credentials">
                <strong>Login Credentials:</strong><br>
                Username: MAINTROLL<br>
                Password: maintroll123
              </div>
              
              <div class="instructions">
                <h3>Option 1: Quick Access</h3>
                <p>Click the button below to open ARINC OpCenter, then use the auto-fill bookmarklet:</p>
                <a href="https://opcenter.arinc.eu/aegean/authentication/login" target="_blank" class="button">Open ARINC OpCenter</a>
              </div>
              
              <div class="bookmarklet">
                <h4>Auto-Fill Bookmarklet (Drag to Bookmarks):</h4>
                <a href="javascript:(function(){var u=document.querySelector('input[name=username],input[type=text]');var p=document.querySelector('input[name=password],input[type=password]');if(u&&p){u.value='MAINTROLL';p.value='maintroll123';u.dispatchEvent(new Event('input',{bubbles:true}));p.dispatchEvent(new Event('input',{bubbles:true}));alert('Credentials filled! Click Login.');}else{alert('Login form not found. Please try again.');}})();">🔐 Auto-Fill ACARS Login</a>
              </div>
              
              <div class="instructions">
                <h3>Option 2: Manual Steps</h3>
                <ol>
                  <li>Click "Open ARINC OpCenter" above</li>
                  <li>Drag the bookmarklet to your bookmarks bar</li>
                  <li>Click the bookmarklet on the ARINC login page</li>
                  <li>Click the Login button</li>
                </ol>
              </div>
              
              <div class="instructions">
                <h3>Option 3: Copy & Paste</h3>
                <p>If the bookmarklet doesn't work, manually copy and paste:</p>
                <p><strong>Username:</strong> MAINTROLL</p>
                <p><strong>Password:</strong> maintroll123</p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Create a blob and open it
        const blob = new Blob([autoLoginHTML], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");

        // Clean up the URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 30000);

        toast.success("Opening ACARS helper page...");
        setError(null);
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error: any) {
      console.error("ACARS authentication error:", error);
      const errorMessage =
        error?.message || error?.code || "Failed to authenticate with ACARS";
      setError(errorMessage);
      toast.error("Failed to authenticate with ACARS");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDirectAccess = () => {
    // Fallback to direct access if proxy fails
    window.open(
      "https://opcenter.arinc.eu/aegean/authentication/login",
      "_blank"
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Radio className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">ACARS Access</CardTitle>
          <CardDescription>
            Access ARINC OpCenter with auto-fill helper tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Click the button below to open a helper page with auto-fill tools
              for ARINC OpCenter login.
            </p>

            <div className="space-y-4">
              <Button
                onClick={handleACARSAuthentication}
                disabled={isAuthenticating}
                size="lg"
                className="w-full"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Radio className="mr-2 h-4 w-4" />
                    Access ACARS
                  </>
                )}
              </Button>

              {error && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Login Credentials
                  </h4>
                  <div className="text-blue-800 text-sm space-y-1">
                    <p>
                      <strong>Username:</strong> MAINTROLL
                    </p>
                    <p>
                      <strong>Password:</strong> maintroll123
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Use these credentials to login to ARINC OpCenter
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Having trouble with automatic authentication?
                </p>
                <Button
                  variant="outline"
                  onClick={handleDirectAccess}
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Access Directly
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-semibold text-blue-900 mb-2">
              System Information
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <strong>System:</strong> ARINC OpCenter
              </p>
              <p>
                <strong>Version:</strong> 12
              </p>
              <p>
                <strong>Access:</strong> Aegan Airlines
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ACARSProxy;
