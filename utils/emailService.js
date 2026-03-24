/**
 * Email Service - Disabled (No SendGrid)
 */

const emailTemplates = {
  passwordReset: (otp) => ({
    subject: 'Password Reset OTP - Qgenz',
    text: `Your password reset OTP is: ${otp}\nThis OTP expires in 10 minutes.`,
  }),

  supportConfirmation: (name) => ({
    subject: 'Support Request Received - Qgenz',
    text: `Dear ${name},\nWe received your request.`,
  }),

  supportReply: (name, originalMessage, reply) => ({
    subject: 'Support Reply - Qgenz',
    text: `Dear ${name}\n\nYour message: ${originalMessage}\nReply: ${reply}`,
  })
};

const sendPasswordResetOTP = async (email, otp) => {
  const template = emailTemplates.passwordReset(otp);

  console.log("EMAIL:", {
    to: email,
    subject: template.subject,
    text: template.text
  });

  return { success: true };
};

const sendSupportConfirmation = async (email, name) => {
  const template = emailTemplates.supportConfirmation(name);

  console.log("EMAIL:", {
    to: email,
    subject: template.subject,
    text: template.text
  });

  return { success: true };
};

const sendSupportReply = async (email, name, originalMessage, reply) => {
  const template = emailTemplates.supportReply(name, originalMessage, reply);

  console.log("EMAIL:", {
    to: email,
    subject: template.subject,
    text: template.text
  });

  return { success: true };
};

module.exports = {
  sendPasswordResetOTP,
  sendSupportConfirmation,
  sendSupportReply
};