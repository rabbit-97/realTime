import express from 'express';

const router = express.Router();

const scoreRouter = (client) => {
  router.get('/leaderboard', async (req, res) => {
    try {
      const leaderboard = await client.zRangeWithScores('leaderboard', 0, -1, { REV: true });
      res.status(200).json(leaderboard);
    } catch (err) {
      console.error('Error getting leaderboard:', err);
      res.status(500).send('Error getting leaderboard');
    }
  });

  router.post('/save-score', async (req, res) => {
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

  router.get('/get-score/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const score = await client.zScore('leaderboard', userId);
      if (score !== null) {
        res.status(200).json({ userId, score });
      } else {
        res.status(404).send('User not found');
      }
    } catch (err) {
      console.error('Error getting score:', err);
      res.status(500).send('Error getting score');
    }
  });

  return router;
};

export default scoreRouter;
