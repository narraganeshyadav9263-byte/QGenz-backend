const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email templates
const emailTemplates = {
  passwordReset: (otp) => ({
    subject: 'Password Reset OTP - Qgenz',
    text: `Your password reset OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://your-logo-url.com/logo.png" alt="Qgenz Logo" style="max-width: 150px;">
          </div>
          <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #4F46E5; text-align: center; margin-bottom: 20px;">Password Reset OTP</h1>
            <p style="margin-bottom: 20px;">You requested a password reset. Use the following OTP to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; display: inline-block;">
                <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #4F46E5;">${otp}</span>
              </div>
            </div>
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">This OTP will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">If you didn't request this, please ignore this email.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Qgenz. All rights reserved.</p>
          </div>
        </body>
      </html>
    `
  }),
  supportConfirmation: (name) => ({
    subject: 'Support Request Received - Qgenz',
    text: `Dear ${name},\n\nThank you for contacting Qgenz support. We have received your message and will get back to you as soon as possible.\n\nBest regards,\nQgenz Support Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Support Request Received</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://your-logo-url.com/logo.png" alt="Qgenz Logo" style="max-width: 150px;">
          </div>
          <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #4F46E5; text-align: center; margin-bottom: 20px;">Support Request Received</h1>
            <p style="margin-bottom: 20px;">Dear ${name},</p>
            <p style="margin-bottom: 20px;">Thank you for contacting Qgenz support. We have received your message and will get back to you as soon as possible.</p>
            <p style="margin-bottom: 20px;">Best regards,<br>Qgenz Support Team</p>
          </div>
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Qgenz. All rights reserved.</p>
          </div>
        </body>
      </html>
    `
  }),
  supportReply: (name, originalMessage, reply) => ({
    subject: 'Re: Your Qgenz Support Request',
    text: `Dear ${name},\n\nThank you for contacting Qgenz support. Here is our reply to your message:\n\n"${originalMessage}"\n\nOur response:\n${reply}\n\nBest regards,\nQgenz Support Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light">
          <meta name="supported-color-schemes" content="light">
          <title>Support Reply</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://your-logo-url.com/logo.png" alt="Qgenz Logo" style="max-width: 150px;">
          </div>
          <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #4F46E5; text-align: center; margin-bottom: 20px; font-size: 24px;">Support Reply</h1>
            <p style="margin-bottom: 20px; font-size: 16px;">Dear ${name},</p>
            <p style="margin-bottom: 20px; font-size: 16px;">Thank you for contacting Qgenz support. Here is our reply to your message:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #4F46E5;">
              <p style="margin-bottom: 10px; font-weight: bold; color: #4F46E5;">Your message:</p>
              <p style="margin: 0; font-size: 15px;">${originalMessage}</p>
            </div>
            <div style="background-color: #eef2ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #4F46E5;">
              <p style="margin-bottom: 10px; font-weight: bold; color: #4F46E5;">Our response:</p>
              <p style="margin: 0; font-size: 15px;">${reply}</p>
            </div>
            <p style="margin-bottom: 20px; font-size: 16px;">Best regards,<br><strong>Qgenz Support Team</strong></p>
          </div>
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Qgenz. All rights reserved.</p>
            <p style="margin-top: 10px;">This email was sent to ${email}. If you didn't request this support, please ignore this email.</p>
          </div>
        </body>
      </html>
    `
  })
};

const sendPasswordResetOTP = async (email, otp) => {
  try {
    const template = emailTemplates.passwordReset(otp);
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Qgenz'
      },
      subject: template.subject,
      text: template.text,
      html: template.html,
      trackingSettings: {
        clickTracking: { enable: false },
        openTracking: { enable: false }
      },
      mailSettings: {
        sandboxMode: { enable: false }
      }
    };

    await sgMail.send(msg);
    console.log('Password reset OTP email sent successfully');
  } catch (error) {
    console.error('Error sending password reset OTP email:', error);
    throw new Error('Failed to send password reset OTP email');
  }
};

const sendSupportConfirmation = async (email, name) => {
  try {
    const template = emailTemplates.supportConfirmation(name);
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Qgenz Support'
      },
      subject: template.subject,
      text: template.text,
      html: template.html,
      trackingSettings: {
        clickTracking: { enable: false },
        openTracking: { enable: false }
      },
      mailSettings: {
        sandboxMode: { enable: false }
      }
    };

    await sgMail.send(msg);
    console.log('Support confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending support confirmation email:', error);
    throw new Error('Failed to send support confirmation email');
  }
};

const sendSupportReply = async (email, name, originalMessage, reply) => {
  try {
    const template = emailTemplates.supportReply(name, originalMessage, reply);
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Qgenz Support'
      },
      replyTo: process.env.SENDGRID_REPLY_TO_EMAIL || process.env.SENDGRID_FROM_EMAIL,
      subject: template.subject,
      text: template.text,
      html: template.html,
      trackingSettings: {
        clickTracking: { enable: false },
        openTracking: { enable: false }
      },
      mailSettings: {
        sandboxMode: { enable: false }
      },
      headers: {
        'X-Entity-Ref-ID': `support-${Date.now()}`,
        'List-Unsubscribe': `<mailto:${process.env.SENDGRID_FROM_EMAIL}?subject=unsubscribe>`,
        'Precedence': 'bulk',
        'X-Auto-Response-Suppress': 'OOF, AutoReply'
      },
      customArgs: {
        support_ticket_id: `support-${Date.now()}`,
        user_email: email
      }
    };

    await sgMail.send(msg);
    console.log('Support reply email sent successfully');
  } catch (error) {
    console.error('Error sending support reply email:', error);
    throw new Error('Failed to send support reply email');
  }
};

module.exports = {
  sendPasswordResetOTP,
  sendSupportConfirmation,
  sendSupportReply
}; 