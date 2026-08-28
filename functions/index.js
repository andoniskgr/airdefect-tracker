const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

const requireAdmin = async (context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

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
      "Only admin users can perform this action."
    );
  }

  return userData;
};

const deleteAuthUser = async (userId, email) => {
  try {
    await admin.auth().deleteUser(userId);
    return;
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }
  }

  if (!email) {
    return;
  }

  try {
    const authUser = await admin.auth().getUserByEmail(email);
    await admin.auth().deleteUser(authUser.uid);
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }
  }
};

const rethrowHttpsError = (error, fallbackMessage) => {
  if (error instanceof functions.https.HttpsError) {
    throw error;
  }

  throw new functions.https.HttpsError(
    "internal",
    fallbackMessage + error.message
  );
};

/**
 * Whenever a user document is removed from Firestore, also remove the
 * matching Firebase Authentication account. This covers admin deletes from
 * the app even if the callable function is unavailable.
 */
exports.removeAuthWhenUserDeleted = functions.firestore
  .document("users/{userId}")
  .onDelete(async (snap, context) => {
    const email = snap.data()?.email;
    await deleteAuthUser(context.params.userId, email);
  });

/**
 * Delete a user from Firebase Authentication and Firestore.
 * Callable only by authenticated admin users.
 */
exports.deleteUser = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);

  const userId = data?.userId;
  const email = data?.email;

  if (!userId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "User ID is required."
    );
  }

  if (userId === context.auth.uid) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "You cannot delete your own account."
    );
  }

  try {
    const targetDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();
    const targetEmail = email || targetDoc.data()?.email;

    await deleteAuthUser(userId, targetEmail);

    if (targetDoc.exists) {
      await admin.firestore().collection("users").doc(userId).delete();
    }

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    rethrowHttpsError(error, "Failed to delete user: ");
  }
});

/**
 * If an email exists in Authentication but not in Firestore (left behind after
 * a previous delete), remove that Auth user and create a fresh account.
 */
exports.reclaimOrphanedAuthUser = functions.https.onCall(async (data) => {
  const email = String(data?.email || "").trim();
  const password = data?.password;
  const userCode = String(data?.userCode || "")
    .trim()
    .toUpperCase();

  if (!email || !password || !userCode) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email, password, and user code are required."
    );
  }

  if (!/^[A-Z0-9]{4}$/.test(userCode)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "User code must be exactly 4 letters or numbers."
    );
  }

  if (typeof password !== "string" || password.length < 6) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Password must be at least 6 characters."
    );
  }

  try {
    const emailSnap = await admin
      .firestore()
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!emailSnap.empty) {
      throw new functions.https.HttpsError(
        "already-exists",
        "This email is already registered."
      );
    }

    const codeSnap = await admin
      .firestore()
      .collection("users")
      .where("userCode", "==", userCode)
      .limit(1)
      .get();

    if (!codeSnap.empty) {
      throw new functions.https.HttpsError(
        "already-exists",
        "User code already exists. Please choose a different code."
      );
    }

    let existingAuthUser = null;
    try {
      existingAuthUser = await admin.auth().getUserByEmail(email);
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    if (existingAuthUser) {
      const existingProfile = await admin
        .firestore()
        .collection("users")
        .doc(existingAuthUser.uid)
        .get();

      if (existingProfile.exists) {
        throw new functions.https.HttpsError(
          "already-exists",
          "This email is already registered."
        );
      }

      await admin.auth().deleteUser(existingAuthUser.uid);
    }

    const newUser = await admin.auth().createUser({
      email,
      password,
    });

    await admin.firestore().collection("users").doc(newUser.uid).set({
      email,
      userCode,
      createdAt: new Date(),
      status: "pending",
      role: "user",
      approvedAt: null,
      approvedBy: null,
    });

    return { success: true, uid: newUser.uid };
  } catch (error) {
    rethrowHttpsError(error, "Failed to recreate account: ");
  }
});

/**
 * Disable a user. Callable only by authenticated admin users.
 */
exports.disableUser = functions.https.onCall(async (data, context) => {
  const adminData = await requireAdmin(context);
  const userId = data?.userId;
  const reason = data?.reason;

  if (!userId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "User ID is required."
    );
  }

  try {
    if (userId === context.auth.uid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "You cannot disable your own account."
      );
    }

    await admin.firestore().collection("users").doc(userId).update({
      disabled: true,
      disabledAt: new Date(),
      disabledBy: adminData.email,
      disableReason: reason || null,
    });

    try {
      await admin.auth().updateUser(userId, { disabled: true });
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        console.warn("Could not disable Authentication user:", error.message);
      }
    }

    return { success: true, message: "User disabled successfully" };
  } catch (error) {
    rethrowHttpsError(error, "Failed to disable user: ");
  }
});

/**
 * Enable a user. Callable only by authenticated admin users.
 */
exports.enableUser = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  const userId = data?.userId;

  if (!userId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "User ID is required."
    );
  }

  try {
    await admin.firestore().collection("users").doc(userId).update({
      disabled: false,
      disabledAt: null,
      disabledBy: null,
      disableReason: null,
    });

    try {
      await admin.auth().updateUser(userId, { disabled: false });
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        console.warn("Could not enable Authentication user:", error.message);
      }
    }

    return { success: true, message: "User enabled successfully" };
  } catch (error) {
    rethrowHttpsError(error, "Failed to enable user: ");
  }
});

/**
 * Update a user's role. Callable only by authenticated admin users.
 */
exports.updateUserRole = functions.https.onCall(async (data, context) => {
  const adminData = await requireAdmin(context);
  const userId = data?.userId;
  const newRole = data?.newRole;

  if (!userId || !newRole) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "User ID and new role are required."
    );
  }

  if (newRole !== "user" && newRole !== "admin") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid role. Role must be 'user' or 'admin'."
    );
  }

  try {
    if (userId === context.auth.uid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "You cannot change your own role."
      );
    }

    const targetUserDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();

    if (!targetUserDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Target user not found.");
    }

    const targetUserData = targetUserDoc.data();

    if (targetUserData.disabled) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Cannot change role of a disabled user. Please enable the user first."
      );
    }

    await admin.firestore().collection("users").doc(userId).update({
      role: newRole,
      roleChangedAt: new Date(),
      roleChangedBy: adminData.email,
    });

    return {
      success: true,
      message: `User role updated to ${newRole} successfully`,
    };
  } catch (error) {
    rethrowHttpsError(error, "Failed to update user role: ");
  }
});

/**
 * Get all users. Callable only by authenticated admin users.
 */
exports.getUsers = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);

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
