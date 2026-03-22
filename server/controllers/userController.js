const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc      Update user profile / complete onboarding
// @route     PUT /api/users/profile
// @access    Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      displayName: req.body.displayName,
      workspaceName: req.body.workspaceName,
      workspaceHandle: req.body.workspaceHandle,
      onboarded: req.body.onboarded,
      bio: req.body.bio,
      avatar: req.body.avatar
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get user notifications
// @route     GET /api/users/notifications
// @access    Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Mark notification as read
// @route     PUT /api/users/notifications/:id/read
// @access    Private
exports.markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    // Make sure notification belongs to user
    if (notification.recipient.toString() !== req.user.id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Search users
// @route     GET /api/users/search
// @access    Private
exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(200).json({ success: true, data: [] });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } }
      ]
    }).limit(10).select('username displayName avatar');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Request to become an Admin
// @route     POST /api/users/request-admin
// @access    Private
exports.requestAdminRole = async (req, res, next) => {
  try {
    const { details } = req.body;
    
    if (!details) {
      return res.status(400).json({ success: false, error: 'Please provide request details' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role === 'admin' || user.role === 'super-admin') {
      return res.status(400).json({ success: false, error: 'You are already an admin' });
    }

    if (user.adminRequestStatus === 'pending') {
      return res.status(400).json({ success: false, error: 'Request is already pending' });
    }

    await User.findByIdAndUpdate(req.user.id, {
      adminRequestStatus: 'pending',
      adminRequestDetails: details
    });

    res.status(200).json({
      success: true,
      message: 'Admin request submitted successfully'
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get all pending admin requests
// @route     GET /api/users/admin-requests
// @access    Private/SuperAdmin
exports.getAdminRequests = async (req, res, next) => {
  try {
    const requests = await User.find({ adminRequestStatus: 'pending' })
      .select('username email avatar adminRequestDetails adminRequestStatus createdAt');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Manage admin request
// @route     PUT /api/users/admin-requests/:id
// @access    Private/SuperAdmin
exports.manageAdminRequest = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const updateData = { adminRequestStatus: status };
    if (status === 'approved') {
      updateData.role = 'admin';
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `Admin request ${status}`
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
