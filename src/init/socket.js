import { Server as SocketIO } from 'socket.io';
import registerHandler from '../handlers/resister.handler.js';

const initSocket = (server) => {
  const io = new SocketIO();
  io.attach(server);

  registerHandler(io);
};

export default initSocket;
