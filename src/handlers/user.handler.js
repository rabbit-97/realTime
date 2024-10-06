import redisClient from '../init/redis.js';

export const saveUserInfo = async (userId, userInfo) => {
  try {
    await redisClient.set(`user:${userId}:info`, JSON.stringify(userInfo));
    return {
      status: 'success',
      message: 'User info saved successfully',
    };
  } catch (err) {
    console.error('Error saving user info:', err);
    return {
      status: 'error',
      message: 'Error saving user info',
    };
  }
};

export const getUserInfo = async (userId) => {
  try {
    const userInfo = await redisClient.get(`user:${userId}:info`);
    if (userInfo) {
      return {
        status: 'success',
        userInfo: JSON.parse(userInfo),
      };
    } else {
      return {
        status: 'error',
        message: 'User info not found',
      };
    }
  } catch (err) {
    console.error('Error getting user info:', err);
    return {
      status: 'error',
      message: 'Error getting user info',
    };
  }
};
