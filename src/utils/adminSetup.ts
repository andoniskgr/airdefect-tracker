// Utility functions for admin setup and user management
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebaseDB';

export interface AdminUser {
  email: string;
  userCode: string;
  role: 'admin';
  status: 'approved';
  createdAt: Date;
  approvedAt: Date;
  approvedBy: string | null;
}

/**
 * Creates the first admin user if no admin exists
 * This should be called during application initialization
 */
export const createFirstAdmin = async (email: string, userCode: string): Promise<void> => {
  try {
    // Check if any admin users exist
    const adminDoc = await getDoc(doc(db, 'adminUsers', 'firstAdmin'));
    
    if (!adminDoc.exists()) {
      // Create the first admin user
      const adminData: AdminUser = {
        email: email,
        userCode: userCode,
        role: 'admin',
        status: 'approved',
        createdAt: new Date(),
        approvedAt: new Date(),
        approvedBy: 'system',
      };

      // Store admin info
      await setDoc(doc(db, 'adminUsers', 'firstAdmin'), adminData);
      
      console.log('First admin user created:', adminData);
    }
  } catch (error) {
    console.error('Error creating first admin:', error);
    throw error;
  }
};

/**
 * Checks if a user is an admin
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === 'admin';
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Promotes a user to admin role
 */
export const promoteToAdmin = async (userId: string, promotedBy: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      role: 'admin',
      approvedAt: new Date(),
      approvedBy: promotedBy,
    }, { merge: true });
    
    console.log(`User ${userId} promoted to admin by ${promotedBy}`);
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    throw error;
  }
};

/**
 * Gets admin configuration
 */
export const getAdminConfig = async () => {
  try {
    const adminDoc = await getDoc(doc(db, 'adminUsers', 'firstAdmin'));
    
    if (adminDoc.exists()) {
      return adminDoc.data() as AdminUser;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting admin config:', error);
    return null;
  }
};
