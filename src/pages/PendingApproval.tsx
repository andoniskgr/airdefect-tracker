import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Mail, CheckCircle, ArrowLeft } from "lucide-react";

const PendingApproval = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Account Pending Approval
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your account has been created successfully and is now waiting for administrator approval.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900">
                    Email Notification Sent
                  </p>
                  <p className="text-sm text-blue-700">
                    The administrator has been notified about your signup request.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-green-900">
                    What happens next?
                  </p>
                  <p className="text-sm text-green-700">
                    You will receive an email notification once your account is approved or if additional information is needed.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                <strong>Please check your email regularly</strong> for updates on your account status.
              </p>
              <p className="text-xs text-gray-500">
                If you don't receive an email within 24 hours, please contact the administrator.
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PendingApproval;
