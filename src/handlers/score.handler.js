let highScores = [];

export const submitScoreHandler = (userId, payload) => {
  const { nickname, score } = payload;

  highScores.push({ nickname, score });
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 10);

  return {
    status: 'success',
    message: 'Score submitted successfully',
    highScores: highScores,
  };
};
