const stages = {};

export const createStage = (uuid) => {
  stages[uuid] = [];
};

export const getStage = (uuid) => {
  return stages[uuid];
};

export const setStage = (userId, stageId, timestamp, score = 0) => {
  console.log(
    `Setting stage for user ${userId}: stageId=${stageId}, timestamp=${timestamp}, score=${score}`,
  );
  if (!stages[userId]) {
    stages[userId] = [];
  }
  stages[userId].push({ id: stageId, timestamp, score });
};

export const clearStage = (uuid) => {
  return (stages[uuid] = []);
};
