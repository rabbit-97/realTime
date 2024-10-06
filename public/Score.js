import { sendEvent } from './socket.js';

class Score {
  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.score = 0;
    this.highScore = 0;
    this.currentStage = 1;
    this.maxStage = 5;
    this.stageScoreMultiplier = 1;
    this.HIGH_SCORE_KEY = 'highScore';
    this.stageChange = false;
    this.scorePerSecond = 1;
    this.nextStageThreshold = 100;
  }

  update(deltaTime) {
    this.score += deltaTime * 0.001;

    if (this.score >= this.nextStageThreshold && this.currentStage < this.maxStage) {
      this.stageChange = true;
      console.log('Stage change event sent');
      sendEvent(11, {
        currentStage: this.currentStage,
        targetStage: this.currentStage + 1,
        score: this.score,
      });
      this.currentStage++;
      this.updateStageScoreMultiplier();
      this.nextStageThreshold += 100;
    }
  }

  updateStageScoreMultiplier() {
    this.stageScoreMultiplier = 1 + (this.currentStage - 1) * 0.5;
    this.scorePerSecond = 1 + (this.currentStage - 1);
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
    this.currentStage = 1;
    this.stageScoreMultiplier = 1;
    this.stageChange = false;
    this.scorePerSecond = 1;
    this.nextStageThreshold = 100;
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

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`Stage ${this.currentStage}`, stageX, y);
  }
}

export default Score;
