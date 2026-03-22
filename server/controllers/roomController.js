const Room = require('../models/Room');

// @desc      Get all rooms
// @route     GET /api/rooms
// @access    Private
exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ isActive: true }).populate('creator', 'username');
    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get single room
// @route     GET /api/rooms/:id
// @access    Private
exports.getRoomById = async (req, res, next) => {
  try {
    const id = req.params.id;
    let room;

    // Check if it's a valid ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      room = await Room.findById(id).populate('creator', 'username');
    } else {
      // Otherwise, search by name
      room = await Room.findOne({ name: id }).populate('creator', 'username');
    }

    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Create new room
// @route     POST /api/rooms
// @access    Private
exports.createRoom = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.creator = req.user.id;

    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Join a room (check participants, etc.)
// @route     POST /api/rooms/:id/join
// @access    Private
exports.joinRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    if (!room.isActive) {
      return res.status(400).json({ success: false, error: 'Room is not active' });
    }

    // You could add participant limit check here if you track current participants in DB
    // For now, we just return success to allow the socket connection to proceed

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
// @desc      Search rooms
// @route     GET /api/rooms/search
// @access    Private
exports.searchRooms = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(200).json({ success: true, data: [] });
    }

    const rooms = await Room.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { topic: { $regex: q, $options: 'i' } }
      ]
    }).limit(10).populate('creator', 'username');

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
