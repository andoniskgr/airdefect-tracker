// Setup script to create the first admin user
// This should be run once to set up the initial admin account

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseDB';

export interface AdminSetupConfig {
  email: string;
  password: string;
  userCode: string;
}

/**
 * Creates the first admin user
 * This function should be called during application initialization
 * or through a setup script
 */
export const setupFirstAdmin = async (config: AdminSetupConfig): Promise<void> => {
  try {
    console.log('Setting up first admin user...');

    // Check if admin already exists
    const adminDoc = await getDoc(doc(db, 'adminUsers', 'firstAdmin'));
    if (adminDoc.exists()) {
      console.log('Admin user already exists, skipping setup');
      return;
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, config.email, config.password);
    const user = userCredential.user;

    // Create admin user document
    const adminData = {
      email: config.email,
      userCode: config.userCode,
      role: 'admin',
      status: 'approved',
      createdAt: new Date(),
      approvedAt: new Date(),
      approvedBy: 'system',
    };

    // Save to users collection
    await setDoc(doc(db, 'users', user.uid), adminData);

    // Save admin configuration
    await setDoc(doc(db, 'adminUsers', 'firstAdmin'), {
      ...adminData,
      userId: user.uid,
    });

    console.log('First admin user created successfully:', {
      email: config.email,
      userCode: config.userCode,
      userId: user.uid,
    });

    // Sign out the admin user
    await auth.signOut();

  } catch (error) {
    console.error('Error setting up first admin:', error);
    throw error;
  }
};

/**
 * Checks if an admin user exists
 */
export const hasAdminUser = async (): Promise<boolean> => {
  try {
    const adminDoc = await getDoc(doc(db, 'adminUsers', 'firstAdmin'));
    return adminDoc.exists();
  } catch (error) {
    console.error('Error checking admin user:', error);
    return false;
  }
};

/**
 * Gets the admin configuration
 */
export const getAdminConfig = async () => {
  try {
    const adminDoc = await getDoc(doc(db, 'adminUsers', 'firstAdmin'));
    if (adminDoc.exists()) {
      return adminDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting admin config:', error);
    return null;
  }
};

// Default admin configuration - CHANGE THESE VALUES
export const DEFAULT_ADMIN_CONFIG: AdminSetupConfig = {
  email: 'admin@mcc-application.com',
  password: 'Admin123!', // Change this password
  userCode: 'ADM1',
};

// Auto-setup function that can be called from the app
export const autoSetupAdmin = async (): Promise<void> => {
  try {
    const hasAdmin = await hasAdminUser();
    
    if (!hasAdmin) {
      console.log('No admin user found, setting up default admin...');
      await setupFirstAdmin(DEFAULT_ADMIN_CONFIG);
      console.log('Default admin user created. Please change the password immediately.');
    }
  } catch (error) {
    console.error('Error in auto setup:', error);
    // Don't throw error to prevent app from crashing
  }
};
