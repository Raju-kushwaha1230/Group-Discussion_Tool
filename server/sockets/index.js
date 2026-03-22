const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { getRedisClient } = require('../config/redis');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');

const initSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
  });

  // Setup Redis Adapter
  const redisClient = getRedisClient();
  if (redisClient) {
    const pubClient = redisClient.duplicate();
    const subClient = redisClient.duplicate();
    Promise.all([pubClient.connect(), subClient.connect()])
      .then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        console.log('Redis adapter configured');
      });
  }

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication error: No token provided'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('Authentication error: User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);

    socket.on('join', async ({ room }) => {
      try {
        const roomName = room || 'General';
        let roomDoc = await Room.findOne({ name: roomName });

        // Auto-create room if it doesn't exist (for prototype simplicity, usually restricted to API)
        if (!roomDoc) {
          roomDoc = await Room.create({
            name: roomName,
            creator: socket.user._id,
            topic: 'General Discussion'
          });
        }

        socket.join(roomName);
        socket.currentRoom = roomName;

        // Fetch last 50 messages
        const messages = await Message.find({ room: roomDoc._id })
          .sort({ createdAt: -1 })
          .limit(50)
          .populate('sender', 'username');

        socket.emit('message_history', messages.reverse().map(m => ({
          id: m._id,
          sender: m.sender.username,
          text: m.text,
          timestamp: m.createdAt,
          room: roomName,
          reactions: m.reactions
        })));

        const systemMessage = {
          id: `sys-${Date.now()}`,
          type: 'system',
          text: `${socket.user.username} joined the discussion.`,
          timestamp: new Date().toISOString(),
          room: roomName
        };

        io.to(roomName).emit('system_message', systemMessage);

        // Update user list for the room
        const clients = await io.in(roomName).fetchSockets();
        const userList = clients.map(s => s.user.username);
        io.to(roomName).emit('user_list', userList);
      } catch (err) {
        console.error('Socket Join Error:', err);
      }
    });

    socket.on('send_message', async (data) => {
      try {
        if (!socket.currentRoom) return;

        const roomDoc = await Room.findOne({ name: socket.currentRoom });
        if (!roomDoc) return;

        const newMessage = await Message.create({
          room: roomDoc._id,
          sender: socket.user._id,
          text: data.text
        });

        const messagePayload = {
          id: newMessage._id,
          sender: socket.user.username,
          text: data.text,
          timestamp: newMessage.createdAt,
          room: socket.currentRoom,
          reactions: []
        };

        io.to(socket.currentRoom).emit('receive_message', messagePayload);
      } catch (err) {
        console.error('Send Message Error:', err);
      }
    });

    socket.on('message_reaction', async ({ messageId, emoji }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        // Simple reaction logic: Toggle user in reactions
        let reaction = message.reactions.find(r => r.emoji === emoji);
        if (!reaction) {
          message.reactions.push({ emoji, users: [socket.user._id] });
        } else {
          const userIndex = reaction.users.indexOf(socket.user._id);
          if (userIndex > -1) {
            reaction.users.splice(userIndex, 1);
            if (reaction.users.length === 0) {
              message.reactions = message.reactions.filter(r => r.emoji !== emoji);
            }
          } else {
            reaction.users.push(socket.user._id);
          }
        }

        await message.save();
        io.to(socket.currentRoom).emit('reaction_update', { 
          messageId, 
          reactions: message.reactions 
        });
      } catch (err) {
        console.error('Reaction Error:', err);
      }
    });

    socket.on('raise_hand', () => {
      if (socket.currentRoom) {
        io.to(socket.currentRoom).emit('user_hand_raised', {
          username: socket.user.username,
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('typing', () => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('user_typing', socket.user.username);
      }
    });

    socket.on('stop_typing', () => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('user_stopped_typing', socket.user.username);
      }
    });

    socket.on('mute_user', async ({ username }) => {
      // Basic Admin check
      if (socket.user.role === 'admin') {
        io.to(socket.currentRoom).emit('user_muted', { username, mutedBy: socket.user.username });
      }
    });

    socket.on('disconnect', async () => {
      if (socket.currentRoom) {
        io.to(socket.currentRoom).emit('system_message', {
          id: `sys-out-${Date.now()}`,
          type: 'system',
          text: `${socket.user.username} left the discussion.`,
          timestamp: new Date().toISOString(),
          room: socket.currentRoom
        });

        // Update user list for the room
        const clients = await io.in(socket.currentRoom).fetchSockets();
        const userList = clients.map(s => s.user.username);
        io.to(socket.currentRoom).emit('user_list', userList);
      }
    });
  });
};

module.exports = initSockets;
