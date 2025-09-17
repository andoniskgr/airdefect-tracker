import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, CheckCircle, XCircle } from "lucide-react";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Handle user approval status
  if (userData) {
    if (userData.status === "pending") {
      return (
        <div className="min-h-screen bg-slate-700 text-white p-4 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle className="text-yellow-600">
                Account Pending Approval
              </CardTitle>
              <CardDescription>
                Your account is currently pending approval. You will receive an
                email notification once an administrator reviews and approves
                your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-slate-100 p-4 rounded-lg mb-4">
                <p className="text-sm text-slate-600">
                  <strong>Email:</strong> {userData.email}
                  <br />
                  <strong>User Code:</strong> {userData.userCode}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Please check your email for updates or contact the administrator
                if you have any questions.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (userData.status === "rejected") {
      return (
        <div className="min-h-screen bg-slate-700 text-white p-4 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Account Rejected</CardTitle>
              <CardDescription>
                Your account access has been rejected. Please contact the
                administrator for more information.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-slate-100 p-4 rounded-lg mb-4">
                <p className="text-sm text-slate-600">
                  <strong>Email:</strong> {userData.email}
                  <br />
                  <strong>User Code:</strong> {userData.userCode}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please contact the
                administrator to resolve this issue.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
