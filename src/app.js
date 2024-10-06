import express from 'express';
import { createServer } from 'http';
import { loadGameAssets } from './init/assets.js';
import initSocket from './init/socket.js';
import { createClient } from 'redis';

const app = express();
const server = createServer(app);

const client = createClient({
  url: 'redis://localhost:6379', // 레디스 서버 URL을 올바르게 설정합니다.
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

app.use('/handlers', express.static('src/handlers'));

app.post('/save-score', async (req, res) => {
  const { userId, score } = req.body;
  try {
    const currentScore = await client.zScore('leaderboard', userId);
    if (currentScore === null || score > currentScore) {
      await client.zAdd('leaderboard', { score: parseInt(score, 10), value: userId });
      res.status(200).send('Score saved successfully');
    } else {
      res.status(200).send('Score not updated, current score is higher or equal');
    }
  } catch (err) {
    console.error('Error saving score:', err);
    res.status(500).send('Error saving score');
  }
});

// 점수 가져오기
app.get('/get-score/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const score = await client.zScore('leaderboard', userId);
    res.status(200).json({ score });
  } catch (err) {
    console.error('Error getting score:', err);
    res.status(500).send('Error getting score');
  }
});

app.post('/save-user', async (req, res) => {
  const { userId, userInfo } = req.body;
  try {
    await client.set(`user:${userId}:info`, JSON.stringify(userInfo));
    res.status(200).send('User info saved');
  } catch (err) {
    console.error('Error saving user info:', err);
    res.status(500).send('Error saving user info');
  }
});

app.get('/get-user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const userInfo = await client.get(`user:${userId}:info`);
    res.status(200).json({ userInfo: JSON.parse(userInfo) });
  } catch (err) {
    console.error('Error getting user info:', err);
    res.status(500).send('Error getting user info');
  }
});

app.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await client.zRangeWithScores('leaderboard', 0, -1, { REV: true });
    res.status(200).json(leaderboard);
  } catch (err) {
    console.error('Error getting leaderboard:', err);
    res.status(500).send('Error getting leaderboard');
  }
});

const PORT = 3000;

app.use(express.static('public'));
app.use('/assets', express.static('assets'));

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
    console.error('Error loading assets:', err);
  }
  initSocket(server);
});
