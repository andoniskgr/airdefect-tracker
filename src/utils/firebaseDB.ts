import { DefectRecord } from "@/components/defect-records/DefectRecord.types";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  writeBatch
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuInHrF3Ky0q1iXuXGhA9qi1T707QB1UU",
  authDomain: "mcc-tracker.firebaseapp.com",
  projectId: "mcc-tracker",
  storageBucket: "mcc-tracker.firebasestorage.app",
  messagingSenderId: "222254359144",
  appId: "1:222254359144:web:32800be59af3d12dcb91dd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const COLLECTION_NAME = 'defectRecords';

// Get all records
export const getAllRecords = async (): Promise<DefectRecord[]> => {
  try {
    const recordsCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(recordsCollection);
    return snapshot.docs.map(doc => doc.data() as DefectRecord);
  } catch (error) {
    console.error('Firestore error:', error);
    
    // Check if error is a Firebase permission error
    if (error instanceof Error && error.message.includes('permission')) {
      console.error('This appears to be a Firebase security rules issue. Please update your Firestore security rules to allow read/write access.');
    }
    
    return [];
  }
};

// Save a single record
export const saveRecord = async (record: DefectRecord): Promise<void> => {
  try {
    const recordRef = doc(db, COLLECTION_NAME, record.id);
    await setDoc(recordRef, record);
  } catch (error) {
    console.error('Firestore error:', error);
    
    // Check if error is a Firebase permission error
    if (error instanceof Error && error.message.includes('permission')) {
      console.error('This appears to be a Firebase security rules issue. Please update your Firestore security rules to allow read/write access.');
      throw new Error('Firebase permission denied. Please update your Firestore security rules.');
    }
    
    throw error;
  }
};

// Save multiple records
export const saveRecords = async (records: DefectRecord[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // First get all records to find ones to delete
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    
    // Delete all existing records
    snapshot.docs.forEach(document => {
      batch.delete(doc(db, COLLECTION_NAME, document.id));
    });
    
    // Add all new records
    records.forEach(record => {
      const recordRef = doc(db, COLLECTION_NAME, record.id);
      batch.set(recordRef, record);
    });
    
    // Commit the batch
    await batch.commit();
  } catch (error) {
    console.error('Firestore error:', error);
    
    // Check if error is a Firebase permission error
    if (error instanceof Error && error.message.includes('permission')) {
      console.error('This appears to be a Firebase security rules issue. Please update your Firestore security rules to allow read/write access.');
      throw new Error('Firebase permission denied. Please update your Firestore security rules.');
    }
    
    throw error;
  }
};

// Delete a record by ID
export const deleteRecord = async (id: string): Promise<void> => {
  try {
    const recordRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(recordRef);
  } catch (error) {
    console.error('Firestore error:', error);
    
    // Check if error is a Firebase permission error
    if (error instanceof Error && error.message.includes('permission')) {
      console.error('This appears to be a Firebase security rules issue. Please update your Firestore security rules to allow read/write access.');
      throw new Error('Firebase permission denied. Please update your Firestore security rules.');
    }
    
    throw error;
  }
};

// Delete multiple records by date
export const deleteRecordsByDate = async (date: string): Promise<void> => {
  try {
    // Get all records
    const recordsCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(recordsCollection);
    const batch = writeBatch(db);
    
    // Find and delete records for the specified date
    snapshot.docs.forEach(document => {
      const data = document.data() as DefectRecord;
      if (data.date === date) {
        batch.delete(doc(db, COLLECTION_NAME, document.id));
      }
    });
    
    // Commit the batch
    await batch.commit();
  } catch (error) {
    console.error('Firestore error:', error);
    
    // Check if error is a Firebase permission error
    if (error instanceof Error && error.message.includes('permission')) {
      console.error('This appears to be a Firebase security rules issue. Please update your Firestore security rules to allow read/write access.');
      throw new Error('Firebase permission denied. Please update your Firestore security rules.');
    }
    
    throw error;
  }
};

// Export db and auth
export { db, auth };
