import { getGameAssets } from '../init/assets.js';
import { getStage, setStage, clearStage } from '../models/stage.model.js';

export const gameStart = (uuid, payload) => {
  const { stages } = getGameAssets();

  if (!stages || !stages.data || stages.data.length === 0) {
    console.error('Stages data is not available');
    return { status: 'fail', message: 'Stages data is not available' };
  }

  clearStage(uuid);
  // 스테이지스 배열에서 0번째 - 첫번째 스테이지
  setStage(uuid, stages.data[0].id, payload.timestamp, 0);
  console.log('Stage: ', getStage(uuid));

  return { status: 'success' };
};

export const gameEnd = (uuid, payload) => {
  // 클라이언트는 게임 종료시 타임 스탬프와 총 점수를 전달
  const { timestamp: gameEndTime, score } = payload;
  const stages = getStage(uuid);

  if (!stages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  // 각 스테이지의 지속 시간을 계산하여 총 점수 계산
  let totalScore = 0;

  stages.forEach((stage, index) => {
    let stageEndTime;
    if (index === stages.length - 1) {
      stageEndTime = gameEndTime;
    } else {
      stageEndTime = stages[index + 1].timestamp;
    }

    const stageDuration = (stageEndTime - stage.timestamp) / 1000;
    totalScore += stageDuration;
  });

  // 점수와 타임스탬프 검증
  // 오차 범위 5 허용
  if (Math.abs(score - totalScore) > 5) {
    return { status: 'fail', message: 'Score verification failed' };
  }

  // 다음 스테이지 계산
  const currentStage = stages[stages.length - 1].id;
  const nextStage = currentStage + 1;

  return {
    status: 'success',
    message: 'Game ended',
    score: totalScore,
    nextStage: nextStage,
  };
};

export const updateScore = (userId, payload) => {
  const stages = getStage(userId);

  if (!stages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  // 현재 스테이지를 가져옴
  const currentStage = stages[stages.length - 1];
  const newScore = (currentStage.score || 0) + payload.score;

  // 현재 스테이지의 점수를 업데이트
  setStage(userId, currentStage.id, currentStage.timestamp, newScore);
  console.log(`Updated score for user ${userId}: ${newScore}`);

  return { status: 'success', updatedScore: newScore };
};
