let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
const markerRadius = 25;
const nTiles = 8;
const tileSize = 58;
const tilePadding = 2;
const tileOffsetTop = 0;
const tileOffsetLeft = 0;
let clickTile = null;
const userColor = 'w';
const computerColor = userColor == 'b' ? 'w' : 'b';
let validMove = true;
let winner = null;
const textPadding = 20;
const btnWidth = 200;
const btnHeight = 56;
const innerBtnWidth = 190;
const innerBtnHeight = 46;
const directions = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const tileColorCodes = {
  ' ': "#208c48",
  'y': "#e0c826",
  'w': "#fcfafa",
  'b': "#000000"
}
let agents = document.getElementById("agents");
let agent = agents.value;
document.getElementById("agents").addEventListener("change", function() {
  agent = this.value;
});

function initTiles() {
  let tiles = [];
  for (let c = 0; c < nTiles; c++) {
    tiles[c] = [];
    for (let r = 0; r < nTiles; r++) {
      tiles[c][r] = {
        x: (c * (tileSize + tilePadding)) + tileOffsetLeft,
        xi: c,
        y: (r * (tileSize + tilePadding)) + tileOffsetLeft,
        yi: r,
        color: ' '
      };
    }
  }

  tiles[3][3].color = 'w';
  tiles[4][4].color = 'w';
  tiles[3][4].color = 'b';
  tiles[4][3].color = 'b';

  return tiles
}

function printTiles(tiles) {
  let column = [];
  for (let c = 0; c < nTiles; c++) {
    column = [];
    for (let r = 0; r < nTiles; r++) {
      column.push(tiles[r][c].color)
    }
    console.log(column)
  }
}

document.addEventListener("click", clickHandler, false);

function clickHandler(e) {
  const rect = canvas.getBoundingClientRect()
  if (e.clientX > rect.left && e.clientX < rect.right && e.clientY > rect.top && e.clientY < rect.bottom) {
    possibleMoves = getPossibleMoves(userColor, tiles);
    clickTile = getClickTile(e);

    validMove = JSON.stringify(possibleMoves).indexOf(JSON.stringify(clickTile)) != -1 ? true : false;
    
    if (validMove) {
      tiles = applyMove(userColor, clickTile, tiles)
    }
    draw();

    if (winner != null) { // Check for try again click
      if ((e.clientX - rect.left) > (canvas.width / 2) - (innerBtnWidth / 2) && (e.clientX - rect.left) < (canvas.width / 2) + (innerBtnWidth / 2)) {
        if ((e.clientY - rect.top) > (canvas.height / 2) + 57 && (e.clientY - rect.top) < (canvas.height / 2) + 57 + innerBtnHeight) {
          winner = null;
          tiles = initTiles();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawTiles();
          drawMarkers();
        }
      }
    }
  }
}

function getClickTile(e) {
  const rect = canvas.getBoundingClientRect()
  tileXi = Math.floor((e.clientX - tileOffsetLeft - rect.left) / (tileSize + tilePadding));
  tileYi = Math.floor((e.clientY - tileOffsetTop - rect.top) / (tileSize + tilePadding));

  return [tileXi, tileYi]
}

function drawTiles() {
  for(let c=0; c<nTiles; c++) {
    for (let r=0; r<nTiles; r++) {
      tile = tiles[c][r];
      ctx.beginPath();
      ctx.rect(tile.x, tile.y, tileSize, tileSize);
      ctx.fillStyle = tileColorCodes[' '];
      ctx.fill();
      ctx.closePath();
    }
  }
}

function drawMarkers() {
  for(let c=0; c<nTiles; c++) {
    for (let r=0; r<nTiles; r++) {
      tile = tiles[c][r];
      
      radius = tile.possibleMove ? markerRadius * 0.9 : markerRadius; // Prevent leaving outline

      ctx.beginPath();
      ctx.arc(tile.x + tileSize * 0.5, tile.y + tileSize * 0.5, radius, 0, Math.PI * 2);
      color = tile.possibleMove ? 'y' : tile.color;
      ctx.fillStyle = tileColorCodes[color];
      ctx.fill();
      ctx.closePath();
    }
  }
}

function drawPossibleMoves(possibleMoves) {
  for (const possibleMove of possibleMoves) {
    tile = tiles[possibleMove[0]][possibleMove[1]];
    tile.possibleMove = true;
  }
}

function clearPossibleMoves() {
  for(let c=0; c<nTiles; c++) {
    for(let r=0; r<nTiles; r++) {
      tile = tiles[c][r];
      tile.possibleMove = false;
    }
  }
}

function checkOnBoard(pos) {
  if (pos[0] >= 0 && pos[0] < nTiles && pos[1] >= 0 && pos[1] < nTiles) {
    return true
  } else {
    return false
  }
}

function getPossibleMoves(color, board) {
  opponentColor = color == 'b' ? 'w' : 'b';

  let colorTiles = [];
  board.map(row => row.map(tile => {
    if (tile.color == color) {
      colorTiles.push(tile)
    }
  }));

  possibleMoves = [];
  for (colorTile of colorTiles) {
    for (direction of directions) {
      let steps = 1;
      let newPos = [colorTile.xi + direction[0], colorTile.yi + direction[1]]
      while (checkOnBoard(newPos) && board[newPos[0]][newPos[1]].color == opponentColor) {
        steps += 1;
        newPos = [colorTile.xi + direction[0] * steps, colorTile.yi + direction[1] * steps];
      }
      if (checkOnBoard(newPos) && steps > 1 && board[newPos[0]][newPos[1]].color == ' ') {
        possibleMoves.push(newPos);
      }
    }
  }

  return possibleMoves
}

function findFlips(color, pos, board) {
  opponentColor = color == 'b' ? 'w' : 'b';

  let flipTiles = [];
  for (direction of directions) {
    let steps = 1;
    let newPos = [pos[0] + direction[0], pos[1] + direction[1]]
    while (checkOnBoard(newPos) && board[newPos[0]][newPos[1]].color == opponentColor) {
      steps += 1;
      newPos = [pos[0] + direction[0] * steps, pos[1] + direction[1] * steps];
    }
    if (checkOnBoard(newPos) && steps > 1 && board[newPos[0]][newPos[1]].color == color) {
      flipSteps = 1;
      let flipPos = [pos[0] + direction[0] * flipSteps, pos[1] + direction[1] * flipSteps]
      while (checkOnBoard(flipPos) && board[flipPos[0]][flipPos[1]].color == opponentColor) {
        flipTiles.push(flipPos);
        flipSteps += 1;
        flipPos = [pos[0] + direction[0] * flipSteps, pos[1] + direction[1] * flipSteps];
      }
    }
  }

  return flipTiles
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj)); 
}

function applyMove(color, pos, board) {
  tile = board[pos[0]][pos[1]];
  tile.color = color;

  flipTiles = findFlips(color, pos, board);
  for (let flipTile of flipTiles) {
    tile = board[flipTile[0]][flipTile[1]];
    tile.color = color;
  }

  return board
}

function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }

  let max = arr[0];
  let maxIndex = 0;

  for (let i=0; i<arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return maxIndex;
}

greedyTunedScoreSheet = [
  [12, -4, 6, 6, 6, 6, -4, 12],
  [-4, -4, -2,-2, -2, -2, -4, -4],
  [6, -2, 0, 0, 0, 0, -2, 6],
  [6, -2, 0, 0, 0, 0, -2, 6],
  [6, -2, 0, 0, 0, 0, -2, 6],
  [6, -2, 0, 0, 0, 0, -2, 6],
  [-4, -4, -2, -2, -2, -2, -4, -4],
  [12, -4, 6, 6, 6, 6, -4, 12],
];

function chooseComputerMove(computerPossibleMoves) {
  if (agent == "random") {
    return computerPossibleMoves[Math.floor(Math.random() * computerPossibleMoves.length)];
  } else if (agent == "greedy") {
    nFlips = [];
    for (let computerPossibleMove of computerPossibleMoves) {
      flipTiles = findFlips(computerColor, computerPossibleMove, tiles)
      nFlips.push(flipTiles.length);
    }
    return computerPossibleMoves[indexOfMax(nFlips)];
  } else if (agent == "greedy tuned") {
    tileScores = [];
    for (let computerPossibleMove of computerPossibleMoves) {
      flipTiles = findFlips(computerColor, computerPossibleMove, tiles)
      tileScore = flipTiles.length + greedyTunedScoreSheet[computerPossibleMove[0]][computerPossibleMove[1]];
      tileScores.push(tileScore);
    }
    return computerPossibleMoves[indexOfMax(tileScores)];
  } else if (agent == "minimax") {
    const depth = 4; // The depth of the search
    let bestMoveIdx = 0;
    let value;
    const tuned = false;

    value, bestMoveIdx = negamax(tiles, computerColor, depth, tuned)
    return computerPossibleMoves[bestMoveIdx];
  } else if (agent == "minimax tuned") {
    const depth = 4; // The depth of the search
    let bestMoveIdx = 0;
    let value;
    const tuned = true;

    [value, bestMoveIdx] = negamax(tiles, computerColor, depth, tuned)
    return computerPossibleMoves[bestMoveIdx];
  }
}

function negamax(inputTiles, color, depth, tuned) {
  let board = deepCopy(inputTiles);

  const oppColor = color == 'b' ? 'w' : 'b';
  const colorPossibleMoves = getPossibleMoves(color, board);
  const oppColorPossibleMoves = getPossibleMoves(oppColor, board);

  // At the final layer return the score up the recursion
  if (depth == 0 || (colorPossibleMoves.length + oppColorPossibleMoves.length) == 0) {
    return [calculate_scores(board, color, tuned)[0], 0]
  }
  
  let value = -100
  let bestMoveIdx = 0
  let move;

  if (colorPossibleMoves.length > 0) {
    // Whilst there is moves iterate over them and recurse over each
    for (let moveIdx = 0; moveIdx < colorPossibleMoves.length; moveIdx++) {
      move = colorPossibleMoves[moveIdx];
      let moveBoard = deepCopy(inputTiles);
      moveBoard = applyMove(color, move, moveBoard)
      let newValue = -negamax(moveBoard, oppColor, depth - 1, tuned)[0]
      if (newValue > value) {
        bestMoveIdx = moveIdx
        value = newValue
      }
    }
  } else {
    // If there are no more moves pass the turn to the other color
    let newValue = -negamax(board, oppColor, depth - 1, tuned)[0]
    if (newValue > value) {
      value = newValue
    }
  }

  return [value, bestMoveIdx]
}

function calculate_scores(board, color, tuned) {
  oppColor = color == 'b' ? 'w' : 'b';
  let colorScore = 0;
  let oppColorScore = 0;
  for (var i = 0; i < nTiles; i++) {
    for (var j = 0; j < nTiles; j++) {
      if (board[i][j].color == color) {
        colorScore += 1;
        if (tuned) {
          colorScore += greedyTunedScoreSheet[i][j];
        }
      } else if (board[i][j].color == oppColor) {
        oppColorScore += 1;
        if (tuned) {
          oppColorScore += greedyTunedScoreSheet[i][j];
        }
      }
    }
  }

  return [colorScore - oppColorScore, colorScore, oppColorScore]
}

function draw() {
  if (clickTile == null) { // Initialise Board
    tiles = initTiles();
    drawTiles();
    drawMarkers();
  }

  userPossibleMoves = getPossibleMoves(userColor, tiles);
  computerPossibleMoves = getPossibleMoves(computerColor, tiles);

  if (winner == null) { // Check if game has ended
    if (userPossibleMoves.length > 0) {
      if (validMove) {
        clearPossibleMoves();
      } else {
        drawPossibleMoves(userPossibleMoves);
      }
      drawMarkers();
    }
  
    if (validMove && clickTile != null) { // Apply computer move after user move
      computerPossibleMoves = getPossibleMoves(computerColor, tiles);
      if (computerPossibleMoves.length > 0) {
        computerMove = chooseComputerMove(computerPossibleMoves);
        tiles = applyMove(computerColor, computerMove, tiles)
        drawMarkers();
      }
    }
  }
  while (userPossibleMoves.length == 0 && winner == null) {
    if (computerPossibleMoves.length > 0) {
      computerMove = chooseComputerMove(computerPossibleMoves);
      tiles = applyMove(computerColor, computerMove, tiles)
      drawMarkers();

      userPossibleMoves = getPossibleMoves(userColor, tiles);
      computerPossibleMoves = getPossibleMoves(computerColor, tiles);
    } else { // End game
      let relScore = 0;
      let userScore = 0;
      let computerScore = 0;
      [relScore, userScore, computerScore] = calculate_scores(tiles, userColor, false)
      winner = userScore > computerScore ? 'user' : userScore == computerScore ? 'draw' : 'computer';

      resultText = winner == 'user' ? 'You won!' : winner == 'draw' ? 'You drew' : "You lost";
      whiteScoreText = `White scored ${userScore}`;
      blackScoreText = `Black scored ${computerScore}`;

      ctx.clearRect(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2);
      ctx.fillStyle = "white";
      ctx.font = "bold 30px Arial";
      ctx.fillText(resultText, (canvas.width / 4) + textPadding, (canvas.height / 4) + 40 + textPadding);
      ctx.font = "bold 20px Arial";
      ctx.fillText(whiteScoreText, (canvas.width / 4) + textPadding, (canvas.height / 4) + 40 * 2 + textPadding);
      ctx.fillText(blackScoreText, (canvas.width / 4) + textPadding, (canvas.height / 4) + 40 * 3 + textPadding);
    
      ctx.beginPath();
      ctx.rect((canvas.width / 2) - (btnWidth / 2), (canvas.height / 2) + 52, btnWidth, btnHeight);
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.fillStyle = "black";
      ctx.rect((canvas.width / 2) - (innerBtnWidth / 2), (canvas.height / 2) + 57, innerBtnWidth, innerBtnHeight);
      ctx.fill();
      ctx.closePath();

      ctx.fillStyle = "white";
      ctx.font = "bold 20px Arial";
      ctx.fillText("Play Again?", (canvas.width / 4) + 62, (canvas.height / 2) + 88);
    }
  }
}

draw();