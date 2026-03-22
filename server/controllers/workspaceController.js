const Workspace = require('../models/Workspace');
const User = require('../models/User');

// @desc      Create a workspace request
// @route     POST /api/workspaces
// @access    Private
exports.createWorkspace = async (req, res, next) => {
  try {
    req.body.owner = req.user.id;
    
    // Only admins or super-admins can create workspaces
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, error: 'You must be an approved Admin to create a workspace' });
    }

    // Check if user already owns a workspace
    const existing = await Workspace.findOne({ owner: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, error: 'User already has a workspace request' });
    }

    const workspace = await Workspace.create(req.body);

    res.status(201).json({
      success: true,
      data: workspace
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get all workspaces (Admin only)
// @route     GET /api/workspaces
// @access    Private/Admin
exports.getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find()
      .populate('owner', 'username email')
      .populate('members.user', 'username email avatar displayName');

    res.status(200).json({
      success: true,
      count: workspaces.length,
      data: workspaces
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Approve/Reject workspace
// @route     PUT /api/workspaces/:id/status
// @access    Private/Admin
exports.updateWorkspaceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const workspace = await Workspace.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });

    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    // If approved, update the owner's workspace info and promote to admin
    if (status === 'approved') {
      await User.findByIdAndUpdate(workspace.owner, {
        workspaceName: workspace.name,
        workspaceHandle: workspace.handle,
        $push: { workspaces: { workspace: workspace._id, role: 'admin', status: 'approved' } }
      });
    }

    res.status(200).json({
      success: true,
      data: workspace
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Request to join a workspace
// @route     POST /api/workspaces/:id/join
// @access    Private
exports.requestToJoin = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    // Check if already a member or pending
    const existingMember = workspace.members.find(m => m.user.toString() === req.user.id);
    if (existingMember) {
      return res.status(400).json({ success: false, error: 'Already requested or a member' });
    }

    // Add to workspace members list
    workspace.members.push({ user: req.user.id, status: 'pending' });
    await workspace.save();

    // Add to user's workspaces list
    await User.findByIdAndUpdate(req.user.id, {
      $push: { workspaces: { workspace: workspace._id, role: 'user', status: 'pending' } }
    });

    res.status(200).json({
      success: true,
      message: 'Join request sent successfully'
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Approve/Reject join request
// @route     PUT /api/workspaces/:id/members/:userId
// @access    Private (Workspace Admin/Super Admin)
exports.manageJoinRequest = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    // Authorization check: Must be workspace owner or super-admin
    if (workspace.owner.toString() !== req.user.id && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to manage members' });
    }

    const member = workspace.members.find(m => m.user.toString() === req.params.userId);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Join request not found' });
    }

    member.status = status;
    await workspace.save();

    // Update user's workspace status
    await User.findOneAndUpdate(
      { _id: req.params.userId, 'workspaces.workspace': workspace._id },
      { $set: { 'workspaces.$.status': status } }
    );

    res.status(200).json({
      success: true,
      message: `Member request ${status}`
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Search workspaces
// @route     GET /api/workspaces/search
// @access    Private
exports.searchWorkspaces = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(200).json({ success: true, data: [] });
    }

    const workspaces = await Workspace.find({
      status: 'approved',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { handle: { $regex: q, $options: 'i' } }
      ]
    }).limit(10).populate('owner', 'username displayName avatar');

    res.status(200).json({
      success: true,
      count: workspaces.length,
      data: workspaces
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
