# User Management Troubleshooting Guide

This guide helps resolve issues with user disable/delete functionality that shows "internal" errors.

## Common Issues and Solutions

### 1. Firebase Functions Not Deployed

**Symptoms:**

- "Failed to disable user: internal" error
- "Failed to delete user from authentication: internal" error

**Solution:**

```bash
# Navigate to project directory
cd /path/to/mcc-application

# Login to Firebase (if not already logged in)
firebase login

# Set the project
firebase use mcc-tracker

# Deploy functions
firebase deploy --only functions

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

Or use the provided script:

```bash
./scripts/deploy-functions.sh
```

### 2. Authentication Issues

**Symptoms:**

- "Authentication required. Please log in again." error
- Functions fail with unauthenticated error

**Solution:**

1. Ensure the user is properly logged in
2. Check if the user has admin role in Firestore
3. Verify the user document exists in the `users` collection

### 3. Permission Issues

**Symptoms:**

- "Permission denied. Please ensure you have admin privileges." error
- User cannot perform admin actions

**Solution:**

1. Check Firestore security rules are deployed
2. Verify the user has `role: "admin"` in their Firestore document
3. Ensure the user document exists in the `users` collection

### 4. User Not Found Issues

**Symptoms:**

- "User not found in Firebase Authentication" error
- "User not found in Firestore" error

**Solution:**

1. Verify the user ID is correct
2. Check if the user exists in Firebase Authentication
3. Check if the user document exists in Firestore

### 5. Service Unavailable Issues

**Symptoms:**

- "Firebase Functions are not available" error
- Functions timeout or fail to respond

**Solution:**

1. Check Firebase Functions status in the Firebase Console
2. Verify the functions are deployed and running
3. Check for any quota or billing issues

## Debugging Steps

### 1. Check Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (mcc-tracker)
3. Go to Functions section
4. Check if functions are deployed and running
5. Check the logs for any errors

### 2. Check Firestore Console

1. Go to Firestore Database in Firebase Console
2. Check if the `users` collection exists
3. Verify user documents have the correct structure
4. Check if security rules are deployed

### 3. Check Browser Console

1. Open browser developer tools
2. Go to Console tab
3. Look for any JavaScript errors
4. Check Network tab for failed requests

### 4. Test Functions Manually

You can test the functions using the Firebase Console:

1. Go to Functions section
2. Click on a function (e.g., `deleteUser`)
3. Click "Test function"
4. Provide test data and run

## Error Codes Reference

| Error Code                    | Meaning                               | Solution                  |
| ----------------------------- | ------------------------------------- | ------------------------- |
| `functions/unavailable`       | Functions not deployed or unavailable | Deploy functions          |
| `functions/not-found`         | User not found                        | Check user exists         |
| `functions/permission-denied` | Insufficient permissions              | Check admin role          |
| `functions/unauthenticated`   | Not logged in                         | Re-authenticate           |
| `functions/invalid-argument`  | Invalid parameters                    | Check function parameters |
| `functions/internal`          | Internal server error                 | Check Firebase logs       |

## Prevention

1. **Always deploy functions after changes**
2. **Test functions after deployment**
3. **Monitor Firebase Console for errors**
4. **Keep Firestore security rules updated**
5. **Regularly check user permissions**

## Getting Help

If issues persist:

1. Check Firebase Console logs
2. Check browser console for errors
3. Verify all dependencies are installed
4. Ensure Firebase project is properly configured
5. Contact Firebase support if needed

## Version History

- **v1.0.15**: Added comprehensive error handling and troubleshooting guide
- **v1.0.14**: Added Firebase Functions for user management
