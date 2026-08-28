import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
} from "firebase/auth";
import {
  auth,
  db,
  checkUserCodeExists,
  getUserByCode,
  updateUserCode as updateUserCodeInDB,
  getUserById,
  getUserByEmail,
} from "../utils/firebaseDB";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { emailService } from "../utils/emailService";
import { endAppSession } from "../utils/appStorage";
import { reclaimOrphanedAuthUser } from "../utils/adminAuth";

type UserData = {
  id: string;
  email: string;
  userCode: string;
  status: "pending" | "approved" | "rejected";
  role: "user" | "admin";
  createdAt: Date;
  approvedAt: Date | null;
  approvedBy: string | null;
  disabled?: boolean;
  disabledAt?: Date | null;
  disabledBy?: string | null;
  roleChangedAt?: Date | null;
  roleChangedBy?: string | null;
};

type AuthContextType = {
  currentUser: User | null;
  userData: UserData | null;
  signup: (email: string, password: string, userCode: string) => Promise<void>;
  login: (emailOrCode: string, password: string) => Promise<void>;
  resetPassword: (emailOrCode: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserCode: (newUserCode: string) => Promise<void>;
  getUserData: () => Promise<any>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email: string, password: string, userCode: string) => {
    // Check if user code already exists
    const codeExists = await checkUserCodeExists(userCode);

    if (codeExists) {
      throw new Error(
        "User code already exists. Please choose a different code."
      );
    }

    let user: any;
    let firestoreAlreadyCreated = false;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      user = userCredential.user;
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        const existingUserData = await getUserByEmail(email);
        if (existingUserData) {
          throw new Error(
            "This email is already registered. Please use the login page instead."
          );
        }

        // Auth user exists without a Firestore profile (left behind after delete).
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          user = userCredential.user;
        } catch {
          const reclaimed = await reclaimOrphanedAuthUser(
            email,
            password,
            userCode
          );

          if (!reclaimed.success) {
            throw new Error(
              "This email still has a previous login. Use the original password, or reset it from the login page and then sign up again with the new password."
            );
          }

          firestoreAlreadyCreated = true;
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          user = userCredential.user;
        }
      } else if (error.code && error.code.startsWith("auth/")) {
        throw new Error(
          "Authentication error. Please check your email format and try again."
        );
      } else {
        throw error;
      }
    }

    if (!firestoreAlreadyCreated) {
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        userCode: userCode,
        createdAt: new Date(),
        status: "pending",
        role: "user",
        approvedAt: null,
        approvedBy: null,
      });
    }

    // Send notification to admin about new user signup
    try {
      await emailService.sendAdminSignupNotification({
        email: email,
        userCode: userCode,
        createdAt: new Date(),
        userId: user.uid,
      });
    } catch (error) {
      // Don't throw error here as user creation was successful
    }
  };

  const login = async (emailOrCode: string, password: string) => {
    // Check if input is a user code (4 characters) or email
    const isUserCode = /^[A-Z0-9]{4}$/.test(emailOrCode);

    let userData: any = null;
    let email: string;

    try {
      if (isUserCode) {
        // Look up email by user code
        userData = await getUserByCode(emailOrCode);

        if (!userData) {
          throw new Error("User not registered. Signup to create account.");
        }

        email = userData.email;

        // Login with the found email
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        email = emailOrCode;

        // Login with email directly
        await signInWithEmailAndPassword(auth, email, password);

        // Get user data by email
        userData = await getUserByEmail(email);
      }
    } catch (error: any) {
      // If it's a Firebase Auth error, handle it
      if (error.code && error.code.startsWith("auth/")) {
        throw new Error(
          "Invalid email or password. Please check your credentials."
        );
      }
      // Re-throw our custom errors (like "Invalid user code")
      throw error;
    }

    // If we still don't have user data, try to get it by the authenticated user's UID
    if (!userData && auth.currentUser) {
      try {
        userData = await getUserById(auth.currentUser.uid);
      } catch (error) {}
    }

    // If we still don't have user data, the user is not registered in our system
    if (!userData) {
      await signOut(auth);
      throw new Error("User not registered. Signup to create account.");
    }

    // Check user approval status
    if (userData.status === "rejected") {
      await signOut(auth);
      throw new Error(
        "Your account has been rejected. Please contact the administrator."
      );
    }

    if (userData.status === "pending") {
      await signOut(auth);
      throw new Error(
        "Your account is pending approval. You will receive an email once approved."
      );
    }

    // Check if user is disabled
    if (userData.disabled === true) {
      await signOut(auth);
      throw new Error(
        "Your account has been disabled. Please contact the administrator for assistance."
      );
    }
  };

  const resetPassword = async (emailOrCode: string) => {
    const trimmed = emailOrCode.trim();
    const isUserCode = /^[A-Z0-9]{4}$/i.test(trimmed) && !trimmed.includes("@");

    let email = trimmed;

    if (isUserCode) {
      try {
        const matchedUser = await getUserByCode(trimmed.toUpperCase());
        if (
          !matchedUser?.email ||
          matchedUser.disabled === true ||
          matchedUser.status === "rejected"
        ) {
          return;
        }
        email = String(matchedUser.email).trim();
      } catch {
        return;
      }
    }

    const isIgnorable = (error: any) =>
      error?.code === "auth/user-not-found" ||
      error?.code === "auth/invalid-email";

    const isContinueUriError = (error: any) =>
      error?.code === "auth/unauthorized-continue-uri" ||
      error?.code === "auth/invalid-continue-uri" ||
      error?.code === "auth/unauthorized-domain";

    try {
      try {
        await sendPasswordResetEmail(auth, email, {
          url: `${window.location.origin}/login?reset=success`,
        });
      } catch (error: any) {
        if (isIgnorable(error)) {
          return;
        }
        if (!isContinueUriError(error)) {
          throw error;
        }
        // Local hosts such as 127.0.0.1 are often not in Firebase authorized
        // domains. Send the reset email without a continue URL instead.
        await sendPasswordResetEmail(auth, email);
      }
    } catch (error: any) {
      if (isIgnorable(error)) {
        return;
      }
      if (error.code === "auth/too-many-requests") {
        throw new Error("Too many reset attempts. Please try again later.");
      }
      throw new Error("Unable to send reset email. Please try again.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      setUserData(null);
    } finally {
      endAppSession();
    }
  };

  const updateUserCode = async (newUserCode: string) => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    await updateUserCodeInDB(
      currentUser.uid,
      newUserCode,
      currentUser.email || ""
    );

    // Update the local userData state to reflect the change immediately
    if (userData) {
      setUserData({
        ...userData,
        userCode: newUserCode,
      });
    }
  };

  const getUserData = async () => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    return await getUserById(currentUser.uid);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Load user data from Firestore
        try {
          const userData = await getUserById(user.uid);

          if (userData) {
            // Check if user is disabled and sign them out if so
            if (userData.disabled === true) {
              await signOut(auth);
              setUserData(null);
              return;
            }

            setUserData(userData as UserData);
          } else {
            setUserData(null);
          }
        } catch (error) {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Real-time listener to detect when current user is disabled
  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();

          // If user becomes disabled while logged in, sign them out immediately
          if (userData.disabled === true) {
            try {
              await signOut(auth);
              setUserData(null);
              // Show a toast notification to inform the user
              if (
                typeof window !== "undefined" &&
                window.location.pathname !== "/login"
              ) {
                // Import toast dynamically to avoid circular dependencies
                import("sonner").then(({ toast }) => {
                  toast.error(
                    "Your account has been disabled. You have been signed out."
                  );
                });
              }
            } catch (error) {}
          }
        }
      },
      (error) => {}
    );

    return unsubscribe;
  }, [currentUser]);

  const value = {
    currentUser,
    userData,
    signup,
    login,
    resetPassword,
    logout,
    updateUserCode,
    getUserData,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
