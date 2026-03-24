const express = require('express');
const router = express.Router();
const SupportMessage = require('../models/SupportMessage');
const { isAdmin } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Create a new support message
router.post('/messages', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    const supportMessage = new SupportMessage({
      name,
      email,
      message,
      timestamp: new Date(),
      status: 'unresolved'
    });

    await supportMessage.save();

    // Log activity
    await logActivity('support_message', null, `New support message from ${name}`, {
      email,
      messageId: supportMessage._id
    });

    // Send confirmation email
    const msg = {
      to: email,
      from: {
        email: process.env.SUPPORT_EMAIL,
        name: 'Qgenz Support'
      },
      subject: 'Support Request Received - Qgenz',
      text: `Dear ${name},\n\nThank you for contacting Qgenz support. We have received your message and will get back to you as soon as possible.\n\nBest regards,\nQgenz Support Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Support Request Received</h2>
          <p>Dear ${name},</p>
          <p>Thank you for contacting Qgenz support. We have received your message and will get back to you as soon as possible.</p>
          <p>Best regards,<br>Qgenz Support Team</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    res.json({ success: true, message: supportMessage });
  } catch (error) {
    console.error('Error creating support message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create support message' 
    });
  }
});

// Get all support messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await SupportMessage.find()
      .sort({ timestamp: -1 });
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching support messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch support messages' 
    });
  }
});

// Update message status
router.put('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const message = await SupportMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    res.json({ success: true, message });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update message status' 
    });
  }
});

// Add reply to message
router.post('/messages/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const message = await SupportMessage.findByIdAndUpdate(
      id,
      { reply },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    // Send reply email to customer
    const msg = {
      to: message.email,
      from: {
        email: process.env.SUPPORT_EMAIL,
        name: 'Qgenz Support'
      },
      subject: 'Reply to your support request - Qgenz',
      text: `Dear ${message.name},\n\nThank you for contacting Qgenz support. Here is our reply to your message:\n\n"${message.message}"\n\nOur response:\n${reply}\n\nBest regards,\nQgenz Support Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Qgenz Support Reply</h2>
          <p>Dear ${message.name},</p>
          <p>Thank you for contacting Qgenz support. Here is our reply to your message:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Your message:</strong></p>
            <p>${message.message}</p>
          </div>
          <div style="background-color: #eef2ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Our response:</strong></p>
            <p>${reply}</p>
          </div>
          <p>Best regards,<br>Qgenz Support Team</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    res.json({ success: true, message });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add reply' 
    });
  }
});

module.exports = router; 