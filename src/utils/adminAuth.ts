// Admin authentication utilities for user management
// This module provides functions to manage users in Firebase Authentication
// using Firebase Functions with Admin SDK

import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from './firebaseDB';

interface DeleteUserResponse {
  success: boolean;
  error?: string;
  message?: string;
}

// Initialize Firebase Functions
const functions = getFunctions();

/**
 * Deletes a user from Firebase Authentication using Firebase Functions
 * This function calls a Cloud Function that uses Firebase Admin SDK
 * 
 * @param userId - The UID of the user to delete
 * @returns Promise<DeleteUserResponse>
 */
export const deleteUserFromAuth = async (userId: string): Promise<DeleteUserResponse> => {
  try {
    console.log(`Attempting to delete user ${userId} from Firebase Authentication`);
    
    // Get the current user to ensure they're authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    // Call the Firebase Function
    const deleteUserFunction = httpsCallable(functions, 'deleteUser');
    const result = await deleteUserFunction({ userId });
    
    const data = result.data as { success: boolean; message?: string; error?: string };
    
    if (data.success) {
      console.log('User deleted successfully:', data.message);
      return { success: true, message: data.message };
    } else {
      throw new Error(data.error || 'Failed to delete user');
    }
  } catch (error: any) {
    console.error('Error deleting user from auth:', error);
    
    // Handle Firebase Functions errors specifically
    if (error.code === 'functions/unavailable' || error.code === 'unavailable') {
      return { 
        success: false, 
        error: 'Firebase Functions are not available. Please ensure they are deployed and try again.' 
      };
    } else if (error.code === 'functions/not-found' || error.code === 'not-found') {
      return { 
        success: false, 
        error: 'User not found in Firebase Authentication.' 
      };
    } else if (error.code === 'functions/permission-denied' || error.code === 'permission-denied') {
      return { 
        success: false, 
        error: 'Permission denied. Please ensure you have admin privileges.' 
      };
    } else if (error.code === 'functions/unauthenticated' || error.code === 'unauthenticated') {
      return { 
        success: false, 
        error: 'Authentication required. Please log in again.' 
      };
    } else if (error.code === 'functions/invalid-argument' || error.code === 'invalid-argument') {
      return { 
        success: false, 
        error: error.message || 'Invalid arguments provided.' 
      };
    } else if (error.code === 'functions/internal' || error.code === 'internal' || error.message?.includes('Internal server error')) {
      return { 
        success: false, 
        error: 'Internal server error. Please check the Firebase Functions logs for details.' 
      };
    } else if (error.message?.includes('CORS policy') || error.message?.includes('Access-Control-Allow-Origin') || error.message?.includes('ERR_FAILED')) {
      return { 
        success: false, 
        error: 'Firebase Functions are not available due to CORS policy. Using fallback method.' 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Disables a user using Firebase Functions
 * This function calls a Cloud Function that disables a user
 * 
 * @param userId - The UID of the user to disable
 * @param reason - Optional reason for disabling
 * @returns Promise<DeleteUserResponse>
 */
export const disableUser = async (userId: string, reason?: string): Promise<DeleteUserResponse> => {
  try {
    console.log(`Attempting to disable user ${userId}`);
    
    // Get the current user to ensure they're authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    // Call the Firebase Function
    const disableUserFunction = httpsCallable(functions, 'disableUser');
    const result = await disableUserFunction({ userId, reason });
    
    const data = result.data as { success: boolean; message?: string; error?: string };
    
    if (data.success) {
      console.log('User disabled successfully:', data.message);
      return { success: true, message: data.message };
    } else {
      throw new Error(data.error || 'Failed to disable user');
    }
  } catch (error: any) {
    console.error('Error disabling user:', error);
    
    // Handle Firebase Functions errors specifically
    if (error.code === 'functions/unavailable' || error.code === 'unavailable') {
      return { 
        success: false, 
        error: 'Firebase Functions are not available. Please ensure they are deployed and try again.' 
      };
    } else if (error.code === 'functions/not-found' || error.code === 'not-found') {
      return { 
        success: false, 
        error: 'User not found in Firestore.' 
      };
    } else if (error.code === 'functions/permission-denied' || error.code === 'permission-denied') {
      return { 
        success: false, 
        error: 'Permission denied. Please ensure you have admin privileges.' 
      };
    } else if (error.code === 'functions/unauthenticated' || error.code === 'unauthenticated') {
      return { 
        success: false, 
        error: 'Authentication required. Please log in again.' 
      };
    } else if (error.code === 'functions/invalid-argument' || error.code === 'invalid-argument') {
      return { 
        success: false, 
        error: error.message || 'Invalid arguments provided.' 
      };
    } else if (error.code === 'functions/internal' || error.code === 'internal' || error.message?.includes('Internal server error')) {
      return { 
        success: false, 
        error: 'Internal server error. Please check the Firebase Functions logs for details.' 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Enables a user using Firebase Functions
 * This function calls a Cloud Function that enables a user
 * 
 * @param userId - The UID of the user to enable
 * @returns Promise<DeleteUserResponse>
 */
export const enableUser = async (userId: string): Promise<DeleteUserResponse> => {
  try {
    console.log(`Attempting to enable user ${userId}`);
    
    // Get the current user to ensure they're authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    // Call the Firebase Function
    const enableUserFunction = httpsCallable(functions, 'enableUser');
    const result = await enableUserFunction({ userId });
    
    const data = result.data as { success: boolean; message?: string; error?: string };
    
    if (data.success) {
      console.log('User enabled successfully:', data.message);
      return { success: true, message: data.message };
    } else {
      throw new Error(data.error || 'Failed to enable user');
    }
  } catch (error: any) {
    console.error('Error enabling user:', error);
    
    // Handle Firebase Functions errors specifically
    if (error.code === 'functions/unavailable' || error.code === 'unavailable') {
      return { 
        success: false, 
        error: 'Firebase Functions are not available. Please ensure they are deployed and try again.' 
      };
    } else if (error.code === 'functions/not-found' || error.code === 'not-found') {
      return { 
        success: false, 
        error: 'User not found in Firestore.' 
      };
    } else if (error.code === 'functions/permission-denied' || error.code === 'permission-denied') {
      return { 
        success: false, 
        error: 'Permission denied. Please ensure you have admin privileges.' 
      };
    } else if (error.code === 'functions/unauthenticated' || error.code === 'unauthenticated') {
      return { 
        success: false, 
        error: 'Authentication required. Please log in again.' 
      };
    } else if (error.code === 'functions/invalid-argument' || error.code === 'invalid-argument') {
      return { 
        success: false, 
        error: error.message || 'Invalid arguments provided.' 
      };
    } else if (error.code === 'functions/internal' || error.code === 'internal' || error.message?.includes('Internal server error')) {
      return { 
        success: false, 
        error: 'Internal server error. Please check the Firebase Functions logs for details.' 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Gets all users using Firebase Functions (admin only)
 * This function calls a Cloud Function that returns all users
 * 
 * @returns Promise<{ users: any[] }>
 */
export const getAllUsers = async (): Promise<{ users: any[] }> => {
  try {
    // Get the current user to ensure they're authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    // Call the Firebase Function
    const getUsersFunction = httpsCallable(functions, 'getUsers');
    const result = await getUsersFunction();
    
    const data = result.data as { users: any[] };
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};
