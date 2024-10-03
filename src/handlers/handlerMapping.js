import { moveStageHandler } from './stage.handler.js';
import { gameStart, gameEnd } from './game.handler.js';
import { updateScore } from './game.handler.js';
import { submitScoreHandler } from './score.handler.js';

const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  11: moveStageHandler,
  12: updateScore,
  13: submitScoreHandler,
};

export default handlerMappings;
