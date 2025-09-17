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

    if (isUserCode) {
      // Look up email by user code
      userData = await getUserByCode(emailOrCode);

      if (!userData) {
        throw new Error("Invalid user code.");
      }

      const email = userData.email;

      // Login with the found email
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      // Login with email directly
      await signInWithEmailAndPassword(auth, emailOrCode, password);

      // Get user data by email
      userData = await getUserByEmail(emailOrCode);
    }

    // Check user approval status
    if (userData && userData.status === "rejected") {
      await signOut(auth);
      throw new Error(
        "Your account has been rejected. Please contact the administrator."
      );
    }

    if (userData && userData.status === "pending") {
      await signOut(auth);
      throw new Error(
        "Your account is pending approval. You will receive an email once approved."
      );
    }
  };

  const logout = async () => {
    await signOut(auth);
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
            setUserData(userData as UserData);
          }
        } catch (error) {
          console.error("Failed to load user data:", error);
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
