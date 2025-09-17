# Email Notification Setup Guide

This guide explains how to set up email notifications for the user approval system in the MCC Application.

## Overview

The application now includes a user approval system where:

1. New users sign up and are placed in "pending" status
2. Admins receive email notifications about new signups
3. Admins can approve or reject users through the User Management page
4. Users receive email notifications about approval/rejection decisions

## Current Implementation

The email system is currently set up as a placeholder that logs email data to the console. To enable actual email sending, you need to integrate with a real email service.

## Email Service Integration Options

### Option 1: EmailJS (Recommended for Frontend)

EmailJS is a popular choice for sending emails directly from the frontend.

1. **Sign up at [EmailJS](https://www.emailjs.com/)**
2. **Create an email service** (Gmail, Outlook, etc.)
3. **Create email templates** for:
   - Admin signup notification
   - User approval notification
   - User rejection notification
4. **Get your credentials:**

   - Service ID
   - Template ID
   - Public Key

5. **Install EmailJS:**

   ```bash
   npm install @emailjs/browser
   ```

6. **Update the email service:**

   ```typescript
   // In src/utils/emailService.ts
   import emailjs from "@emailjs/browser";

   export class EmailService {
     async sendEmail(emailData: EmailData): Promise<boolean> {
       try {
         const result = await emailjs.send(
           EMAIL_CONFIG.SERVICE_ID,
           EMAIL_CONFIG.TEMPLATE_ID,
           {
             to_email: emailData.to,
             subject: emailData.subject,
             message: emailData.html,
           },
           EMAIL_CONFIG.PUBLIC_KEY
         );

         console.log("Email sent successfully:", result);
         return true;
       } catch (error) {
         console.error("Email sending failed:", error);
         return false;
       }
     }
   }
   ```

7. **Set environment variables:**
   ```bash
   # In your .env file
   VITE_ADMIN_EMAIL=andoniskgr@gmail.com
   VITE_EMAILJS_SERVICE_ID=service_apl6r78
   VITE_EMAILJS_PUBLIC_KEY=IGU2SXlHLq9LxImWA
   VITE_EMAILJS_TEMPLATE_ADMIN_SIGNUP=Contact Us
   VITE_EMAILJS_TEMPLATE_USER_APPROVAL=Contact Us
   VITE_EMAILJS_TEMPLATE_USER_REJECTION=Contact Us
   VITE_EMAILJS_TEMPLATE_GENERIC=Contact Us
   ```

### Option 2: Backend Email Service

For production applications, it's recommended to use a backend service.

1. **Create a backend API endpoint** for sending emails
2. **Use services like:**

   - SendGrid
   - AWS SES
   - Nodemailer with SMTP
   - Resend

3. **Update the email service to call your API:**

   ```typescript
   async sendEmail(emailData: EmailData): Promise<boolean> {
     try {
       const response = await fetch('/api/send-email', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(emailData),
       });

       return response.ok;
     } catch (error) {
       console.error('Email sending failed:', error);
       return false;
     }
   }
   ```

## Admin Setup

### Creating the First Admin User

1. **Manual Setup:**

   - Sign up with the first admin account
   - Manually update the user document in Firestore to set `role: 'admin'` and `status: 'approved'`

2. **Using the Setup Script:**

   ```typescript
   import { setupFirstAdmin, DEFAULT_ADMIN_CONFIG } from "./utils/setupAdmin";

   // Call this once to create the first admin
   await setupFirstAdmin({
     email: "admin@yourdomain.com",
     password: "SecurePassword123!",
     userCode: "ADM1",
   });
   ```

### Default Admin Credentials

The system includes default admin credentials (change these immediately):

- **Email:** admin@mcc-application.com
- **Password:** Admin123!
- **User Code:** ADM1

## Email Templates

The system includes three email templates:

### 1. Admin Signup Notification

- Sent to admin when a new user signs up
- Includes user details and link to user management page

### 2. User Approval Notification

- Sent to user when their account is approved
- Includes login instructions

### 3. User Rejection Notification

- Sent to user when their account is rejected
- Includes optional rejection reason

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```bash
# Email Configuration
VITE_ADMIN_EMAIL=admin@yourdomain.com
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_TEMPLATE_ADMIN_SIGNUP=template_admin_signup
VITE_EMAILJS_TEMPLATE_USER_APPROVAL=template_user_approval
VITE_EMAILJS_TEMPLATE_USER_REJECTION=template_user_rejection
VITE_EMAILJS_TEMPLATE_GENERIC=template_generic

# Firebase Configuration (if not already set)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### Email Service Configuration

Update `src/utils/emailService.ts`:

```typescript
export const EMAIL_CONFIG = {
  ADMIN_EMAIL: import.meta.env.VITE_ADMIN_EMAIL || "admin@mcc-application.com",
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || "",
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "",
  TEMPLATE_ADMIN_SIGNUP: import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN_SIGNUP || "template_admin_signup",
  TEMPLATE_USER_APPROVAL: import.meta.env.VITE_EMAILJS_TEMPLATE_USER_APPROVAL || "template_user_approval",
  TEMPLATE_USER_REJECTION: import.meta.env.VITE_EMAILJS_TEMPLATE_USER_REJECTION || "template_user_rejection",
  TEMPLATE_GENERIC: import.meta.env.VITE_EMAILJS_TEMPLATE_GENERIC || "template_generic",
};
```

## Testing

### Test Email Sending

1. **Enable console logging** in the email service
2. **Check browser console** for email data when testing
3. **Verify email templates** are properly formatted
4. **Test all three email types:**
   - Admin notification
   - User approval
   - User rejection

### Test User Flow

1. **Sign up as a new user**
2. **Check that admin receives notification**
3. **Approve/reject user from admin panel**
4. **Verify user receives appropriate email**

## Security Considerations

1. **Never expose email service credentials** in client-side code
2. **Use environment variables** for all sensitive data
3. **Implement rate limiting** for email sending
4. **Validate email addresses** before sending
5. **Use HTTPS** for all email service communications

## Troubleshooting

### Common Issues

1. **Emails not sending:**

   - Check email service credentials
   - Verify email templates are correct
   - Check browser console for errors

2. **Admin not receiving notifications:**

   - Verify admin email is correct
   - Check email service configuration
   - Ensure admin user has correct role

3. **Users not receiving notifications:**
   - Check user email addresses
   - Verify email service is working
   - Check spam folders

### Debug Mode

Enable debug logging by setting:

```typescript
const DEBUG_EMAIL = true; // Set to true for debugging
```

This will log all email data to the console for testing purposes.

## Production Deployment

1. **Set up proper email service** (not just console logging)
2. **Configure environment variables** on your hosting platform
3. **Test email delivery** in production environment
4. **Set up email monitoring** and error handling
5. **Configure email templates** with your branding

## Support

For issues with the email system:

1. Check the browser console for errors
2. Verify email service configuration
3. Test with a simple email first
4. Check email service provider documentation
