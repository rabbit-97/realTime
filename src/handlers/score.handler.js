import redisClient from '../init/redis.js';

export const submitScoreHandler = async (userId, payload) => {
  const { nickname, score } = payload;

  try {
    // 사용자 점수 저장
    await redisClient.zadd('highScores', score, nickname);

    // 상위 10개의 점수 가져오기
    const highScores = await redisClient.zrevrange('highScores', 0, 9, 'WITHSCORES');

    // 점수 형식 변환
    const formattedHighScores = [];
    for (let i = 0; i < highScores.length; i += 2) {
      formattedHighScores.push({ nickname: highScores[i], score: parseInt(highScores[i + 1], 10) });
    }

    return {
      status: 'success',
      message: 'Score submitted successfully',
      highScores: formattedHighScores,
    };
  } catch (err) {
    console.error('Error submitting score:', err);
    return {
      status: 'error',
      message: 'Error submitting score',
    };
  }
};
