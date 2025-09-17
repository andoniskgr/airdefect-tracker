import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  auth,
  db,
  checkUserCodeExists,
  getUserByCode,
  updateUserCode as updateUserCodeInDB,
  getUserById,
} from "../utils/firebaseDB";
import { doc, setDoc } from "firebase/firestore";
import { emailService } from "../utils/emailService";

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
};

type AuthContextType = {
  currentUser: User | null;
  userData: UserData | null;
  signup: (email: string, password: string, userCode: string) => Promise<void>;
  login: (emailOrCode: string, password: string) => Promise<void>;
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

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Save user data to Firestore with pending approval status
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      userCode: userCode,
      createdAt: new Date(),
      status: "pending", // pending, approved, rejected
      role: "user", // user, admin
      approvedAt: null,
      approvedBy: null,
    });

    // Send notification to admin about new user signup
    try {
      await emailService.sendAdminSignupNotification({
        email: email,
        userCode: userCode,
        createdAt: new Date(),
        userId: user.uid,
      });
    } catch (error) {
      console.error("Failed to send admin notification:", error);
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
          throw new Error("Invalid user code.");
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
      if (error.code && error.code.startsWith('auth/')) {
        throw new Error("Invalid email or password. Please check your credentials.");
      }
      // Re-throw our custom errors (like "Invalid user code")
      throw error;
    }

    // If we still don't have user data, try to get it by the authenticated user's UID
    if (!userData && auth.currentUser) {
      try {
        userData = await getUserById(auth.currentUser.uid);
      } catch (error) {
        console.error("Error getting user by ID:", error);
      }
    }

    // If we still don't have user data, something went wrong
    if (!userData) {
      await signOut(auth);
      throw new Error("Unable to retrieve user information. Please try again.");
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

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear local state immediately
      setUserData(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state
      setUserData(null);
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
              console.log("User is disabled, signing out");
              await signOut(auth);
              setUserData(null);
              return;
            }
            
            setUserData(userData as UserData);
          } else {
            console.error("No user data found for authenticated user");
            setUserData(null);
          }
        } catch (error) {
          console.error("Failed to load user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    signup,
    login,
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
