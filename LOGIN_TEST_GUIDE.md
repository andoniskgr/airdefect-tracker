# Login Test Guide

## Testing 4-Letter Code Login

### What Was Fixed

The issue was with Firestore security rules. The `getUserByCode` function needs to query the users collection to find a user by their `userCode` field, but the previous rules were too restrictive.

### Updated Firestore Rules

The rules now allow:

1. Users to read/write their own data
2. Admins to read/write all user data
3. **Queries on userCode field for login purposes** (this was the missing piece)

### How to Test

1. **Try logging in with a 4-letter code:**

   - Go to the login page
   - Enter a 4-letter user code (e.g., "ABCD")
   - Enter the password
   - Should work now!

2. **Try logging in with email:**

   - Should still work as before

3. **Check browser console:**
   - Look for any error messages
   - Should see successful login process

### Expected Behavior

✅ **4-letter code login** - Should work now
✅ **Email login** - Should continue working
✅ **User management** - Should continue working
✅ **All other functionality** - Should be unaffected

### If Still Not Working

1. **Check browser console** for specific error messages
2. **Verify the user code exists** in Firestore
3. **Check if the user is approved** (not pending/rejected)
4. **Try logging out and back in** to clear any cached state

### Debugging Steps

If 4-letter code login still doesn't work:

1. Open browser developer tools
2. Go to Console tab
3. Try to login with a 4-letter code
4. Look for error messages related to:
   - Firestore permissions
   - getUserByCode function
   - Authentication errors

The updated Firestore rules should resolve the issue!
