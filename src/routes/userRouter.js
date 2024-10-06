import express from 'express';

const router = express.Router();

const userRouter = (client) => {
  router.get('/get-user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await client.hGetAll(`user:${userId}`);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      console.error('Error getting user:', err);
      res.status(500).send('Error getting user');
    }
  });

  router.post('/save-user', async (req, res) => {
    const { userId, userData } = req.body;
    try {
      await client.hSet(`user:${userId}`, userData);
      res.status(200).send('User saved successfully');
    } catch (err) {
      console.error('Error saving user:', err);
      res.status(500).send('Error saving user');
    }
  });

  return router;
};

export default userRouter;
