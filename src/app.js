import express from 'express';
import { createServer } from 'http';
import { loadGameAssets } from './init/assets.js';
import initSocket from './init/socket.js';

const app = express();
const server = createServer(app);

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
initSocket(server);
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(PORT, async () => {
  console.log(`server is running on port ${PORT}`);

  try {
    const assets = await loadGameAssets();
    console.log(assets);
    console.log('Assets loaded successfully');
  } catch (err) {
    console.error('실패', err);
  }
});
