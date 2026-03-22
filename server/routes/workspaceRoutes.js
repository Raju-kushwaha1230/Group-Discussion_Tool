const express = require('express');
const { 
  createWorkspace, 
  getWorkspaces, 
  updateWorkspaceStatus,
  requestToJoin,
  manageJoinRequest,
  searchWorkspaces
} = require('../controllers/workspaceController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', createWorkspace);
router.get('/search', searchWorkspaces);
router.get('/', authorize('admin', 'super-admin'), getWorkspaces);
router.put('/:id/status', authorize('super-admin'), updateWorkspaceStatus);

router.post('/:id/join', requestToJoin);
router.put('/:id/members/:userId', manageJoinRequest);

module.exports = router;
