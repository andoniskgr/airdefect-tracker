
import { DefectRecord } from "@/components/defect-records/DefectRecord.types";

const DB_NAME = 'aircraft-defects-db';
const DB_VERSION = 1;
const STORE_NAME = 'defect-records';

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Error opening database');
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
  });
};

// Get all records
export const getAllRecords = async (): Promise<DefectRecord[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        console.error('Error getting records:', event);
        reject('Failed to get records');
      };
    });
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
};

// Save a single record
export const saveRecord = async (record: DefectRecord): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(record);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Error saving record:', event);
        reject('Failed to save record');
      };
    });
  } catch (error) {
    console.error('Database error:', error);
  }
};

// Update multiple records
export const saveRecords = async (records: DefectRecord[]): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Clear the store first
    store.clear();
    
    // Add all records
    records.forEach(record => {
      store.add(record);
    });
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        resolve();
      };
      
      transaction.onerror = (event) => {
        console.error('Error saving records:', event);
        reject('Failed to save records');
      };
    });
  } catch (error) {
    console.error('Database error:', error);
  }
};

// Delete a record by ID
export const deleteRecord = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Error deleting record:', event);
        reject('Failed to delete record');
      };
    });
  } catch (error) {
    console.error('Database error:', error);
  }
};

// Delete multiple records by date
export const deleteRecordsByDate = async (date: string): Promise<void> => {
  try {
    // Get all records
    const allRecords = await getAllRecords();
    
    // Filter out records for the specified date
    const remainingRecords = allRecords.filter(record => record.date !== date);
    
    // Save the remaining records
    await saveRecords(remainingRecords);
  } catch (error) {
    console.error('Error deleting records by date:', error);
  }
};
