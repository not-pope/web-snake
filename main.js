let canvas = document.getElementById("canvas");
let screen = canvas.getContext("2d");
const [ROWS,COLS] = [40,40];
let WALLS = [];
const BLOCK_SIZE = 10;
const [WIDTH,HEIGHT] = [ROWS * BLOCK_SIZE, COLS * BLOCK_SIZE];
canvas.width = WIDTH;
canvas.height = HEIGHT+30;
const [RIGHT,LEFT,FIXED,DOWN,UP] =[1,-1,0,1,-1];
const [CREATE,IGNORE,DELETE] = [1,0,-1];
const [COLOR_HEAD,COLOR_BODY,COLOR_FOOD,COLOR_BG] = ["#2af53e","#7be085","#a83246","#2e333b"];
const [WHITE, GRAY, YELLOW, PURPLE] = ["#ffffff", "#a3a19d", "#d4d980", "#9d4fb3"];
const FPS = 20;
let TIMER;
let WALL_MODE = IGNORE;
let SNAKE;
let FOOD;

let MIN =10;
let MAX =0;
let ITER =0;

function Rect(x,y,width,height,color) {
  screen.fillStyle = color;
  screen.fillRect(x,y,width,height);  
}

function RandomInt(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}

function Constrain(x, min, max) {
  if (x>max)
    return min;
  if (x<min)
    return max;
  return x;
}

class Food {
  constructor(){
    this.x = -1;
    this.y = -1;
  }

  InWall(walls) {
  for (let i = 0; i < walls.length; i++) {
    const wall = walls[i];
    if(wall.x==this.x && wall.y==this.y){
      return true;
    }
  }
  return false;
}

  InSnake(snake) {
    if (snake.x==this.x && snake.y==this.y) {
      return true;
    }
    for (let i = 0; i < snake.body.length; i++) {
      const block = snake.body[i];
      if (block.x==this.x && block.y==this.y){
        return true;
      }
    }
    return false;
  }
  
  Place(walls,snake) {
    this.x = RandomInt(0,COLS-1);
    this.y = RandomInt(0,ROWS-1);
    if (this.InSnake(snake) || this.InWall(walls)){
      this.Place(walls,snake);
    }
  }
  
  Show() {
    Block(this.x,this.y,COLOR_FOOD,true);
  }
}

class Snake {
  constructor (){
    this.x = 0;
    this.y = 0;
    this.xdir = RIGHT;
    this.ydir = FIXED;
    this.body = [];
    this.score = 0;
  }

  dir(xdir, ydir){
    this.xdir = xdir;
    this.ydir = ydir;
  }

  update(grow=false){
    if (grow){
      this.body.unshift({x:this.x,y:this.y});
      this.x += this.xdir;
      this.y += this.ydir;
      this.x = Constrain(this.x,0,COLS-1);
      this.y = Constrain(this.y,0,ROWS-1);
    }else{
      for (let i = this.body.length-1; i >0; i--) {
        this.body[i].x = this.body[i-1].x;
        this.body[i].y = this.body[i-1].y;
      }
      if (this.body.length!=0){
        this.body[0].x = this.x;
        this.body[0].y = this.y;
      }
      this.x += this.xdir;
      this.y += this.ydir;
      this.x = Constrain(this.x,0,COLS-1);
      this.y = Constrain(this.y,0,ROWS-1);
    }
  }

  dead(){
    for (let i = 0; i < WALLS.length; i++) {
      const wall = WALLS[i];
      if (wall.x==this.x && wall.y==this.y){
        return true;
      }  
    }
    for (let i = 0; i < this.body.length; i++) {
      const block = this.body[i];
      if (block.x==this.x && block.y==this.y){
        return true;
      }
    }
    return false;
  }

  eat(food){
    if (this.x==food.x && this.y==food.y){
      return true;
    }
  }

  show(){
    Block(this.x,this.y,COLOR_HEAD);
    this.body.forEach(block =>Block(block.x,block.y,COLOR_BODY));
  }
}

function CurrentMode() {
  if (!TIMER){
    return "Game Over! => "+String(SNAKE.score);
  }else{
    if (WALL_MODE==IGNORE){
      return "Score: "+String(SNAKE.score);
    }else if (WALL_MODE==CREATE){
      return "Place some walls";
    }else{
      return "Delete some walls";
    }
  }
}

function gameLoop() {
  Rect(0,0,WIDTH,HEIGHT,COLOR_BG); // bg
  PrintWalls(); // walls
  Rect(0,HEIGHT,WIDTH,30,YELLOW); // status line
  Print(CurrentMode(),10,HEIGHT+25); // current mode
  FOOD.Show();
  SNAKE.show();
  if(SNAKE.eat(FOOD)){
    SNAKE.score++;
    SNAKE.update(grow=true);
    FOOD.Place(WALLS,SNAKE);
  }else{
    SNAKE.update(grow=false);
  }
  if(SNAKE.dead()){
    clearInterval(TIMER);
    TIMER=null;
    Rect(0,HEIGHT,WIDTH,30,YELLOW); // status line
    Print(CurrentMode(),10,HEIGHT+25); // current mode
    SNAKE = new Snake();
  }
  
}

function constroller(event) {
  if (event.key===" "){
    if (TIMER){
      clearInterval(TIMER);
      TIMER = null;
    }else{
      TIMER = setInterval(gameLoop,1000/FPS);
    }
  }else if(event.key==="c"){
    WALL_MODE = CREATE;
  }else if(event.key==="i"){
    WALL_MODE = IGNORE;
  }else if(event.key==="d"){
    WALL_MODE = DELETE;
  }else if(event.key=="ArrowRight"){
  SNAKE.dir(RIGHT,FIXED);
  }else if(event.key=="ArrowLeft"){
  SNAKE.dir(LEFT,FIXED);
  }else if(event.key=="ArrowUp"){
  SNAKE.dir(FIXED,UP);
  }else if(event.key=="ArrowDown"){
  SNAKE.dir(FIXED,DOWN);
  }
}

function GameSetup() {
  window.addEventListener("keydown",constroller);
  SNAKE = new Snake();
  FOOD = new Food();
  FOOD.Place(WALLS,SNAKE);
  TIMER = setInterval(gameLoop,1000/FPS);
}

function Block(x,y,color,zoomed=false) {
  screen.fillStyle = color;
  if (!zoomed){
    screen.fillRect(x*BLOCK_SIZE,y*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
  }else{
    screen.fillRect(x*BLOCK_SIZE-2,y*BLOCK_SIZE-2,BLOCK_SIZE+4,BLOCK_SIZE+4);
  }
}

function PrintWalls() {
  for (let i = 0; i<WALLS.length; i++){
    Block(WALLS[i].x,WALLS[i].y,WHITE);
  }
}

function IsWall(x,y) {
  for (let i = 0; i<WALLS.length; i++){
    if (WALLS[i].x==x && WALLS[i].y==y){
      return true;
    }
  }
  return false;
}

function CreateWall(x,y) {
  if (!IsWall(x,y)){
    WALLS.push({x,y});
  }
}

function DeleteWall(x,y) {
  for (let i = 0; i<WALLS.length; i++){
    if(WALLS[i].x==x && WALLS[i].y==y){
      WALLS.splice(i,1);
      return;
    }
  }
}

function Print(text,x,y) {
  screen.font = "25px monospace";
  screen.fillStyle = PURPLE;
  screen.fillText(text,x,y);
}
  // console.log("clientX="+String(event.clientX));
  // console.log("clientY="+String(event.clientY));

window.addEventListener("mousemove",(event)=>{
  let x = event.clientX
  let y = event.clientY
  let minx = canvas.offsetLeft;
  let maxx = WIDTH + minx;
  let miny = canvas.offsetTop;
  let maxy = HEIGHT + miny;
  if ((x<minx || x>=maxx) || (y<miny || y>=maxy)){
    return;
  }
  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;
  x = Math.floor(x/BLOCK_SIZE);
  y = Math.floor(y/BLOCK_SIZE);
  if (WALL_MODE==CREATE){
    CreateWall(x,y);
  }else if(WALL_MODE==DELETE){
    DeleteWall(x,y);
  }else{
    return;
  }
});

GameSetup();