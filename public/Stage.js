class Stage {
  constructor(stageNumber) {
    this.stageNumber = stageNumber;
    this.items = this.setStageItems(stageNumber);
  }

  setStageItems(stageNumber) {
    switch (stageNumber) {
      case 1:
        return ['pokeball_red.png', 'pokeball_yellow.png'];
      case 2:
        return ['pokeball_purple.png', 'pokeball_cyan.png'];
      default:
        return [];
    }
  }

  getItems() {
    return this.items;
  }
}

export default Stage;
