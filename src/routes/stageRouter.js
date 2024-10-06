import express from 'express';
import path from 'path';
import saveJsonToRedis from '../redis/stage.js';
import { fileURLToPath } from 'url';

const router = express.Router();

const stageRouter = (client) => {
  router.get('/get-score/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const score = await client.zScore('leaderboard', userId);
      res.status(200).json({ score });
    } catch (err) {
      console.error('Error getting score:', err);
      res.status(500).send('Error getting score');
    }
  });

  // 새로운 스테이지 검증 API
  router.get('/get-stage/:score', async (req, res) => {
    const { score } = req.params;
    try {
      const stageData = await client.get('stageData');
      if (!stageData) {
        throw new Error('Stage data not found');
      }
      const stages = JSON.parse(stageData);

      // 주어진 점수 이상에 해당하는 스테이지 찾기
      const currentStage = stages.reduce((acc, stage) => {
        if (parseInt(score) >= stage.score) {
          return stage.id;
        }
        return acc;
      }, stages[0].id);

      res.status(200).json({ stage: currentStage });
    } catch (err) {
      console.error('Error getting stage:', err);
      res.status(500).send('Error getting stage');
    }
  });

  router.post('/save-json', async (req, res) => {
    console.log('save-json API 호출됨');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const jsonFilePath = path.join(__dirname, '../../assets/stage.json');
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

export default stageRouter;
