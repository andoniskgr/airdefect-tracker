// Email service utility for sending notifications
// This is a placeholder implementation - you'll need to integrate with a real email service

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface UserSignupData {
  email: string;
  userCode: string;
  createdAt: Date;
  userId: string;
}

export interface AdminNotificationData {
  adminEmail: string;
  userData: UserSignupData;
}

// Email templates
export const emailTemplates = {
  adminSignupNotification: (userData: UserSignupData, adminEmail: string) => ({
    to: adminEmail,
    subject: `New User Signup Request - ${userData.userCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New User Signup Request</h2>
        <p>A new user has requested access to the MCC Application:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">User Details:</h3>
          <p><strong>Email:</strong> ${userData.email}</p>
          <p><strong>User Code:</strong> ${userData.userCode}</p>
          <p><strong>Signup Date:</strong> ${userData.createdAt.toLocaleDateString()}</p>
        </div>
        
        <p>Please review and approve or reject this user's access request.</p>
        
        <div style="margin: 30px 0;">
          <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://your-app.com'}/admin/users" 
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Manage Users
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from the MCC Application.
        </p>
      </div>
    `,
    text: `New User Signup Request - ${userData.userCode}\n\nA new user has requested access:\nEmail: ${userData.email}\nUser Code: ${userData.userCode}\nSignup Date: ${userData.createdAt.toLocaleDateString()}\n\nPlease review at: ${typeof window !== 'undefined' ? window.location.origin : 'https://your-app.com'}/admin/users`
  }),

  userApprovalNotification: (userEmail: string, userCode: string) => ({
    to: userEmail,
    subject: 'Account Approved - MCC Application',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Account Approved!</h2>
        <p>Great news! Your account has been approved and you now have access to the MCC Application.</p>
        
        <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="margin-top: 0; color: #155724;">Your Account Details:</h3>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>User Code:</strong> ${userCode}</p>
        </div>
        
        <p>You can now log in to the application using either your email address or your user code.</p>
        
        <div style="margin: 30px 0;">
          <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://your-app.com'}/login" 
             style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login to Application
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from the MCC Application.
        </p>
      </div>
    `,
    text: `Account Approved!\n\nYour account has been approved and you now have access to the MCC Application.\n\nEmail: ${userEmail}\nUser Code: ${userCode}\n\nLogin at: ${typeof window !== 'undefined' ? window.location.origin : 'https://your-app.com'}/login`
  }),

  userRejectionNotification: (userEmail: string, userCode: string, reason?: string) => ({
    to: userEmail,
    subject: 'Account Access Denied - MCC Application',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Account Access Denied</h2>
        <p>We're sorry, but your account access request has been denied.</p>
        
        <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h3 style="margin-top: 0; color: #721c24;">Account Details:</h3>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>User Code:</strong> ${userCode}</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        
        <p>If you believe this is an error, please contact the administrator.</p>
        
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from the MCC Application.
        </p>
      </div>
    `,
    text: `Account Access Denied\n\nYour account access request has been denied.\n\nEmail: ${userEmail}\nUser Code: ${userCode}${reason ? `\nReason: ${reason}` : ''}\n\nIf you believe this is an error, please contact the administrator.`
  })
};

// Placeholder email service - replace with actual email service integration
export class EmailService {
  private static instance: EmailService;
  private adminEmail: string;

  constructor(adminEmail: string) {
    this.adminEmail = adminEmail;
  }

  static getInstance(adminEmail?: string): EmailService {
    if (!EmailService.instance) {
      if (!adminEmail) {
        throw new Error('Admin email is required for first initialization');
      }
      EmailService.instance = new EmailService(adminEmail);
    }
    return EmailService.instance;
  }

  // Send email notification to admin about new user signup
  async sendAdminSignupNotification(userData: UserSignupData): Promise<boolean> {
    try {
      const emailData = emailTemplates.adminSignupNotification(userData, this.adminEmail);
      console.log('Sending admin notification:', emailData);
      
      // TODO: Replace with actual email service integration
      // For now, we'll just log the email data
      // In production, integrate with services like:
      // - EmailJS
      // - SendGrid
      // - AWS SES
      // - Nodemailer with SMTP
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Admin notification sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send admin notification:', error);
      return false;
    }
  }

  // Send approval notification to user
  async sendUserApprovalNotification(userEmail: string, userCode: string): Promise<boolean> {
    try {
      const emailData = emailTemplates.userApprovalNotification(userEmail, userCode);
      console.log('Sending user approval notification:', emailData);
      
      // TODO: Replace with actual email service integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('User approval notification sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send user approval notification:', error);
      return false;
    }
  }

  // Send rejection notification to user
  async sendUserRejectionNotification(userEmail: string, userCode: string, reason?: string): Promise<boolean> {
    try {
      const emailData = emailTemplates.userRejectionNotification(userEmail, userCode, reason);
      console.log('Sending user rejection notification:', emailData);
      
      // TODO: Replace with actual email service integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('User rejection notification sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send user rejection notification:', error);
      return false;
    }
  }

  // Generic email sending method
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      console.log('Sending email:', emailData);
      
      // TODO: Replace with actual email service integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Email sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
}

// Configuration
export const EMAIL_CONFIG = {
  // Set your admin email here
  ADMIN_EMAIL: import.meta.env.VITE_ADMIN_EMAIL || 'admin@mcc-application.com',
  
  // Email service settings (to be configured with actual service)
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
};

// Initialize email service
export const emailService = EmailService.getInstance(EMAIL_CONFIG.ADMIN_EMAIL);
