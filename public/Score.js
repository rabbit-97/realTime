import { sendEvent } from './socket.js';

class Score {
  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.score = 0;
    this.highScore = 0;
    this.currentStage = 1000;
    this.stageScoreMultiplier = 1;
    this.HIGH_SCORE_KEY = 'highScore';
    this.stageChange = false;
    this.scorePerSecond = 1;
  }

  async update(deltaTime) {
    this.score += deltaTime * 0.001 * this.scorePerSecond;
    const nextStageId = await this.getStageData(this.score);

    if (nextStageId && this.currentStage !== nextStageId) {
      this.stageChange = true;
      console.log('Stage change event sent');
      sendEvent(11, {
        currentStage: this.currentStage,
        targetStage: nextStageId,
        score: this.score,
      });
      this.currentStage = nextStageId;
      this.updateStageScoreMultiplier();
    }
  }

  async getStageData(score) {
    try {
      const response = await fetch(`/api/stages/get-stage/${score}`);
      if (response.ok) {
        const data = await response.json();
        return data.stage;
      } else {
        console.error('Error getting stage data:', response.statusText);
        return null;
      }
    } catch (err) {
      console.error('Error fetching stage data from server:', err);
      return null;
    }
  }

  updateStageScoreMultiplier() {
    this.stageScoreMultiplier = 1 + (this.currentStage - 1000) * 0.5;
    this.scorePerSecond = 1 + (this.currentStage - 1000);
  }

  async getItem(id) {
    const itemScore = await this.getItemScore(id);
    this.score += itemScore * this.stageScoreMultiplier;
  }

  async getItemScore(id) {
    try {
      const response = await fetch(`/api/items/${id}`);
      if (response.ok) {
        const item = await response.json();
        return item.score;
      } else {
        console.error(`Item with ID ${id} not found`);
        return 0;
      }
    } catch (err) {
      console.error('Error fetching item from server:', err);
      return 0;
    }
  }

  reset() {
    this.score = 0;
    this.currentStage = 1000;
    this.stageScoreMultiplier = 1;
    this.stageChange = false;
    this.scorePerSecond = 1;
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
    }
  }

  getScore() {
    return Math.floor(this.score);
  }

  getDisplayStage() {
    return this.currentStage - 999;
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const stageX = scoreX - 100 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);

    const displayStage = this.getDisplayStage();

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`Stage ${displayStage}`, stageX, y);
  }
}

export default Score;
