//grid structure
const gridCols = 10;
const gridRows = 20;
const gridWidth = 260;
const gridHeight = 520;
const gridGap = 1.5;
const startX = 481.5;
const startY = 188;
const cellWidth = gridWidth / gridCols; //26
const cellHeight = gridHeight / gridRows; //26
let board = [];
let bag = [];
let nextQueue = [];
let currentBlock;
let lastDownTapTime = 0;
let hardDropThreshold = 200;
let gravityInterval = 500;
let lastGravityTime = 0;
let purewhite, white, lightgray, mediumgray, darkgray, black;
let COLORS;
let isLocking = false;
let leftHeld = false;
let rightHeld = false;
let downHeld = false;
let moveTimer = 0;
let moveDelay = 90; // lower = faster movement

function preload() {
  purewhite = color(255);
  white = color(217);
  lightgray = color(149);
  mediumgray = color(95);
  darkgray = color(39);
  black = color(0);
  rectframe = loadImage("assets/frame.png");
  bigchinese = loadImage("assets/bigchinese.png");
  testingui = loadImage("assets/test.png");
  heldui = loadImage("assets/heldui.png");
  nextui = loadImage("assets/nextui.png");
  levelui = loadImage("assets/levelui.png");
  gameui = loadImage("assets/gameui.png");
  logo = loadImage("assets/kongji.png");
}

function setup() {
  createCanvas(1200, 850);
  refillBag();
  currentBlock = spawnBlock();

  for (let i = 0; i < 5; i++) {
    nextQueue.push(spawnBlock());
  }

  COLORS = [
    mediumgray,
    black,
    darkgray,
    black,
    darkgray,
    mediumgray,
    purewhite
  ];

  for (let y = 0; y < gridRows; y++) {
    board[y] = [];
    for (let x = 0; x < gridCols; x++) {
      board[y][x] = null;
    }
  }
}

function draw() {

  //ui
  background(darkgray);
  image(testingui, 0, 0, 1200, 850);
  image(rectframe, 236, 0, 729, 850);
  image(bigchinese, 385, 335, 73, 433);
  image(heldui, 381, 165, 75, 117);
  image(nextui, 777, 165, 75, 296);
  image(levelui, 777, 458, 75, 91);
  image(gameui, 465, 166, 304, 600);
  image(logo, 521, 55, 195, 95);

  //grid
  for (let y = 0; y < gridRows; y++) {
    for (let x = 0; x < gridCols; x++) {
      let block = new GridBlock(x, y);
      block.draw();
    }
  }

  for (let y = 0; y < gridRows; y++) {
    for (let x = 0; x < gridCols; x++) {
      let cell = board[y][x];

      if (cell !== null) {
        let px = startX + x * cellWidth;
        let py = startY + y * cellHeight;

        fill(COLORS[TYPE_INDEX[cell]]);
        noStroke();
        rect(
          px + gridGap / 2,
          py + gridGap / 2,
          cellWidth - gridGap,
          cellHeight - gridGap
        );
      }
    }
  }

  //block spawn
  for (let b of currentBlock.getBlocks()) {
    let px = startX + b.x * cellWidth;
    let py = startY + b.y * cellHeight;

    fill(COLORS[TYPE_INDEX[currentBlock.type]]);
    noStroke();
    rect(
      px + gridGap / 2,
      py + gridGap / 2,
      cellWidth - gridGap,
      cellHeight - gridGap
    );
  }

  //next block window
  let previewX = 765;
  let previewY = 190;

  for (let i = 0; i < nextQueue.length; i++) {
    let block = nextQueue[i];

    let offsetX = 0;

    if (block.type === "O" || block.type === "I") {
      offsetX = -5;
    }

    push();
    translate(previewX + offsetX, previewY + i * 50);

    for (let b of block.getBlocks()) {
      fill(COLORS[TYPE_INDEX[block.type]]);
      noStroke();
      rect(b.x * 10, b.y * 10, 10, 10);
    }
    pop();
  }

  fill(purewhite);
  textSize(24);
  text("Last piece: " + lastPiece, 20, 40);
  text("Bag: " + bag.join(", "), 20, 80);

  applyGravity();
  arrowmoveTimer();
}

function refillBag() {
  bag = ['T', 'Z', 'S', 'L', 'J', 'O', 'I'];

  // shuffle (cred. fisher-yates shuffle algorithm)
  for (let i = bag.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
}

function getNextPiece() {
  if (bag.length === 0) refillBag();
  return bag.pop();
}

function refillQueue() {
  while (nextQueue.length < 5) {
    nextQueue.push(spawnBlock());
  }
}

function spawnBlock() {
  return new TetrisBlock(
    4,
    0,
    0,
    getNextPiece()
  );
}

function spawnNext() {
  currentBlock = nextQueue.shift();

  nextQueue.push(spawnBlock());
}

function canMove(dx) {
  let blocks = currentBlock.getBlocks();

  for (let b of blocks) {
    let newX = b.x + dx;
    let newY = b.y;

    // checks for left and right walls
    if (newX < 0 || newX >= gridCols) return false;

    // checks for placed blocks
    if (board[newY][newX] !== null) return false;
  }

  return true;
}

function canMoveDown() {
  let blocks = currentBlock.getBlocks();

  for (let b of blocks) {
    let newY = b.y + 1;
    let x = b.x;

    // checks for bottom
    if (newY >= gridRows) return false;

    // checks for placed blocks
    if (board[newY][x] !== null) return false;
  }

  return true;
}

function canRotate() {
  let oldRot = currentBlock.rot;

  currentBlock.rotate();

  if (isColliding(currentBlock)) {
    currentBlock.rot = oldRot;
  }
}

function isColliding(block) {
  let pieces = block.getBlocks();

  for (let p of pieces) {

    // checks for x 
    if (p.x < 0 || p.x >= gridCols) {
      return true;
    }

    // checks for y
    if (p.y < 0 || p.y >= gridRows) {
      return true;
    }

    if (board[p.y][p.x] !== null) {
      return true;
    }
  }

  return false;
}

function lockPiece() {
  if (isLocking) return;
  isLocking = true;

  let blocks = currentBlock.getBlocks();

  for (let b of blocks) {
    if (b.y >= 0 && b.y < gridRows && b.x >= 0 && b.x < gridCols) {
      board[b.y][b.x] = currentBlock.type;
    }
  }

  lastPiece = currentBlock.type;

  clearLines();
  spawnNext();

  isLocking = false;
}

function clearLines() {
  for (let y = gridRows - 1; y >= 0; y--) {

    let full = true;

    for (let x = 0; x < gridCols; x++) {
      if (board[y][x] === null) {
        full = false;
        break;
      }
    }

    if (full) {

      for (let row = y; row > 0; row--) {
        for (let x = 0; x < gridCols; x++) {
          board[row][x] = board[row - 1][x];
        }
      }

      for (let x = 0; x < gridCols; x++) {
        board[0][x] = null;
      }

      y++;
    }
  }
}

function hardDrop() {
  while (canMoveDown()) {
    currentBlock.y += 1;
  }

  lockPiece();
}

function applyGravity() {
  let now = millis();

  if (now - lastGravityTime > gravityInterval) {

    if (canMoveDown()) {
      currentBlock.y += 1;
    } else {
      lockPiece(); // spawn happens inside lockPiece now
    }

    lastGravityTime = now;
  }
}

function arrowmoveTimer() {
  let now = millis();

  if (now - moveTimer > moveDelay) {

    if (leftHeld && canMove(-1)) {
      currentBlock.x -= 1;
    }

    if (rightHeld && canMove(1)) {
      currentBlock.x += 1;
    }

    // soft drop
    if (downHeld) {
      if (canMoveDown()) {
        currentBlock.y += 1;
      } else {
        lockPiece();
      }
    }

    moveTimer = now;
  }
}

class GridBlock {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  draw() {
    let px = startX + this.x * cellWidth;
    let py = startY + this.y * cellHeight;
    push();
    fill(0, 0, 0, 25);
    noStroke();
    rect(
      px + gridGap / 2,
      py + gridGap / 2,
      cellWidth - gridGap,
      cellHeight - gridGap
    );
    pop();
  }
}

class TetrisBlock {
  constructor(x, y, rot, type) {
    this.x = x;
    this.y = y;
    this.rot = rot;
    this.type = type;
  }

  getBlocks() {
    let blocks = SHAPES[this.type];

    let rot = ((this.rot % 4) + 4) % 4;

    for (let r = 0; r < rot; r++) {
      blocks = blocks.map(b => ({ x: -b.y, y: b.x }));
    }

    return blocks.map(b => ({
      x: b.x + this.x,
      y: b.y + this.y
    }));
  }

  rotate() {
    this.rot = (this.rot + 1) % 4;
  }
}

const SHAPES = {
  T: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],
  Z: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  S: [{ x: -1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }],
  L: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }],
  J: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }],
  O: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  I: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }]
};

const TYPE_INDEX = {
  T: 0,
  Z: 1,
  S: 2,
  L: 3,
  J: 4,
  O: 5,
  I: 6
};

let lastPiece = "";

function keyPressed() {

  if (keyCode === LEFT_ARROW) leftHeld = true;
  if (keyCode === RIGHT_ARROW) rightHeld = true;
if (keyCode === DOWN_ARROW) {
  let now = millis();

  // checks double tap for hard drop
  if (now - lastDownTapTime < hardDropThreshold) {
    hardDrop();
    lastDownTapTime = 0;
    return;
  }

  lastDownTapTime = now;
  downHeld = true;
}

  if (keyCode === UP_ARROW) {
    let oldRot = currentBlock.rot;
    currentBlock.rotate();
    if (isColliding(currentBlock)) {
      currentBlock.rot = oldRot;
    }
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW) leftHeld = false;
  if (keyCode === RIGHT_ARROW) rightHeld = false;
  if (keyCode === DOWN_ARROW) downHeld = false;
}
