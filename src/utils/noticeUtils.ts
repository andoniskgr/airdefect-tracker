import {
  collection,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  type DocumentData,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage, getUserByEmail, getUserByCode } from "./firebaseDB";
import { Notice, NoticeAttachment } from "../pages/InternalNotices";

const COLLECTION_NAME = "internalNotices";

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Upload files to Storage for an existing notice id and return attachment metadata.
 */
export const uploadNoticeFiles = async (
  noticeId: string,
  files: File[]
): Promise<NoticeAttachment[]> => {
  const out: NoticeAttachment[] = [];
  for (const file of files) {
    const safe = sanitizeFileName(file.name);
    const storagePath = `internalNoticeAttachments/${noticeId}/${Date.now()}_${safe}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file, {
      contentType: file.type || "application/octet-stream",
    });
    const url = await getDownloadURL(storageRef);
    out.push({
      url,
      name: file.name,
      contentType: file.type || undefined,
      storagePath,
    });
  }
  return out;
};

function toNotice(id: string, data: DocumentData): Notice {
  return {
    id,
    title: data.title,
    category: data.category,
    description: data.description,
    content: data.content,
    date: data.date,
    author: data.author,
    visibility: data.visibility || "public",
    attachments: Array.isArray(data.attachments) ? data.attachments : [],
  } as Notice;
}

/**
 * Add a new notice to Firestore (optional file attachments uploaded to Storage).
 */
export const addNotice = async (
  notice: Omit<Notice, "id">,
  files: File[] = []
): Promise<string> => {
  const { attachments: _a, ...rest } = notice;
  const noticeRef = doc(collection(db, COLLECTION_NAME));
  const id = noticeRef.id;

  const uploaded =
    files.length > 0 ? await uploadNoticeFiles(id, files) : [];

  await setDoc(noticeRef, {
    ...rest,
    ...(uploaded.length > 0 ? { attachments: uploaded } : {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return id;
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
    
    return snapshot.docs.map((d) => toNotice(d.id, d.data()));
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
    
    const allNotices = snapshot.docs.map((d) => toNotice(d.id, d.data()));

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
      return toNotice(docSnap.id, docSnap.data());
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
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const attachments: NoticeAttachment[] = Array.isArray(data.attachments)
        ? data.attachments
        : [];
      for (const a of attachments) {
        if (a.storagePath) {
          try {
            await deleteObject(ref(storage, a.storagePath));
          } catch {
            // ignore missing or already deleted files
          }
        }
      }
    }
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
