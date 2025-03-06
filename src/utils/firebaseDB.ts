
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
  writeBatch,
  getDoc,
  addDoc,
  updateDoc
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
export const getAllRecords = async (userEmail?: string | null): Promise<DefectRecord[]> => {
  try {
    const recordsCollection = collection(db, COLLECTION_NAME);
    
    // If userEmail is provided, filter by creator
    let recordsQuery;
    if (userEmail) {
      recordsQuery = query(recordsCollection, where("createdBy", "==", userEmail));
    } else {
      recordsQuery = recordsCollection;
    }
    
    const snapshot = await getDocs(recordsQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data() as Omit<DefectRecord, 'id'>;
      return { 
        id: doc.id, // Use Firestore document ID
        ...data 
      };
    });
  } catch (error) {
    console.error('Firestore error:', error);
    
    // Check if error is a Firebase permission error
    if (error instanceof Error && error.message.includes('permission')) {
      console.error('This appears to be a Firebase security rules issue. Please update your Firestore security rules to allow read/write access.');
    }
    
    return [];
  }
};

// Check if record exists
export const recordExists = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking record existence:', error);
    return false;
  }
};

// Save a single record
export const saveRecord = async (record: DefectRecord): Promise<void> => {
  try {
    // Check if this is a new record or an existing one
    if (record.id && record.id.trim() !== '') {
      // This is an existing record, check if it exists first
      const exists = await recordExists(record.id);
      if (!exists) {
        console.error(`Record with ID ${record.id} does not exist in Firestore.`);
        throw new Error(`Document with ID ${record.id} does not exist`);
      }
      
      // Create a clone without the id field for updateDoc
      const { id, ...recordWithoutId } = record;
      console.log(`Updating existing record with ID: ${id}`, recordWithoutId);
      
      const recordRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(recordRef, recordWithoutId);
    } else {
      // This is a new record, let Firestore generate an ID
      console.log('Adding new record without predefined ID');
      const newDocRef = await addDoc(collection(db, COLLECTION_NAME), 
        // Remove id if it's empty to avoid empty string IDs
        record.id && record.id.trim() !== '' ? record : Object.fromEntries(
          Object.entries(record).filter(([key]) => key !== 'id')
        )
      );
      console.log('New record added with Firestore-generated ID:', newDocRef.id);
    }
  } catch (error) {
    console.error('Firestore error when saving record:', error);
    
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
export const deleteRecord = async (id: string, userEmail?: string | null): Promise<void> => {
  try {
    // First check if the record belongs to the user
    if (userEmail) {
      const recordRef = doc(db, COLLECTION_NAME, id);
      const recordSnap = await getDoc(recordRef);
      
      if (recordSnap.exists()) {
        const data = recordSnap.data() as DefectRecord;
        
        // Only allow deletion if the user created the record
        if (data.createdBy !== userEmail) {
          throw new Error('You can only delete records you created');
        }
      }
    }
    
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
export const deleteRecordsByDate = async (date: string, userEmail?: string | null): Promise<void> => {
  try {
    // Get all records for this user
    const recordsCollection = collection(db, COLLECTION_NAME);
    let recordsQuery;
    
    if (userEmail) {
      recordsQuery = query(recordsCollection, 
        where("createdBy", "==", userEmail),
        where("date", "==", date)
      );
    } else {
      recordsQuery = query(recordsCollection, where("date", "==", date));
    }
    
    const snapshot = await getDocs(recordsQuery);
    const batch = writeBatch(db);
    
    // Delete matching records
    snapshot.docs.forEach(document => {
      batch.delete(doc(db, COLLECTION_NAME, document.id));
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
