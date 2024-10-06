import express from 'express';
import path from 'path';
import saveJsonToRedis from '../redis/stage.js';
import { fileURLToPath } from 'url';

const router = express.Router();

const itemRouter = (client) => {
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const itemData = await client.get(`item:${id}`);
      if (itemData) {
        const item = JSON.parse(itemData);
        res.status(200).json(item);
      } else {
        res.status(404).send('Item not found');
      }
    } catch (err) {
      console.error('Error fetching item from Redis:', err);
      res.status(500).send('Error fetching item');
    }
  });

  router.post('/save-json', async (req, res) => {
    console.log('save-json API 호출됨');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const jsonFilePath = path.join(__dirname, '../../assets/item.json');
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

export default itemRouter;
