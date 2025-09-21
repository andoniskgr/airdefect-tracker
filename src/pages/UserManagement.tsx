import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  UserCheck,
  UserX,
  UserMinus,
  Trash2,
  Shield,
  ShieldOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../utils/firebaseDB";
import { emailService } from "../utils/emailService";
import {
  deleteUserFromAuth,
  disableUser,
  enableUser,
} from "../utils/adminAuth";
import {
  deleteUserFallback,
  disableUserFallback,
  enableUserFallback,
} from "../utils/adminAuthFallback";

interface User {
  id: string;
  email: string;
  userCode: string;
  status: "pending" | "approved" | "rejected";
  role: "user" | "admin";
  createdAt: any;
  approvedAt: any;
  approvedBy: string | null;
  disabled?: boolean;
  disabledAt?: any;
  disabledBy?: string | null;
}

const UserManagement = () => {
  const { userData } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [isEnableDialogOpen, setIsEnableDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [disableReason, setDisableReason] = useState("");

  // Check if current user is admin
  const isAdmin = userData?.role === "admin";

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, "users");
      const usersQuery = query(usersCollection, orderBy("createdAt", "desc"));
      const usersSnapshot = await getDocs(usersQuery);

      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (user: User) => {
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        status: "approved",
        approvedAt: new Date(),
        approvedBy: userData?.email || "admin",
      });

      // Send approval email to user
      await emailService.sendUserApprovalNotification(
        user.email,
        user.userCode
      );

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === user.id
            ? {
                ...u,
                status: "approved",
                approvedAt: new Date(),
                approvedBy: userData?.email || "admin",
              }
            : u
        )
      );

      toast.success(`User ${user.userCode} has been approved`);
      setIsApproveDialogOpen(false);
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user");
    }
  };

  const handleRejectUser = async (user: User) => {
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        status: "rejected",
        approvedAt: new Date(),
        approvedBy: userData?.email || "admin",
      });

      // Send rejection email to user
      await emailService.sendUserRejectionNotification(
        user.email,
        user.userCode,
        rejectionReason
      );

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === user.id
            ? {
                ...u,
                status: "rejected",
                approvedAt: new Date(),
                approvedBy: userData?.email || "admin",
              }
            : u
        )
      );

      toast.success(`User ${user.userCode} has been rejected`);
      setIsRejectDialogOpen(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Failed to reject user");
    }
  };

  const handleDisableUser = async (user: User) => {
    try {
      // Try Firebase Functions first
      let disableResult = await disableUser(user.id, disableReason);

      // If Firebase Functions fail, try fallback method
      if (
        !disableResult.success &&
        (disableResult.error?.includes(
          "Firebase Functions are not available"
        ) ||
          disableResult.error?.includes("Internal server error") ||
          disableResult.error?.includes("functions/unavailable") ||
          disableResult.error?.includes("functions/internal"))
      ) {
        console.log("Firebase Functions not available, using fallback method");
        disableResult = await disableUserFallback(user.id, disableReason);
      }

      if (!disableResult.success) {
        toast.error(`Failed to disable user: ${disableResult.error}`);
        return;
      }

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === user.id
            ? {
                ...u,
                disabled: true,
                disabledAt: new Date(),
                disabledBy: userData?.email || "admin",
                disableReason: disableReason || null,
              }
            : u
        )
      );

      toast.success(
        `User ${user.userCode} has been disabled and will be signed out immediately`
      );
      setIsDisableDialogOpen(false);
      setDisableReason("");
    } catch (error) {
      console.error("Error disabling user:", error);
      toast.error("Failed to disable user");
    }
  };

  const handleEnableUser = async (user: User) => {
    try {
      // Try Firebase Functions first
      let enableResult = await enableUser(user.id);

      // If Firebase Functions fail, try fallback method
      if (
        !enableResult.success &&
        (enableResult.error?.includes("Firebase Functions are not available") ||
          enableResult.error?.includes("Internal server error") ||
          enableResult.error?.includes("functions/unavailable") ||
          enableResult.error?.includes("functions/internal"))
      ) {
        console.log("Firebase Functions not available, using fallback method");
        enableResult = await enableUserFallback(user.id);
      }

      if (!enableResult.success) {
        toast.error(`Failed to enable user: ${enableResult.error}`);
        return;
      }

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === user.id
            ? {
                ...u,
                disabled: false,
                disabledAt: null,
                disabledBy: null,
                disableReason: null,
              }
            : u
        )
      );

      toast.success(`User ${user.userCode} has been enabled`);
      setIsEnableDialogOpen(false);
    } catch (error) {
      console.error("Error enabling user:", error);
      toast.error("Failed to enable user");
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      // Prevent deleting the current admin user
      if (user.id === userData?.id) {
        toast.error("You cannot delete your own account");
        return;
      }

      // Try Firebase Functions first
      let authResult = await deleteUserFromAuth(user.id);

      // If Firebase Functions fail, try fallback method
      if (
        !authResult.success &&
        (authResult.error?.includes("Firebase Functions are not available") ||
          authResult.error?.includes("Internal server error") ||
          authResult.error?.includes("functions/unavailable") ||
          authResult.error?.includes("functions/internal"))
      ) {
        console.log("Firebase Functions not available, using fallback method");
        authResult = await deleteUserFallback(user.id);
      }

      if (!authResult.success) {
        toast.error(`Failed to delete user: ${authResult.error}`);
        return;
      }

      // Update local state
      setUsers(users.filter((u) => u.id !== user.id));

      toast.success(`User ${user.userCode} has been deleted successfully`);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const getStatusBadge = (status: string, disabled?: boolean) => {
    if (disabled) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          <ShieldOff className="w-3 h-3 mr-1" />
          Disabled
        </Badge>
      );
    }

    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <UserCheck className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <UserX className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge variant="outline" className="border-purple-200 text-purple-800">
        Admin
      </Badge>
    ) : (
      <Badge variant="outline" className="border-blue-200 text-blue-800">
        User
      </Badge>
    );
  };

  const pendingUsers = users.filter((user) => user.status === "pending");
  const approvedUsers = users.filter((user) => user.status === "approved");
  const rejectedUsers = users.filter((user) => user.status === "rejected");

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-700 text-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access this page. Admin access
              required.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-700 text-white p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Button
            onClick={fetchUsers}
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-slate-700"
          >
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {users.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {pendingUsers.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {approvedUsers.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {rejectedUsers.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-slate-800 border-slate-600">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              All Users
            </CardTitle>
            <CardDescription>
              Manage user accounts and approval status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-white">Loading users...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-600">
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">
                        User Code
                      </TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Role</TableHead>
                      <TableHead className="text-slate-300">Created</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-slate-600">
                        <TableCell className="text-white">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-white font-mono">
                          {user.userCode}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.status, user.disabled)}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="text-slate-300">
                          {user.createdAt?.toDate?.()?.toLocaleDateString() ||
                            "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {/* Pending user actions */}
                            {user.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsApproveDialogOpen(true);
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsRejectDialogOpen(true);
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}

                            {/* Disable/Enable actions for approved users */}
                            {user.status === "approved" &&
                              user.id !== userData?.id && (
                                <>
                                  {user.disabled ? (
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setIsEnableDialogOpen(true);
                                      }}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <Shield className="w-4 h-4 mr-1" />
                                      Enable
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setIsDisableDialogOpen(true);
                                      }}
                                      className="bg-orange-600 hover:bg-orange-700 text-white"
                                    >
                                      <ShieldOff className="w-4 h-4 mr-1" />
                                      Disable
                                    </Button>
                                  )}
                                </>
                              )}

                            {/* Delete action for all users except current admin */}
                            {user.id !== userData?.id && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approve User Dialog */}
        <AlertDialog
          open={isApproveDialogOpen}
          onOpenChange={setIsApproveDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve this user? They will receive an
                email notification and gain access to the application.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {selectedUser && (
              <div className="bg-slate-100 p-4 rounded-lg">
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>User Code:</strong> {selectedUser.userCode}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {selectedUser.createdAt?.toDate?.()?.toLocaleDateString()}
                </p>
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedUser && handleApproveUser(selectedUser)}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reject User Dialog */}
        <AlertDialog
          open={isRejectDialogOpen}
          onOpenChange={setIsRejectDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject this user? They will receive an
                email notification explaining the rejection.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="bg-slate-100 p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p>
                    <strong>User Code:</strong> {selectedUser.userCode}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {selectedUser.createdAt?.toDate?.()?.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label htmlFor="rejection-reason">
                    Rejection Reason (Optional)
                  </Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedUser && handleRejectUser(selectedUser)}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Disable User Dialog */}
        <AlertDialog
          open={isDisableDialogOpen}
          onOpenChange={setIsDisableDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disable User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to disable this user? They will lose
                access to the application but their account will be preserved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="bg-slate-100 p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p>
                    <strong>User Code:</strong> {selectedUser.userCode}
                  </p>
                  <p>
                    <strong>Role:</strong> {selectedUser.role}
                  </p>
                </div>
                <div>
                  <Label htmlFor="disable-reason">
                    Reason for Disabling (Optional)
                  </Label>
                  <Textarea
                    id="disable-reason"
                    value={disableReason}
                    onChange={(e) => setDisableReason(e.target.value)}
                    placeholder="Enter reason for disabling..."
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedUser && handleDisableUser(selectedUser)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Disable User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Enable User Dialog */}
        <AlertDialog
          open={isEnableDialogOpen}
          onOpenChange={setIsEnableDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Enable User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to enable this user? They will regain
                access to the application.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {selectedUser && (
              <div className="bg-slate-100 p-4 rounded-lg">
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>User Code:</strong> {selectedUser.userCode}
                </p>
                <p>
                  <strong>Role:</strong> {selectedUser.role}
                </p>
                {selectedUser.disabledAt && (
                  <p>
                    <strong>Disabled Since:</strong>{" "}
                    {selectedUser.disabledAt?.toDate?.()?.toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedUser && handleEnableUser(selectedUser)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Enable User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete User Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete this user? This
                action cannot be undone and will remove all user data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {selectedUser && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-red-800">
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p className="text-red-800">
                  <strong>User Code:</strong> {selectedUser.userCode}
                </p>
                <p className="text-red-800">
                  <strong>Role:</strong> {selectedUser.role}
                </p>
                <p className="text-red-600 text-sm mt-2">
                  ⚠️ This action is permanent and cannot be undone!
                </p>
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedUser && handleDeleteUser(selectedUser)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default UserManagement;
