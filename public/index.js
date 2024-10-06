import Player from './Player.js';
import Ground from './Ground.js';
import CactiController from './CactiController.js';
import Score from './Score.js';
import ItemController from './ItemController.js';
import { sendEvent } from './socket.js';
import {
  addUserToRankings,
  drawRankings,
  initializeRankings,
  removeUserFromRankings,
} from './Ranking.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GAME_SPEED_START = 1;
const GAME_SPEED_INCREMENT = 0.00001;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;

const PLAYER_WIDTH = 88 / 1.5;
const PLAYER_HEIGHT = 94 / 1.5;
const MAX_JUMP_HEIGHT = GAME_HEIGHT;
const MIN_JUMP_HEIGHT = 150;

const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const GROUND_SPEED = 0.5;

const CACTI_CONFIG = [
  { width: 48 / 1.5, height: 100 / 1.5, image: 'images/cactus_1.png' },
  { width: 98 / 1.5, height: 100 / 1.5, image: 'images/cactus_2.png' },
  { width: 68 / 1.5, height: 70 / 1.5, image: 'images/cactus_3.png' },
];

const ITEM_CONFIG = [
  { width: 50 / 1.5, height: 50 / 1.5, id: 1, image: 'images/items/pokeball_red.png' },
  { width: 50 / 1.5, height: 50 / 1.5, id: 2, image: 'images/items/pokeball_yellow.png' },
  { width: 50 / 1.5, height: 50 / 1.5, id: 3, image: 'images/items/pokeball_purple.png' },
  { width: 50 / 1.5, height: 50 / 1.5, id: 4, image: 'images/items/pokeball_cyan.png' },
];

let player = null;
let ground = null;
let cactiController = null;
let itemController = null;
let score = null;

let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let gameover = false;
let hasAddedEventListenersForRestart = false;
let waitingToStart = true;

let userScores = {};
let rankingAdded = false;

let userId = 'user123'; // 예시 사용자 ID

async function saveUserScoreToServer(userId, score) {
  try {
    const response = await fetch('/save-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, score }),
    });
    if (response.ok) {
      console.log('Score saved successfully');
    } else {
      console.error('Error saving score:', response.statusText);
    }
  } catch (err) {
    console.error('Error saving score:', err);
  }
}

async function fetchUserScoreFromServer(userId) {
  try {
    const response = await fetch(`/get-score/${userId}`);
    if (response.ok) {
      const data = await response.json();
      console.log('User score:', data.score);
      return data.score;
    } else {
      console.error('Error getting score:', response.statusText);
    }
  } catch (err) {
    console.error('Error getting score:', err);
  }
}

async function saveUserInfoToServer(userId, userInfo) {
  try {
    const response = await fetch('/save-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, userInfo }),
    });
    if (response.ok) {
      console.log('User info saved successfully');
    } else {
      console.error('Error saving user info:', response.statusText);
    }
  } catch (err) {
    console.error('Error saving user info:', err);
  }
}

async function fetchUserInfoFromServer(userId) {
  try {
    const response = await fetch(`/get-user/${userId}`);
    if (response.ok) {
      const data = await response.json();
      console.log('User info:', data.userInfo);
      return data.userInfo;
    } else {
      console.error('Error getting user info:', response.statusText);
    }
  } catch (err) {
    console.error('Error getting user info:', err);
  }
}

async function fetchLeaderboard() {
  try {
    const response = await fetch('/leaderboard');
    if (response.ok) {
      const leaderboard = await response.json();
      console.log('Leaderboard:', leaderboard);
      return leaderboard;
    } else {
      console.error('Error getting leaderboard:', response.statusText);
    }
  } catch (err) {
    console.error('Error getting leaderboard:', err);
  }
}

function createSprites() {
  const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
  const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
  const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
  const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;

  const groundWidthInGame = GROUND_WIDTH * scaleRatio;
  const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

  player = new Player(
    ctx,
    playerWidthInGame,
    playerHeightInGame,
    minJumpHeightInGame,
    maxJumpHeightInGame,
    scaleRatio,
  );

  ground = new Ground(ctx, groundWidthInGame, groundHeightInGame, GROUND_SPEED, scaleRatio);

  const cactiImages = CACTI_CONFIG.map((cactus) => {
    const image = new Image();
    image.src = cactus.image;
    return {
      image,
      width: cactus.width * scaleRatio,
      height: cactus.height * scaleRatio,
    };
  });

  cactiController = new CactiController(ctx, cactiImages, scaleRatio, GROUND_SPEED);

  const itemImages = ITEM_CONFIG.map((item) => {
    const image = new Image();
    image.src = item.image;
    return {
      image,
      id: item.id,
      width: item.width * scaleRatio,
      height: item.height * scaleRatio,
    };
  });

  itemController = new ItemController(ctx, itemImages, scaleRatio, GROUND_SPEED);

  score = new Score(ctx, scaleRatio);
}

function getScaleRatio() {
  const screenHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
  const screenWidth = Math.min(window.innerHeight, document.documentElement.clientWidth);

  if (screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT) {
    return screenWidth / GAME_WIDTH;
  } else {
    return screenHeight / GAME_HEIGHT;
  }
}

function setScreen() {
  scaleRatio = getScaleRatio();
  canvas.width = GAME_WIDTH * scaleRatio;
  canvas.height = GAME_HEIGHT * scaleRatio;
  createSprites();
}

function startGame() {
  waitingToStart = false;
  sendEvent(2, { timestamp: Date.now() });
  requestAnimationFrame(gameLoop);
}

function showGameOver() {
  const fontSize = 70 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = 'grey';
  const x = canvas.width / 4.5;
  const y = canvas.height / 2;
  ctx.fillText('GAME OVER', x, y);

  const currentScore = score.getScore();
  if (!userScores[userId] || currentScore > userScores[userId]) {
    if (userScores[userId]) {
      removeUserFromRankings(userId);
    }
    userScores[userId] = currentScore;
    rankingAdded = false;
  }

  if (!rankingAdded) {
    addUserToRankings(userId, userScores[userId]);
    drawRankings();
    rankingAdded = true;
  }

  // 점수 저장 로직 추가
  saveUserScoreToServer(userId, currentScore);

  canvas.removeEventListener('click', showInitialScreen);
  window.removeEventListener('keyup', handleKeyUp);

  canvas.addEventListener('click', showInitialScreen, { once: true });
  window.addEventListener('keyup', handleKeyUp, { once: true });
}

function handleKeyUp(event) {
  if (event.code === 'Space') {
    if (waitingToStart) {
      startGame();
    } else {
      showInitialScreen();
    }
  }
}

function showStartGameText() {
  const fontSize = 40 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = 'grey';
  const x = canvas.width / 14;
  const y = canvas.height / 2;
  ctx.fillText('Tap Screen or Press Space To Start', x, y);
}

function updateGameSpeed(deltaTime) {
  gameSpeed += deltaTime * GAME_SPEED_INCREMENT;
}

function reset() {
  hasAddedEventListenersForRestart = false;
  gameover = false;
  waitingToStart = true;

  ground.reset();
  cactiController.reset();
  score.reset();
  gameSpeed = GAME_SPEED_START;
  sendEvent(2, { timestamp: Date.now() });
}

function setupGameReset() {
  if (!hasAddedEventListenersForRestart) {
    hasAddedEventListenersForRestart = true;

    setTimeout(() => {
      window.addEventListener('keyup', reset, { once: true });
    }, 1000);
  }
}

function clearScreen() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameLoop(currentTime) {
  if (previousTime === null) {
    previousTime = currentTime;
    requestAnimationFrame(gameLoop);
    return;
  }

  const deltaTime = currentTime - previousTime;
  previousTime = currentTime;

  clearScreen();

  if (!gameover && !waitingToStart) {
    ground.update(gameSpeed, deltaTime);
    cactiController.update(gameSpeed, deltaTime);
    itemController.update(gameSpeed, deltaTime);
    player.update(gameSpeed, deltaTime);
    updateGameSpeed(deltaTime);

    score.update(deltaTime);
  }

  if (!gameover && cactiController.collideWith(player)) {
    gameover = true;
    setupGameReset();
  }

  const collideWithItem = itemController.collideWith(player);
  if (collideWithItem && collideWithItem.itemId) {
    score.getItem(collideWithItem.itemId);
  }

  player.draw();
  cactiController.draw();
  ground.draw();
  score.draw();
  itemController.draw();

  if (gameover) {
    showGameOver();
  }

  if (waitingToStart) {
    showStartGameText();
  }

  requestAnimationFrame(gameLoop);
}

function showInitialScreen() {
  clearScreen();
  showStartGameText();
  canvas.removeEventListener('click', startGame);
  window.removeEventListener('keyup', handleKeyUp);

  canvas.addEventListener('click', startGame, { once: true });
  window.addEventListener('keyup', handleKeyUp, { once: true });
}

initializeRankings();

document.getElementById('start-game').addEventListener('click', async () => {
  const nicknameInput = document.getElementById('nickname');
  const nickname = nicknameInput.value.trim();

  if (nickname) {
    userId = nickname;
    document.getElementById('nickname-container').style.display = 'none';
    canvas.style.display = 'block';

    // 사용자 정보 저장
    await saveUserInfoToServer(userId, { nickname });

    // 사용자 정보 가져오기
    const userInfo = await fetchUserInfoFromServer(userId);
    if (userInfo) {
      console.log('User info:', userInfo);
    }

    // 사용자 점수 가져오기
    const userScore = await fetchUserScoreFromServer(userId);
    if (userScore !== null) {
      userScores[userId] = userScore;
    }

    // 랭킹 가져오기
    const leaderboard = await fetchLeaderboard();
    if (leaderboard) {
      leaderboard.forEach((entry) => {
        addUserToRankings(entry.value, entry.score);
      });
      drawRankings();
    }

    setScreen();
    showInitialScreen();
  } else {
    alert('Please enter a nickname.');
  }
});

window.addEventListener('resize', setScreen);
