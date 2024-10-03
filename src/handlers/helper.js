import { CLIENT_VERSION } from '../constants.js';
import { createStage } from '../models/stage.model.js';
import { getUser, removeUser } from '../models/user.model.js';
import handlerMappings from './handlerMapping.js';

export const handleDisconnect = (socket, uuid) => {
  removeUser(socket.id);
  console.log(`User disconnected: ${socket.id}`);
  console.log('current users:', getUser());
};

export const handleConnection = (socket, uuid) => {
  console.log(`New user connected: ${uuid} with socket id ${socket.id}`);
  console.log('current users: ', getUser());

  createStage(uuid);

  socket.emit('connection', { uuid });
};

export const handlerEvent = (io, socket, data) => {
  console.log('Received event:', data);

  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    console.log('Client version mismatch:', data.clientVersion);
    socket.emit('response', { status: 'fail', message: 'Client version mismatch' });
    return;
  }

  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    console.log('Handler not found:', data.handlerId);
    socket.emit('response', { status: 'fail', message: 'handler not found' });
    return;
  }

  console.log('Executing handler:', data.handlerId);
  const response = handler(data.userId, data.payload);
  console.log('Handler response:', response);

  if (data.handlerId === 'submitScore') {
    console.log('Broadcasting ranking update');
    io.emit('rankingUpdate', response.scores);
  } else if (response.broadcast) {
    console.log('Broadcasting response');
    io.emit('response', response);
    return;
  }

  console.log('Emitting response to client');
  socket.emit('response', response);
};
