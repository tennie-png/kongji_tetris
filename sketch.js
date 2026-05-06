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
let bag = [];
let currentBlock;
let nextQueue = [];
let purewhite, white, lightgray, mediumgray, darkgray, black;
let COLORS;

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
    let offsetY = 0;

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
}

function refillBag() {
  bag = ['T', 'Z', 'S', 'L', 'J', 'O', 'I'];

  // shuffle (Fisher-Yates)
  for (let i = bag.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
}

function getNextPiece() {
  if (bag.length === 0) refillBag();
  return bag.pop();
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


