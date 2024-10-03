import { CLIENT_VERSION } from './Constants.js';

const socket = io('http://localhost:3000', {
  query: {
    clientVersion: CLIENT_VERSION,
  },
});

let userId = null;
let currentStage = null;

socket.on('response', (data) => {
  console.log('Received response from server:', JSON.stringify(data, null, 2));

  if (data.status === 'success') {
    if (data.message === 'Stage initialized' || data.message === 'Stage updated') {
      console.log('Stage information updated successfully');
    } else if (data.nextStage !== undefined && data.newScore !== undefined) {
      console.log(`다음 스테이지로 이동 : ${data.nextStage}, 새로운 점수: ${data.newScore}`);
      updateGameState(data.nextStage, data.newScore);
    } else {
      console.log('서버로부터 성공 응답을 받았습니다.');
      console.log('Received data:', data);
    }
  } else {
    console.error(`요청 처리 실패: ${data.message}`);
  }
});

socket.on('connection', (data) => {
  console.log('connection: ', data);
  userId = data.uuid;
  currentStage = data.currentStage;
});

export const sendEvent = (handlerId, payload) => {
  const data = {
    clientVersion: CLIENT_VERSION,
    handlerId: handlerId,
    userId: userId,
    payload: payload,
  };
  socket.emit('event', data);
};

function updateGameState(newStage, newScore) {
  console.log(`Updating game state: Stage ${newStage}, Score ${newScore}`);
  currentStage = newStage;

  if (window.score) {
    window.score.setScore(newScore);
  }

  const backgroundImage = `images/background_stage_${newStage}.png`;
  document.body.style.backgroundImage = `url(${backgroundImage})`;

  const stageElement = document.getElementById('stage-display');
  if (stageElement) {
    stageElement.textContent = `Stage: ${newStage}`;
  }

  if (window.cactiController) {
    window.cactiController.setSpeed(1 + newStage * 0.1);
  }

  if (window.itemController) {
    window.itemController.adjustItemFrequency(newStage);
  }

  if (window.player) {
    window.player.upgradeForStage(newStage);
  }

  const notification = document.createElement('div');
  notification.textContent = `Stage ${newStage} 시작!`;
  notification.style.position = 'absolute';
  notification.style.top = '50%';
  notification.style.left = '50%';
  notification.style.transform = 'translate(-50%, -50%)';
  notification.style.fontSize = '24px';
  notification.style.color = 'white';
  notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  notification.style.padding = '10px';
  notification.style.borderRadius = '5px';
  document.body.appendChild(notification);

  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);

  console.log(`게임 상태 업데이트: 스테이지 ${newStage}, 점수 ${newScore}`);
}

export function initializeGame() {
  socket.emit('initializeStage');
}

export function endGame(score) {
  const nickname = promptForNickname();
  if (nickname) {
    sendScoreToServer(nickname, score);
    showGameOverScreen(nickname, score);
  }
}

function promptForNickname() {
  return prompt('게임이 종료되었습니다! 닉네임을 입력하세요:');
}

function sendScoreToServer(nickname, score) {
  sendEvent('submitScore', { nickname, score });
}

function showGameOverScreen(nickname, score) {
  // 게임 오버 화면 표시 (구현 필요)
  console.log(`Game Over! ${nickname}: ${score}`);
}

socket.on('rankingUpdate', (scores) => {
  console.log('Received ranking update:', scores);
  updateRankingDisplay(scores);
});

function updateRankingDisplay(rankingData) {
  let rankingElement = document.getElementById('ranking-display');
  if (!rankingElement) {
    rankingElement = document.createElement('div');
    rankingElement.id = 'ranking-display';
    rankingElement.style.position = 'absolute';
    rankingElement.style.top = '10px';
    rankingElement.style.right = '10px';
    rankingElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    rankingElement.style.color = 'white';
    rankingElement.style.padding = '10px';
    rankingElement.style.borderRadius = '5px';
    rankingElement.style.maxHeight = '200px';
    rankingElement.style.overflowY = 'auto';
    document.body.appendChild(rankingElement);
  }

  const rankingList = rankingData
    .slice(0, 10)
    .map((item, index) => `<li>${index + 1}. ${item.nickname}: ${item.score}</li>`)
    .join('');

  rankingElement.innerHTML = `
    <h3>Top Scores</h3>
    <ol>${rankingList}</ol>
  `;
}

export function updateRanking(score, nickname) {
  socket.emit('updateRanking', { score, nickname });
}

export function getRanking() {
  return new Promise((resolve) => {
    socket.emit('getRanking');
    socket.once('rankingData', (data) => {
      resolve(data.ranking);
    });
  });
}

export { socket };
