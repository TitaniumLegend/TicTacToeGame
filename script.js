// --- Game State ---
let gameMode = null; // 'ai' or 'friend'
let userSymbol = 'X';
let aiSymbol = 'O';
let currentPlayer = 'X';
let board = Array(9).fill(null);
let gameActive = false;
let scores = { user1: 0, user2: 0 };
let player1Name = 'User 1';
let player2Name = 'User 2';

// --- DOM Elements ---
const gameSetup = document.getElementById('game-setup');
const modeSelect = document.querySelector('.mode-select');
const symbolSelect = document.getElementById('symbol-select');
const nameInputs = document.getElementById('name-inputs');
const aiNameInput = document.getElementById('ai-name-input');
const friendNameInputs = document.getElementById('friend-name-inputs');
const gameArea = document.getElementById('game-area');
const boardDiv = document.getElementById('board');
const restartBtn = document.getElementById('restart-btn');
const gameResult = document.getElementById('game-result');
const scoreUser1 = document.getElementById('score-user1');
const scoreUser2 = document.getElementById('score-user2');

// --- Setup Handlers ---
document.getElementById('vs-ai').onclick = () => {
  gameMode = 'ai';
  modeSelect.style.display = 'none';
  nameInputs.style.display = 'flex';
  aiNameInput.style.display = 'flex';
  friendNameInputs.style.display = 'none';
};
document.getElementById('vs-friend').onclick = () => {
  gameMode = 'friend';
  modeSelect.style.display = 'none';
  nameInputs.style.display = 'flex';
  aiNameInput.style.display = 'none';
  friendNameInputs.style.display = 'flex';
};

// Name input next buttons

document.getElementById('name-next-ai').onclick = () => {
  const name = document.getElementById('player1-name').value.trim();
  player1Name = name ? name : 'You';
  player2Name = 'AI';
  nameInputs.style.display = 'none';
  // Start game as X (user), AI is O
  startGame('X');
};
document.getElementById('name-next-friend').onclick = () => {
  const name1 = document.getElementById('player1-name-friend').value.trim();
  const name2 = document.getElementById('player2-name-friend').value.trim();
  player1Name = name1 ? name1 : 'Player 1';
  player2Name = name2 ? name2 : 'Player 2';
  nameInputs.style.display = 'none';
  // Start game as X (user 1), O (user 2)
  startGame('X');
};

function startGame(symbol) {
  // Always X for user1, O for user2/AI
  userSymbol = 'X';
  aiSymbol = 'O';
  currentPlayer = 'X';
  board = Array(9).fill(null);
  gameActive = true;
  gameSetup.style.display = 'none';
  gameArea.style.display = 'flex';
  gameResult.style.display = 'none';
  restartBtn.style.display = 'none';
  updateScoreboard();
  renderBoard();
  // No need to check for userSymbol !== 'X', user always starts as X
}

function renderBoard() {
  boardDiv.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.textContent = board[i] || '';
    cell.onclick = () => handleCellClick(i);
    boardDiv.appendChild(cell);
  }
}

function handleCellClick(idx) {
  if (!gameActive || board[idx]) return;
  if (gameMode === 'ai') {
    if (currentPlayer !== userSymbol) return;
    board[idx] = userSymbol;
    renderBoard();
    if (checkGameEnd()) return;
    currentPlayer = aiSymbol;
    setTimeout(aiMove, 400);
  } else {
    board[idx] = currentPlayer;
    renderBoard();
    if (checkGameEnd()) return;
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  }
}

function aiMove() {
  if (!gameActive) return;
  const move = findBestMove(board, aiSymbol, userSymbol);
  if (move !== null) {
    board[move] = aiSymbol;
    renderBoard();
    if (checkGameEnd()) return;
    currentPlayer = userSymbol;
  }
}

function checkGameEnd() {
  const winner = getWinner(board);
  if (winner) {
    gameActive = false;
    showResult(`${winner === userSymbol ? 'You' : (gameMode === 'ai' ? 'AI' : (winner === 'X' ? 'User 1' : 'User 2'))} win!`);
    if (gameMode === 'ai') {
      if (winner === userSymbol) scores.user1++;
      else scores.user2++;
    } else {
      if (winner === 'X') scores.user1++;
      else scores.user2++;
    }
    updateScoreboard();
    restartBtn.style.display = 'block';
    return true;
  } else if (board.every(cell => cell)) {
    gameActive = false;
    showResult("It's a draw!");
    restartBtn.style.display = 'block';
    return true;
  }
  return false;
}

function showResult(msg) {
  gameResult.textContent = msg;
  gameResult.style.display = 'block';
}

function updateScoreboard() {
  scoreUser1.textContent = player1Name + ': ' + scores.user1;
  scoreUser2.textContent = player2Name + ': ' + scores.user2;
}

restartBtn.onclick = () => {
  board = Array(9).fill(null);
  gameActive = true;
  currentPlayer = 'X';
  gameResult.style.display = 'none';
  restartBtn.style.display = 'none';
  renderBoard();
  if (gameMode === 'ai' && userSymbol !== 'X') {
    aiMove();
  }
};

// --- Game Logic ---
function getWinner(b) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b1,c] of lines) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  }
  return null;
}

// Minimax AI
function findBestMove(b, ai, user) {
  let bestScore = -Infinity;
  let move = null;
  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      b[i] = ai;
      let score = minimax(b, 0, false, ai, user);
      b[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(b, depth, isMax, ai, user) {
  const winner = getWinner(b);
  if (winner === ai) return 10 - depth;
  if (winner === user) return depth - 10;
  if (b.every(cell => cell)) return 0;
  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = ai;
        best = Math.max(best, minimax(b, depth+1, false, ai, user));
        b[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = user;
        best = Math.min(best, minimax(b, depth+1, true, ai, user));
        b[i] = null;
      }
    }
    return best;
  }
}
