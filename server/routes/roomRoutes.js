const express = require('express');
const {
  getRooms,
  getRoomById,
  createRoom,
  joinRoom,
  searchRooms
} = require('../controllers/roomController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/search', searchRooms);

router
  .route('/')
  .get(getRooms)
  .post(createRoom);

router
  .route('/:id')
  .get(getRoomById);

router
  .route('/:id/join')
  .post(joinRoom);

module.exports = router;
