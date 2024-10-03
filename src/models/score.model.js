let scores = [];

export const addScore = (nickname, score) => {
  scores.push({ nickname, score });
  scores.sort((a, b) => b.score - a.score);
};

export const getScores = (limit = 10) => {
  return scores.slice(0, limit);
};
