function preload() {
  white = color(217);
  lightgray = color(149);
  mediumgray = color(85);
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
  createCanvas(1125, 800);
}

function draw() {


  //ui
  background(darkgray);
  image(rectframe, 223, 0, 680, 800);
  image(bigchinese, 360, 315, 68, 403);
  image(heldui, 358, 155, 70, 110);
  image(nextui, 729, 155, 70, 278);
  image(levelui, 729, 430, 70, 86);
  image(gameui, 436, 155, 285, 562);
  image(logo, 489, 51, 182, 89);
}
