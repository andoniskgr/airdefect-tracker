// Fallback admin authentication utilities for user management
// This module provides functions to manage users without Firebase Functions
// Use this when Firebase Functions are not available (e.g., on Spark plan)

import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { deleteUser as deleteUserFromAuth } from 'firebase/auth';
import { db, auth } from './firebaseDB';

interface DeleteUserResponse {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Disables a user by updating their Firestore document
 * This is a fallback when Firebase Functions are not available
 * 
 * @param userId - The UID of the user to disable
 * @param reason - Optional reason for disabling
 * @returns Promise<DeleteUserResponse>
 */
export const disableUserFallback = async (userId: string, reason?: string): Promise<DeleteUserResponse> => {
  try {
    
    // Get the current user to ensure they're authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    // Get current user data to check admin role
    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!currentUserDoc.exists()) {
      throw new Error('Current user not found in Firestore');
    }

    const currentUserData = currentUserDoc.data();
    if (currentUserData.role !== 'admin') {
      throw new Error('Only admin users can disable other users');
    }

    // Prevent admin from disabling themselves
    if (userId === currentUser.uid) {
      throw new Error('You cannot disable your own account');
    }

    // Update user document in Firestore
    await updateDoc(doc(db, 'users', userId), {
      disabled: true,
      disabledAt: new Date(),
      disabledBy: currentUserData.email,
      disableReason: reason || null,
    });

    return { success: true, message: 'User disabled successfully' };
  } catch (error: any) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Enables a user by updating their Firestore document
 * This is a fallback when Firebase Functions are not available
 * 
 * @param userId - The UID of the user to enable
 * @returns Promise<DeleteUserResponse>
 */
export const enableUserFallback = async (userId: string): Promise<DeleteUserResponse> => {
  try {
    
    // Get the current user to ensure they're authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    // Get current user data to check admin role
    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!currentUserDoc.exists()) {
      throw new Error('Current user not found in Firestore');
    }

    const currentUserData = currentUserDoc.data();
    if (currentUserData.role !== 'admin') {
      throw new Error('Only admin users can enable other users');
    }

    // Update user document in Firestore
    await updateDoc(doc(db, 'users', userId), {
      disabled: false,
      disabledAt: null,
      disabledBy: null,
      disableReason: null,
    });

    return { success: true, message: 'User enabled successfully' };
  } catch (error: any) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Updates a user's role by updating their Firestore document
 * This is a fallback when Firebase Functions are not available
 * 
 * @param userId - The UID of the user to update
 * @param newRole - The new role ('user' or 'admin')
 * @returns Promise<DeleteUserResponse>
 */
export const updateUserRoleFallback = async (userId: string, newRole: 'user' | 'admin'): Promise<DeleteUserResponse> => {
  try {
    
    // Get the current user to ensure they're authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    // Get current user data to check admin role
    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!currentUserDoc.exists()) {
      throw new Error('Current user not found in Firestore');
    }

    const currentUserData = currentUserDoc.data();
    if (currentUserData.role !== 'admin') {
      throw new Error('Only admin users can change user roles');
    }

    // Prevent admin from changing their own role
    if (userId === currentUser.uid) {
      throw new Error('You cannot change your own role');
    }

    // Get the target user to ensure they exist and are not disabled
    const targetUserDoc = await getDoc(doc(db, 'users', userId));
    if (!targetUserDoc.exists()) {
      throw new Error('Target user not found');
    }

    const targetUserData = targetUserDoc.data();
    if (targetUserData.disabled) {
      throw new Error('Cannot change role of a disabled user. Please enable the user first.');
    }

    // Update user role in Firestore
    await updateDoc(doc(db, 'users', userId), {
      role: newRole,
      roleChangedAt: new Date(),
      roleChangedBy: currentUserData.email,
    });

    return { 
      success: true, 
      message: `User role updated to ${newRole} successfully` 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Deletes a user from Firestore only (not from Firebase Authentication)
 * This is a fallback when Firebase Functions are not available
 * Note: This will NOT delete the user from Firebase Authentication
 * 
 * @param userId - The UID of the user to delete
 * @returns Promise<DeleteUserResponse>
 */
export const deleteUserFallback = async (userId: string): Promise<DeleteUserResponse> => {
  try {
    
    // Get the current user to ensure they're authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    // Get current user data to check admin role
    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!currentUserDoc.exists()) {
      throw new Error('Current user not found in Firestore');
    }

    const currentUserData = currentUserDoc.data();
    if (currentUserData.role !== 'admin') {
      throw new Error('Only admin users can delete other users');
    }

    // Prevent admin from deleting themselves
    if (userId === currentUser.uid) {
      throw new Error('You cannot delete your own account');
    }

    // Delete user document from Firestore
    await deleteDoc(doc(db, 'users', userId));

    return { 
      success: true, 
      message: 'User deleted from Firestore successfully. Note: The user can now re-register with the same email and password, as the system will automatically reuse the existing Firebase Authentication account.' 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};
