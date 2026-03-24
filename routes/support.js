const express = require('express');
const router = express.Router();
const SupportMessage = require('../models/SupportMessage');
const { isAdmin } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

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

    // Send confirmation email (currently disabled)
    console.log(`[EMAIL] Support confirmation would be sent to: ${email}`);

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

    // Send reply email to customer (currently disabled)
    console.log(`[EMAIL] Support reply would be sent to: ${message.email}`);

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