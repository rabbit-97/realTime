import { addUser } from '../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';
import { handleConnection, handleDisconnect } from './helper.js';
import { handlerEvent } from './helper.js';

// 랭킹을 저장할 배열을 선언합니다.
let rankings = [];

const registerHandler = (io) => {
  io.on('connection', (socket) => {
    const userUUID = uuidv4();
    addUser({ uuid: userUUID, socketId: socket.id });

    handleConnection(socket, userUUID);

    socket.on('updateRanking', ({ score, nickname }) => {
      rankings.push({ score, nickname });
      rankings.sort((a, b) => b.score - a.score);
      rankings = rankings.slice(0, 5);
      io.emit('rankingUpdate', rankings);
    });

    socket.on('event', (data) => handlerEvent(io, socket, data));
    socket.on('disconnect', (socket) => handleDisconnect(socket, userUUID));
  });
};

export default registerHandler;
