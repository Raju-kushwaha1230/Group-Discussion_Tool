const {
  updateProfile,
  getNotifications,
  markNotificationRead,
  searchUsers,
  requestAdminRole,
  getAdminRequests,
  manageAdminRequest
} = require('../controllers/userController');
const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All user routes are protected

router.put('/profile', updateProfile);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.get('/search', searchUsers);

// Admin Role Promotion
router.post('/request-admin', requestAdminRole);
router.get('/admin-requests', authorize('super-admin'), getAdminRequests);
router.put('/admin-requests/:id', authorize('super-admin'), manageAdminRequest);

module.exports = router;
