// Tic-Tac-Toe with Human vs Human and Human vs Computer (minimax)
const cells = [...document.querySelectorAll('.cell')];
const statusEl = document.getElementById('status');
const turnEl = document.getElementById('turn');
const modeSel = document.getElementById('mode');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const scoreD = document.getElementById('scoreD');
const newGameBtn = document.getElementById('newGame');
const resetAllBtn = document.getElementById('resetAll');
const yearSpan = document.getElementById('year');
yearSpan.textContent = new Date().getFullYear();

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diags
];

let board = Array(9).fill(null);
let current = 'X'; // X always starts for simplicity
let locked = false;
let scores = { X:0, O:0, D:0 };

function setStatus(msg){ statusEl.textContent = msg; }
function setTurn(t){ turnEl.textContent = t; }

function render(){
  board.forEach((val,i)=>{
    const c = cells[i];
    c.textContent = val ? val : '';
    c.className = 'cell' + (val ? ' ' + val : '');
  });
}

function winner(b=board){
  for (const [a,bc,cd] of WIN_LINES){
    if (b[a] && b[a] === b[bc] && b[a] === b[cd]){
      return {win:b[a], line:[a,bc,cd]};
    }
  }
  if (b.every(Boolean)) return {draw:true};
  return null;
}

function highlight(line){
  line.forEach(i=> cells[i].classList.add('win'));
}

function nextTurn(){
  current = current === 'X' ? 'O' : 'X';
  setTurn(current);
}

function makeMove(i, player=current){
  if (locked || board[i]) return false;
  board[i] = player;
  render();
  const res = winner(board);
  if (res?.win){
    setStatus(`Player ${res.win} wins!`);
    highlight(res.line);
    locked = true;
    scores[res.win]++;
    updateScores();
    return true;
  }
  if (res?.draw){
    setStatus('Draw!');
    locked = true;
    scores.D++;
    updateScores();
    return true;
  }
  nextTurn();
  return true;
}

function updateScores(){
  scoreX.textContent = String(scores.X);
  scoreO.textContent = String(scores.O);
  scoreD.textContent = String(scores.D);
}

function resetBoard(){
  board = Array(9).fill(null);
  current = 'X';
  locked = false;
  setTurn(current);
  setStatus('Make your move!');
  cells.forEach(c=> c.classList.remove('win'));
  render();
}

// Minimax for Computer (plays 'O')
function isMovesLeft(b){ return b.some(x=>!x); }

function evaluate(b){
  for (const [a,bx,c] of WIN_LINES){
    if (b[a] && b[a] === b[bx] && b[a] === b[c]){
      return b[a] === 'O' ? 10 : -10;
    }
  }
  return 0;
}

function minimax(b, depth, isMax){
  const score = evaluate(b);
  if (score === 10) return score - depth;    // prefer faster wins
  if (score === -10) return score + depth;   // prefer slower losses
  if (!isMovesLeft(b)) return 0;

  if (isMax){
    let best = -Infinity;
    for (let i=0;i<9;i++){
      if (!b[i]){
        b[i] = 'O';
        best = Math.max(best, minimax(b, depth+1, false));
        b[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i=0;i<9;i++){
      if (!b[i]){
        b[i] = 'X';
        best = Math.min(best, minimax(b, depth+1, true));
        b[i] = null;
      }
    }
    return best;
  }
}

function bestMove(){
  let bestVal = -Infinity;
  let move = -1;
  for (let i=0;i<9;i++){
    if (!board[i]){
      board[i] = 'O';
      const moveVal = minimax(board, 0, false);
      board[i] = null;
      if (moveVal > bestVal){
        bestVal = moveVal; move = i;
      }
    }
  }
  return move;
}

// Event handlers
cells.forEach(cell=>{
  cell.addEventListener('click', ()=>{
    const i = Number(cell.dataset.index);
    if (!makeMove(i)) return;

    // If vs AI and game not over and it's O's turn, AI moves
    if (!locked && modeSel.value === 'ai' && current === 'O'){
      setStatus('Computer thinking...');
      setTimeout(()=>{
        const move = bestMove();
        makeMove(move, 'O');
        if (!locked) setStatus('Your turn!');
      }, 180);
    }
  });
});

modeSel.addEventListener('change', ()=>{
  resetBoard();
  setStatus(modeSel.value === 'ai' ? 'Your turn! You are X.' : 'Player X to move.');
});

newGameBtn.addEventListener('click', resetBoard);
resetAllBtn.addEventListener('click', ()=>{
  scores = {X:0, O:0, D:0};
  updateScores();
  resetBoard();
});

// init
updateScores();
resetBoard();
