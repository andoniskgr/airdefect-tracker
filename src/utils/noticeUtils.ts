
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp, 
  getDoc,
  doc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "./firebaseDB";
import { Notice } from "../pages/InternalNotices";

const COLLECTION_NAME = 'internalNotices';

/**
 * Add a new notice to Firestore
 */
export const addNotice = async (notice: Omit<Notice, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...notice,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all notices from Firestore
 */
export const getNotices = async (): Promise<Notice[]> => {
  try {
    const noticesQuery = query(
      collection(db, COLLECTION_NAME),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(noticesQuery);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        category: data.category,
        description: data.description,
        content: data.content,
        date: data.date,
        author: data.author
      } as Notice;
    });
  } catch (error) {
    return [];
  }
};

/**
 * Get a notice by ID
 */
export const getNoticeById = async (id: string): Promise<Notice | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        category: data.category,
        description: data.description,
        content: data.content,
        date: data.date,
        author: data.author
      } as Notice;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Update an existing notice
 */
export const updateNotice = async (id: string, notice: Partial<Notice>): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    
    // Don't include updatedAt in the notice object to prevent it from overriding serverTimestamp()
    const { id: _, ...noticeData } = notice as any;
    
    await updateDoc(docRef, {
      ...noticeData,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Delete a notice by ID
 */
export const deleteNotice = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    
    return true;
  } catch (error) {
    return false;
  }
};
