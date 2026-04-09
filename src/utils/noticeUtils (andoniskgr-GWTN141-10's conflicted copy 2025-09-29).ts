
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
import { db, getUserByEmail, getUserByCode } from "./firebaseDB";
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
 * Get all notices from Firestore (admin only - for management purposes)
 */
export const getAllNotices = async (): Promise<Notice[]> => {
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
        author: data.author,
        visibility: data.visibility || 'public'
      } as Notice;
    });
  } catch (error) {
    return [];
  }
};

/**
 * Get notices filtered by user permissions and visibility
 */
export const getNotices = async (userEmail?: string, isAdmin: boolean = false): Promise<Notice[]> => {
  try {
    const noticesQuery = query(
      collection(db, COLLECTION_NAME),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(noticesQuery);
    
    const allNotices = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        category: data.category,
        description: data.description,
        content: data.content,
        date: data.date,
        author: data.author,
        visibility: data.visibility || 'public'
      } as Notice;
    });

    // Filter notices based on visibility and user permissions
    // Both regular users and admins follow the same visibility rules
    const filteredNotices = allNotices.filter(notice => {
      // Show public notices to everyone
      if (notice.visibility === 'public') {
        return true;
      }
      
      // Show private notices only to their author (even admins can't see others' private notices)
      if (notice.visibility === 'private' && userEmail && notice.author === userEmail) {
        return true;
      }
      
      return false;
    });

    return filteredNotices;
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
        author: data.author,
        visibility: data.visibility || 'public'
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

/**
 * Get all unique categories from existing notices
 */
export const getNoticeCategories = async (): Promise<string[]> => {
  try {
    const noticesQuery = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(noticesQuery);
    
    const categories = new Set<string>();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.category && data.category.trim()) {
        categories.add(data.category.toUpperCase());
      }
    });
    
    return Array.from(categories).sort();
  } catch (error) {
    return [];
  }
};

/**
 * Convert email address to user code
 */
export const getEmailToUserCode = async (email: string): Promise<string> => {
  try {
    const userData = await getUserByEmail(email);
    return userData?.userCode || email; // Fallback to email if user code not found
  } catch (error) {
    return email; // Fallback to email if error
  }
};

/**
 * Convert user code to email address
 */
export const getUserCodeToEmail = async (userCode: string): Promise<string> => {
  try {
    const userData = await getUserByCode(userCode);
    return userData?.email || userCode; // Fallback to userCode if email not found
  } catch (error) {
    return userCode; // Fallback to userCode if error
  }
};
