import express from 'express';
import path from 'path';
import saveJsonToRedis from '../redis/stage.js';
import { fileURLToPath } from 'url';

const router = express.Router();

const itemUnlockRouter = (client) => {
  router.get('/:itemId', async (req, res) => {
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
    console.log('save-json API 호출됨');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const jsonFilePath = path.join(__dirname, '../../assets/item_unlock.json');
    console.log(`JSON 파일 경로: ${jsonFilePath}`);

    try {
      await saveJsonToRedis(client, jsonFilePath);
      res.status(200).json({ message: 'JSON 파일이 성공적으로 Redis에 저장되었습니다.' });
    } catch (err) {
      res.status(500).json({ message: 'Redis 저장 중 오류가 발생했습니다.', error: err.message });
    }
  });

  return router;
};

export default itemUnlockRouter;
