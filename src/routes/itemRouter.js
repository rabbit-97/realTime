import express from 'express';

const router = express.Router();

const itemRouter = (client) => {
  router.get('/verify-item-score/:itemId/:score', async (req, res) => {
    const { itemId, score } = req.params;
    try {
      const storedScore = await client.hGet(`item:${itemId}`, 'score');
      if (storedScore !== null && Number(storedScore) === Number(score)) {
        res.status(200).json({ valid: true });
      } else {
        res.status(200).json({ valid: false });
      }
    } catch (err) {
      console.error('Error verifying item score:', err);
      res.status(500).send('Error verifying item score');
    }
  });

  return router;
};

export default itemRouter;
