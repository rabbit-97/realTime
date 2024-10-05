let rankings = [];

function addUserToRankings(userId, score) {
  rankings.push({ userId, score });

  rankings.sort((a, b) => b.score - a.score);
}

function removeUserFromRankings(userId) {
  rankings = rankings.filter((ranking) => ranking.userId !== userId);
}

function drawRankings() {
  const rankingsDiv = document.getElementById('rankings');

  rankingsDiv.innerHTML = '<h3>Rankings</h3>';

  rankings.forEach((ranking, index) => {
    const rankElement = document.createElement('div');
    rankElement.textContent = `${index + 1}. User ${ranking.userId}: ${ranking.score}`;
    rankingsDiv.appendChild(rankElement);
  });
}

function initializeRankings() {
  rankings = [];
}

export { addUserToRankings, drawRankings, initializeRankings, removeUserFromRankings };
