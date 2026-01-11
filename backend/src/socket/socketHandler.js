import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const socketHandler = async (socket, io) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      socket.disconnect();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        socket.disconnect();
        return;
      }

      socket.join(user._id.toString());

      socket.join(user.organization.toString());

      socket.userId = user._id.toString();
      socket.organizationId = user.organization.toString();

      socket.on('disconnect', () => {
      });

      socket.on('video:upload:progress', (data) => {
        io.to(socket.userId).emit('video:upload:progress', data);
      });

      socket.on('video:status:request', async (videoId) => {
      });

    } catch (error) {
      socket.disconnect();
    }
  } catch (error) {
    socket.disconnect();
  }
};

export default socketHandler;
