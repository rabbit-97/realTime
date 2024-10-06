import express from 'express';

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

  return router;
};

export default stageRouter;
