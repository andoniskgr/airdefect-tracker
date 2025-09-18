# Firebase Functions Setup for User Management

This document explains how to set up and deploy Firebase Functions to enable proper user deletion from Firebase Authentication.

## Overview

The application now includes Firebase Functions that use the Firebase Admin SDK to properly delete users from both Firestore and Firebase Authentication. This solves the issue where users were only being deleted from Firestore but not from Firebase Authentication.

## Files Added/Modified

### New Files:

- `functions/` - Firebase Functions directory
- `functions/package.json` - Functions dependencies
- `functions/index.js` - Cloud Functions implementation
- `firebase.json` - Firebase project configuration
- `src/utils/adminAuth.ts` - Client-side admin utilities

### Modified Files:

- `src/pages/UserManagement.tsx` - Updated to use Firebase Functions for user deletion
- `src/version.json` - Updated to version 1.0.14

## Setup Instructions

### 1. Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase in your project

```bash
firebase init
```

Select:

- Functions: Configure a Cloud Functions directory
- Firestore: Configure security rules and indexes files

### 4. Deploy the Functions

```bash
firebase deploy --only functions
```

## Functions Available

### `deleteUser`

- **Purpose**: Deletes a user from both Firebase Authentication and Firestore
- **Authentication**: Requires authenticated admin user
- **Parameters**: `{ userId: string }`
- **Returns**: `{ success: boolean, message?: string }`

### `getUsers`

- **Purpose**: Gets all users (admin only)
- **Authentication**: Requires authenticated admin user
- **Returns**: `{ users: User[] }`

## Security

The functions include proper security checks:

- Authentication required
- Admin role verification
- Prevents self-deletion
- Proper error handling

## Usage

The functions are automatically called from the client-side code when:

- An admin deletes a user from the User Management page
- The system needs to fetch all users

## Troubleshooting

### Common Issues:

1. **Functions not deployed**: Make sure you've run `firebase deploy --only functions`
2. **Permission denied**: Ensure the user has admin role in Firestore
3. **Authentication errors**: Make sure the user is properly authenticated

### Testing:

You can test the functions using the Firebase Console or by using the client application.

## Version History

- **v1.0.14**: Added Firebase Functions for proper user deletion from Firebase Authentication
