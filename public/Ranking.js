// 랭킹을 저장할 객체
let rankings = [];

// 사용자 점수를 랭킹에 추가하는 함수
function addUserToRankings(userId, score) {
  // 사용자 점수를 랭킹에 추가
  rankings.push({ userId, score });

  // 랭킹을 점수 기준으로 내림차순 정렬
  rankings.sort((a, b) => b.score - a.score);
}

// 랭킹을 화면에 표시하는 함수
function drawRankings() {
  const rankingsDiv = document.getElementById('rankings');

  // 랭킹을 초기화
  rankingsDiv.innerHTML = '<h3>Rankings</h3>';

  // 각 순위와 점수를 표시
  rankings.forEach((ranking, index) => {
    const rankElement = document.createElement('div');
    rankElement.textContent = `${index + 1}. User ${ranking.userId}: ${ranking.score}`;
    rankingsDiv.appendChild(rankElement);
  });
}

// 랭킹을 초기화하는 함수
function initializeRankings() {
  // 랭킹을 비움
  rankings = [];
}

export { addUserToRankings, drawRankings, initializeRankings };
