import express from 'express';
import { createServer } from 'http';
import { createClient } from 'redis';
import path from 'path';
import { fileURLToPath } from 'url';
import initSocket from './init/socket.js';
import itemRouter from './routes/itemRouter.js';
import userRouter from './routes/userRouter.js';
import scoreRouter from './routes/scoreRouter.js';
import stageRouter from './routes/stageRouter.js';
import itemUnlockRouter from './routes/itemUnlockRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

const client = createClient({
  url: 'redis://localhost:6379',
});

client.on('connect', () => {
  console.log('Connected to Redis...');
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

await client.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
initSocket(server);
app.use(express.static(path.join(__dirname, '../public')));
app.use('/handlers', express.static('src/handlers'));

app.use('/api/items', itemRouter(client));
app.use('/api/users', userRouter(client));
app.use('/api/scores', scoreRouter(client));
app.use('/api/stages', stageRouter(client));
app.use('/api/item-unlock', itemUnlockRouter(client));

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
