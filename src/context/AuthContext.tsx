
import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth, db, checkUserCodeExists, getUserByCode, updateUserCode as updateUserCodeInDB, getUserById } from "../utils/firebaseDB";
import { doc, setDoc } from "firebase/firestore";

type AuthContextType = {
  currentUser: User | null;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email: string, password: string, userCode: string) => {
    // Check if user code already exists
    const codeExists = await checkUserCodeExists(userCode);
    
    if (codeExists) {
      throw new Error('User code already exists. Please choose a different code.');
    }
    
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      userCode: userCode,
      createdAt: new Date(),
    });
  };

  const login = async (emailOrCode: string, password: string) => {
    // Check if input is a user code (4 characters) or email
    const isUserCode = /^[A-Z0-9]{4}$/.test(emailOrCode);
    
    if (isUserCode) {
      // Look up email by user code
      const userData = await getUserByCode(emailOrCode);
      
      if (!userData) {
        throw new Error('Invalid user code.');
      }
      
      const email = userData.email;
      
      // Login with the found email
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      // Login with email directly
      await signInWithEmailAndPassword(auth, emailOrCode, password);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserCode = async (newUserCode: string) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    await updateUserCodeInDB(currentUser.uid, newUserCode, currentUser.email || '');
  };

  const getUserData = async () => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    return await getUserById(currentUser.uid);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    updateUserCode,
    getUserData,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
