import { getGameAssets } from '../init/assets.js';
import { getStage, setStage } from '../models/stage.model.js';

export const moveStageHandler = (userId, payload) => {
  let currentStages = getStage(userId);
  console.log(`Current stages for user ${userId}:`, currentStages);

  if (!currentStages.length) {
    // 스테이지 정보가 없으면 초기화
    setStage(userId, payload.currentStage, Date.now(), payload.score);
    return { status: 'success', message: 'Stage initialized' };
  }

  // 오름차순 -> 가장 큰 스테이지 아이디를 확인 < 현재 유저의 스테이지
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];
  console.log(`Current stage for user ${userId}:`, currentStage);

  // 클라이언트와 서버 비교
  if (currentStage.id !== payload.currentStage) {
    console.log(`Stage mismatch: server ${currentStage.id}, client ${payload.currentStage}`);
    setStage(userId, payload.currentStage, Date.now(), payload.score);
    return { status: 'success', message: 'Stage updated' };
  }

  // 점수 검증
  const serverTime = Date.now();
  const elapsedTime = (serverTime - currentStage.timestamp) / 1000;
  console.log(`Elapsed time: ${elapsedTime} seconds`);

  // 1스테이지에서 2스테이지로 넘어가는 가정
  // 5 => 임의로 정한 오차범위
  if (elapsedTime < 100 || elapsedTime > 105) {
    console.log(`Invalid elapsed time: ${elapsedTime} seconds`);
    return { status: 'fail', message: 'Invalid elapsed time' };
  }

  // targetStage 대한 검증 < 게임 에셋에 존재하는지?
  const { stages } = getGameAssets();
  if (!stages.data.some((stage) => stage.id === payload.targetStage)) {
    console.log(`Target stage ${payload.targetStage} not found in game assets`);
    return { status: 'fail', message: 'target stage not found' };
  }

  // 점수 계산 로직 추가
  const scoreIncrement = elapsedTime * 2; // 1초당 2점씩 증가
  const newScore = (currentStage.score || 0) + scoreIncrement;
  const newStage = setStage(userId, payload.targetStage, serverTime, newScore);

  const response = {
    status: 'success',
    nextStage: newStage.id,
    newScore: newScore,
  };

  console.log('Sending response:', JSON.stringify(response, null, 2));

  return response;
};
