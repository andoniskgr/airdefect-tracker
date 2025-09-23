const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Cloud Function to delete a user from Firebase Authentication
 * This function can only be called by authenticated admin users
 */
exports.deleteUser = functions.https.onCall(async (data, context) => {
  // Check if the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  // Check if the user has admin role
  const userDoc = await admin
    .firestore()
    .collection("users")
    .doc(context.auth.uid)
    .get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError("not-found", "User not found.");
  }

  const userData = userDoc.data();
  if (userData.role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admin users can delete other users."
    );
  }

  const { userId } = data;
  if (!userId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "User ID is required."
    );
  }

  try {
    // Prevent admin from deleting themselves
    if (userId === context.auth.uid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "You cannot delete your own account."
      );
    }

    // Delete user from Firebase Authentication
    await admin.auth().deleteUser(userId);

    // Delete user document from Firestore
    await admin.firestore().collection("users").doc(userId).delete();

    // Delete all records created by this user
    const recordsSnapshot = await admin
      .firestore()
      .collection("defectRecords")
      .where("createdBy", "==", userData.email)
      .get();

    const batch = admin.firestore().batch();
    recordsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return { success: true, message: "User deleted successfully" };
  } catch (error) {

    // Provide more specific error messages based on the error type
    if (error.code === "auth/user-not-found") {
      throw new functions.https.HttpsError(
        "not-found",
        "User not found in Firebase Authentication"
      );
    } else if (error.code === "permission-denied") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Permission denied: " + error.message
      );
    } else if (error.code === "unavailable") {
      throw new functions.https.HttpsError(
        "unavailable",
        "Service temporarily unavailable: " + error.message
      );
    } else {
      throw new functions.https.HttpsError(
        "internal",
        "Failed to delete user: " + error.message
      );
    }
  }
});

/**
 * Cloud Function to disable a user
 * This function can only be called by authenticated admin users
 */
exports.disableUser = functions.https.onCall(async (data, context) => {
  // Check if the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  // Check if the user has admin role
  const userDoc = await admin
    .firestore()
    .collection("users")
    .doc(context.auth.uid)
    .get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError("not-found", "User not found.");
  }

  const userData = userDoc.data();
  if (userData.role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admin users can disable other users."
    );
  }

  const { userId, reason } = data;
  if (!userId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "User ID is required."
    );
  }

  try {
    // Prevent admin from disabling themselves
    if (userId === context.auth.uid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "You cannot disable your own account."
      );
    }

    // Update user document in Firestore
    await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .update({
        disabled: true,
        disabledAt: new Date(),
        disabledBy: userData.email,
        disableReason: reason || null,
      });

    return { success: true, message: "User disabled successfully" };
  } catch (error) {

    // Provide more specific error messages based on the error type
    if (error.code === "permission-denied") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Permission denied: " + error.message
      );
    } else if (error.code === "not-found") {
      throw new functions.https.HttpsError(
        "not-found",
        "User document not found: " + error.message
      );
    } else if (error.code === "unavailable") {
      throw new functions.https.HttpsError(
        "unavailable",
        "Service temporarily unavailable: " + error.message
      );
    } else {
      throw new functions.https.HttpsError(
        "internal",
        "Failed to disable user: " + error.message
      );
    }
  }
});

/**
 * Cloud Function to enable a user
 * This function can only be called by authenticated admin users
 */
exports.enableUser = functions.https.onCall(async (data, context) => {
  // Check if the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  // Check if the user has admin role
  const userDoc = await admin
    .firestore()
    .collection("users")
    .doc(context.auth.uid)
    .get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError("not-found", "User not found.");
  }

  const userData = userDoc.data();
  if (userData.role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admin users can enable other users."
    );
  }

  const { userId } = data;
  if (!userId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "User ID is required."
    );
  }

  try {
    // Update user document in Firestore
    await admin.firestore().collection("users").doc(userId).update({
      disabled: false,
      disabledAt: null,
      disabledBy: null,
      disableReason: null,
    });

    return { success: true, message: "User enabled successfully" };
  } catch (error) {

    // Provide more specific error messages based on the error type
    if (error.code === "permission-denied") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Permission denied: " + error.message
      );
    } else if (error.code === "not-found") {
      throw new functions.https.HttpsError(
        "not-found",
        "User document not found: " + error.message
      );
    } else if (error.code === "unavailable") {
      throw new functions.https.HttpsError(
        "unavailable",
        "Service temporarily unavailable: " + error.message
      );
    } else {
      throw new functions.https.HttpsError(
        "internal",
        "Failed to enable user: " + error.message
      );
    }
  }
});

/**
 * Cloud Function to get all users (admin only)
 */
exports.getUsers = functions.https.onCall(async (data, context) => {
  // Check if the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  // Check if the user has admin role
  const userDoc = await admin
    .firestore()
    .collection("users")
    .doc(context.auth.uid)
    .get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError("not-found", "User not found.");
  }

  const userData = userDoc.data();
  if (userData.role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admin users can access user data."
    );
  }

  try {
    const usersSnapshot = await admin
      .firestore()
      .collection("users")
      .orderBy("createdAt", "desc")
      .get();
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { users };
  } catch (error) {
    throw new functions.https.HttpsError(
      "internal",
      "Failed to fetch users: " + error.message
    );
  }
});
