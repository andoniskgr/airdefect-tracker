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
  updateDoc,
  serverTimestamp,
  arrayUnion
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
    
    if (userEmail) {
      // Get user's own records (both private and public)
      const userRecordsQuery = query(recordsCollection, where("createdBy", "==", userEmail));
      const userSnapshot = await getDocs(userRecordsQuery);
      const userRecords = userSnapshot.docs.map(doc => {
        const data = doc.data() as Omit<DefectRecord, 'id'>;
        return { 
          id: doc.id,
          ...data,
          isPublic: data.isPublic ?? false, // Ensure isPublic has a default value
        };
      });

      // Get all public records (we'll filter out user's own records in the client)
      const publicRecordsQuery = query(
        recordsCollection, 
        where("isPublic", "==", true)
      );
      const publicSnapshot = await getDocs(publicRecordsQuery);
      const allPublicRecords = publicSnapshot.docs.map(doc => {
        const data = doc.data() as Omit<DefectRecord, 'id'>;
        return { 
          id: doc.id,
          ...data,
          isPublic: data.isPublic ?? false, // Ensure isPublic has a default value
        };
      });

      // Filter out user's own records from public records to avoid duplicates
      const otherUsersPublicRecords = allPublicRecords.filter(record => record.createdBy !== userEmail);

      // Combine and return both sets
      return [...userRecords, ...otherUsersPublicRecords];
    } else {
      // If no user email, get all records (for admin or testing)
      const snapshot = await getDocs(recordsCollection);
      return snapshot.docs.map(doc => {
        const data = doc.data() as Omit<DefectRecord, 'id'>;
        return { 
          id: doc.id,
          ...data,
          isPublic: data.isPublic ?? false, // Ensure isPublic has a default value
        };
      });
    }
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

// Delete multiple records by multiple dates
export const deleteRecordsByDates = async (dates: string[], userEmail?: string | null): Promise<void> => {
  try {
    const batch = writeBatch(db);
    let totalDeleted = 0;
    
    for (const date of dates) {
      // Get all records for this user and date
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
      
      // Add to batch for deletion
      snapshot.docs.forEach(document => {
        batch.delete(doc(db, COLLECTION_NAME, document.id));
        totalDeleted++;
      });
    }
    
    // Also remove the dates from archived dates if userEmail is provided
    if (userEmail) {
      for (const date of dates) {
        await removeArchivedDate(userEmail, date);
      }
    }
    
    // Commit the batch
    await batch.commit();
    console.log(`Deleted ${totalDeleted} records across ${dates.length} dates`);
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

// Delete all records for a user
export const deleteAllRecords = async (userEmail?: string | null): Promise<void> => {
  try {
    // Get all records for this user
    const recordsCollection = collection(db, COLLECTION_NAME);
    let recordsQuery;
    
    if (userEmail) {
      recordsQuery = query(recordsCollection, where("createdBy", "==", userEmail));
    } else {
      recordsQuery = recordsCollection;
    }
    
    const snapshot = await getDocs(recordsQuery);
    const batch = writeBatch(db);
    
    // Delete all records
    snapshot.docs.forEach(document => {
      batch.delete(doc(db, COLLECTION_NAME, document.id));
    });
    
    // Commit the batch
    await batch.commit();
    
    // Also clear all archived dates for this user
    if (userEmail) {
      const archivedDatesRef = doc(db, "archivedDates", userEmail);
      await setDoc(archivedDatesRef, { dates: [] });
    }
    
    console.log(`Deleted ${snapshot.docs.length} records`);
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

// New functions for archived dates
export const saveArchivedDate = async (userEmail: string, date: string) => {
  if (!userEmail) throw new Error("User email is required");
  
  const db = getFirestore();
  const archivedDatesRef = doc(db, "archivedDates", userEmail);
  
  try {
    // Check if document exists
    const docSnap = await getDoc(archivedDatesRef);
    
    if (docSnap.exists()) {
      // Get current dates and add new one if not exists
      const currentDates = docSnap.data().dates || [];
      if (!currentDates.includes(date)) {
        await updateDoc(archivedDatesRef, {
          dates: arrayUnion(date),
          updatedAt: serverTimestamp()
        });
      }
    } else {
      // Create new document
      await setDoc(archivedDatesRef, {
        email: userEmail,
        dates: [date],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error saving archived date:", error);
    throw error;
  }
};

export const removeArchivedDate = async (userEmail: string, date: string) => {
  if (!userEmail) throw new Error("User email is required");
  
  const db = getFirestore();
  const archivedDatesRef = doc(db, "archivedDates", userEmail);
  
  try {
    const docSnap = await getDoc(archivedDatesRef);
    
    if (docSnap.exists()) {
      const currentDates = docSnap.data().dates || [];
      const updatedDates = currentDates.filter((d: string) => d !== date);
      
      await updateDoc(archivedDatesRef, {
        dates: updatedDates,
        updatedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error removing archived date:", error);
    throw error;
  }
};

export const getUserArchivedDates = async (userEmail: string): Promise<string[]> => {
  if (!userEmail) return [];
  
  const db = getFirestore();
  const archivedDatesRef = doc(db, "archivedDates", userEmail);
  
  try {
    const docSnap = await getDoc(archivedDatesRef);
    
    if (docSnap.exists()) {
      return docSnap.data().dates || [];
    }
    
    return [];
  } catch (error) {
    console.error("Error getting archived dates:", error);
    return [];
  }
};

// User management functions
export const checkUserCodeExists = async (userCode: string): Promise<boolean> => {
  try {
    const usersCollection = collection(db, 'users');
    const codeQuery = query(usersCollection, where('userCode', '==', userCode));
    const codeSnapshot = await getDocs(codeQuery);
    return !codeSnapshot.empty;
  } catch (error) {
    console.error('Error checking user code existence:', error);
    return false;
  }
};

export const getUserByCode = async (userCode: string) => {
  try {
    const usersCollection = collection(db, 'users');
    const codeQuery = query(usersCollection, where('userCode', '==', userCode));
    const codeSnapshot = await getDocs(codeQuery);
    
    if (codeSnapshot.empty) {
      return null;
    }
    
    const userDoc = codeSnapshot.docs[0];
    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    console.error('Error getting user by code:', error);
    return null;
  }
};

export const updateUserCode = async (userId: string, newUserCode: string, userEmail?: string): Promise<void> => {
  try {
    // Check if new code already exists
    const codeExists = await checkUserCodeExists(newUserCode);
    
    if (codeExists) {
      throw new Error('User code already exists. Please choose a different code.');
    }
    
    const userRef = doc(db, 'users', userId);
    
    // Check if user document exists
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // Update existing user document
      await updateDoc(userRef, {
        userCode: newUserCode,
        updatedAt: new Date(),
      });
    } else {
      // Create new user document for existing Firebase Auth user
      await setDoc(userRef, {
        email: userEmail || '',
        userCode: newUserCode,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error updating user code:', error);
    throw error;
  }
};

export const getUserById = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const usersCollection = collection(db, 'users');
    const emailQuery = query(usersCollection, where('email', '==', email));
    const emailSnapshot = await getDocs(emailQuery);
    
    if (emailSnapshot.empty) {
      return null;
    }
    
    const userDoc = emailSnapshot.docs[0];
    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

// Export db and auth
export { db, auth };
