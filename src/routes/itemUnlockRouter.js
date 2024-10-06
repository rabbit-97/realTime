import express from 'express';
import path from 'path';
import saveJsonToRedis from '../redis/stage.js';

const router = express.Router();

const itemUnlockRouter = (client) => {
  router.get('/unlock-item/:itemId', async (req, res) => {
    const { itemId } = req.params;
    try {
      const isUnlocked = await client.hGet(`item:${itemId}`, 'unlocked');
      if (isUnlocked === 'true') {
        res.status(200).json({ unlocked: true });
      } else {
        res.status(200).json({ unlocked: false });
      }
    } catch (err) {
      console.error('Error unlocking item:', err);
      res.status(500).send('Error unlocking item');
    }
  });

  router.post('/save-json', async (req, res) => {
    const jsonFilePath = path.join(__dirname, '../assets/item_unlock.json');
    try {
      await saveJsonToRedis(redisClient, jsonFilePath);
      res.status(200).json({ message: 'JSON 파일이 성공적으로 Redis에 저장되었습니다.' });
    } catch (err) {
      res.status(500).json({ message: 'Redis 저장 중 오류가 발생했습니다.', error: err.message });
    }
  });

  return router;
};

export default itemUnlockRouter;
