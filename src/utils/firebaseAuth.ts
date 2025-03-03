
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { initializeApp } from "firebase/app";

// We're reusing the Firebase config from firebaseDB
const firebaseConfig = {
  apiKey: "AIzaSyDuInHrF3Ky0q1iXuXGhA9qi1T707QB1UU",
  authDomain: "mcc-tracker.firebaseapp.com",
  projectId: "mcc-tracker",
  storageBucket: "mcc-tracker.firebasestorage.app",
  messagingSenderId: "222254359144",
  appId: "1:222254359144:web:32800be59af3d12dcb91dd"
};

// Initialize Firebase app if it hasn't been initialized already
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Register a new user
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    if (error instanceof Error) {
      return { user: null, error: error.message };
    }
    return { user: null, error: 'An unknown error occurred' };
  }
};

// Login user
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    if (error instanceof Error) {
      return { user: null, error: error.message };
    }
    return { user: null, error: 'An unknown error occurred' };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred' };
  }
};

// Auth state observer
export const observeAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};
