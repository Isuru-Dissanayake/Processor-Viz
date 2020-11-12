/**  Author : Isuru Dissanayake
 * 
 * 
 *  Processor Visualizer for Project FPGA
 *  
 * 
 *  To Run : browser-sync start --server -f -w
 * 
 * 
 *  **/
let xOffset = 0.0;
let yOffset = 0.0;
let bx=0;
let by=0;
var PanZoom = false;
var speed=25;
var fps=3;

var cols, rows;
var offset=37.5 + 14;
var GridSize=50;
var Zoom=0.9;
var Background=[24,245];

var autorun = false;

var Cores = ['core1','core2','core3','core4','core5','core6','core7','core8','core9','core10','core11','core12','core13','core14','core15','core16'];
var cores_n = 4;
var Instructions = ['RST','MOV','LOAD','STORE','LOADR','ADD','ADDONE','MUL','FLR','SUB','SUBONE','ROOF','MOD','JMPNZ'];
var Instruction_Info = {
  'HI' : 'WELLCOME',
  'RST' : 'RESET TO 0',
  'MOV' : 'SET Rb = Ra',
  'LOAD' : 'Rb = DM.M[alpha]',
  'STORE' : 'DM.M[alpha] = Rb',
  'LOADR' : 'Rb = DM.M[Ra]',
  'ADD' : 'AC = Ra + Rb',
  'ADDONE' : 'AC = Ra + 1',
  'MUL' : 'AC = Ra * Rb',
  'FLR' : 'AC = FLOOR(Ra/Rb)',
  'SUB' : 'AC = Ra - Rb',
  'SUBONE' : 'AC = Ra - 1',
  'ROOF' : 'AC = ROOF(Ra/Rb)',
  'MOD' : 'AC = Ra%Rb',
  'JMPNZ' : 'PC = a'
};

var regIdentifier = {
  'NULL':0b00000,
  'R1':0b00001, 
  'R2':0b00010, 
  'R3':0b00011, 
  'R4':0b00100, 
  'R5':0b00101, 
  'R6':0b00110, 
  'R7':0b00111, 
  'R8':0b01000, 
  'R9':0b01001, 
  'R10':0b01010, 
  'R11':0b01011, 
  'R12':0b01100, 
  'R13':0b01101, 
  'R14':0b01110, 
  'TO':0b01111,
  'PC':0b10000,
  'AC':0b10001,
  'Z':0b10010,
  'I' : 0b10011,
  'ALL':0b10100
}

var latestupdates=[];
var latestmemoryupdates=[];


var Ra=0;
var Rb=0;


var consoleLog=[];
var regLog=[];
var code="";
var matrix;

var code_pos = 0;
var code_pos_p = 0;
var current_instruction ="HI";
var samplecodes = ['2x2','3x3','4x4','2x2x2x3'];

var infoLog=[];
var line_array_readings=[]
var consoleBuffer=0;


function dec2bin(dec){
  return (dec >>> 0).toString(2);
}
Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

let img;
function preload() {
  img = loadImage('core.jpg');
}

class Memory {
  constructor(name,x) {
    this.name = name;
    this.x = x;
    this.M ={};
    for (var x = 0; x < 128; x++) {
      this.M[x] = 0;
    }

  }

  displayMem(){
    let s = this.name + 'Memory';
    fill(50);
    let offy = windowWidth - 370;
    let offx = this.x;
    rect(200 + offy - 70, 200 + offx , 460,630);
  
    fill(255);
    textSize(20);
    text(s, 210 + offy - 70 , 220 + offx, 460,420); 
  
    let i = 0;
    let j = 0;
    for (var key in this.M ) {
          if(i == 15*32){
            j +=109;
            i = 0;
          }
          if(this.name=='Instruction ')
          if(code_pos_p==key){
            fill(254,255,0);
          }else{
            fill(220, 220,220);
          }

          if(this.name=='Data ')
          if(latestmemoryupdates.includes(parseInt(key))){
            let cs = [254,255,0];
            if(latestmemoryupdates.includes(-1))cs = [253,186,22];
            fill(cs[0], cs[1],cs[2]);
          }else{
            fill(220, 220,220);
          }
          rect(70 + offy + j - 80, 37 + offx + i, 110,12);
          fill(0); textSize(12);
          text(key + ":   " + this.M[key], 70 + offy + j - 80, 37 + offx + i, 110,12);
          i+=15;
    }
  }
}

let M = new Memory('Instruction ',0);
let DM =new Memory('Data ',520);


class Core {
  constructor (idx, idy, q) {
    this.idx = idx;
    this.idy = idy;
    this.name = 'Core (' + this.idx + "," + this.idy + ")";
    this.R ={
      'NULL':0,
      'R1':0, 
      'R2':0, 
      'R3':0, 
      'R4':0, 
      'R5':0, 
      'R6':0, 
      'R7':0, 
      'R8':0, 
      'R9':0, 
      'R10':0, 
      'R11':0, 
      'R12':0, 
      'R13':0, 
      'R14':0, 
      'TO':0,
      'PC':0,
      'AC':0,
      'Z':0,
      'I' : q,
      'ALL':0
    };
    this.Rkeys = Object.keys(this.R);
    
  }
  RST(Ra){   
    if (this.Rkeys[Ra] == 'ALL') {
      for (var key = 0; key < this.Rkeys.length; key++ ) {
        if (this.Rkeys[key] == 'I'){
          continue;
        }else{
          this.R[this.Rkeys[key]] = 0;
          latestupdates.push(this.Rkeys[key]);
          console.log(this.name + " | " + "==> " + this.Rkeys[key] + " set to 0")
        }
      }
    } else {
        this.R[this.Rkeys[Ra]] == 0;
        latestupdates.push(this.Rkeys[Ra]);
        console.log(this.name + " | " + "==>" + this.Rkeys[Ra] + " set to 0")
    }
  }
  MOV(Ra,Rb){ 
    this.R[this.Rkeys[Rb]] = this.R[this.Rkeys[Ra]]
    latestupdates.push(this.Rkeys[Rb])
    console.log(this.name + " | " + "==> " + this.Rkeys[Rb] + " set to "+ this.Rkeys[Ra])
  }
  LOAD(alpha,Rb){
    this.R[this.Rkeys[Rb]] = DM.M[alpha]
    latestupdates.push(this.Rkeys[Rb])
    console.log(this.name + " | " + "==>" + this.Rkeys[Rb] + "=" + "DM.M[" + alpha + "]")
  }
  STORE(Ra,Rb){
    DM.M[this.R[this.Rkeys[Ra]]] = parseInt(this.R[this.Rkeys[Rb]]);
    latestmemoryupdates.push(this.R[this.Rkeys[Ra]]);
    console.log(this.name + " | " + "==> DM.M[" + this.Rkeys[Ra] + "] = "+ this.Rkeys[Rb]);
  }
  LOADR(Ra,Rb){
    this.R[this.Rkeys[Rb]] = parseInt(DM.M[this.R[this.Rkeys[Ra]]]);
    latestupdates.push(this.Rkeys[Rb])
    console.log(this.name + " | ==>" + this.Rkeys[Rb] + "== DM.M[" + this.Rkeys[Ra] + "]")
  }
  ADD(Ra,Rb){
    this.R['AC'] = this.R[this.Rkeys[Ra]] + this.R[this.Rkeys[Rb]]
    latestupdates.push('AC')
    console.log(this.name + " | " + "==> AC = "+ this.R[this.Rkeys[Ra]] + " + " + this.R[this.Rkeys[Rb]]);
  }
  ADDONE(Ra){
    this.R['AC'] = this.R[this.Rkeys[Ra]] + 1
    latestupdates.push('AC')
    console.log(this.name + " | " + "==> AC = "+ this.R[this.Rkeys[Ra]] + " + " + "1");
  }
  MUL(Ra,Rb){
    this.R['AC'] = this.R[this.Rkeys[Ra]]*this.R[this.Rkeys[Rb]]
    latestupdates.push("AC")
    console.log(this.name + " | " + "==> AC = "+ this.R[this.Rkeys[Ra]] + " * " + this.R[this.Rkeys[Rb]]);
  }
  FLR(Ra,Rb){
    this.R['AC'] = Math.floor(this.R[this.Rkeys[Ra]]/this.R[this.Rkeys[Rb]])
    latestupdates.push("AC")
    console.log(this.name + " | " + "==> AC = "+ this.R[this.Rkeys[Ra]] + " FLOOR " + this.R[this.Rkeys[Rb]]);
  }
  SUB(Ra,Rb){
    this.R['AC'] = this.R[this.Rkeys[Ra]] - this.R[this.Rkeys[Rb]]
    latestupdates.push("AC")
    if (this.R['AC'] == 0)this.R['Z']=1;
    else this.R['Z']=0;
    console.log(this.name + " | " + "==> AC = "+ this.R[this.Rkeys[Ra]] + " - " + this.R[this.Rkeys[Rb]]);
  }
  SUBONE(Ra){
    this.R['AC'] = this.R[this.Rkeys[Ra]] - 1
    latestupdates.push("AC")
    console.log(this.name + " | " + "==> AC = "+ this.R[this.Rkeys[Ra]] + " - " + "1");
  }
  ROOF(Ra,Rb){
    this.R['AC'] = Math.ceil(this.R[this.Rkeys[Ra]]/this.R[this.Rkeys[Rb]])
    latestupdates.push('AC')
    console.log(this.name + " | " + "==> AC = "+ this.R[this.Rkeys[Ra]] + " ROOF " + this.R[this.Rkeys[Rb]]);
  }
  MOD(Ra,Rb){
    this.R['AC'] = this.R[this.Rkeys[Ra]]%this.R[this.Rkeys[Rb]]
    latestupdates.push('AC')
  }
  JMPNZ(a){   
    if(this.R['Z']==0){
      this.R['PC'] = a
      latestupdates.push('PC');
      console.log(this.name + " | " + "==> PC = "+ a +" (if z==1)");
    }
  }
  displaycore(){
    fill(200);
    let offy = 210*this.idy;
    let offx = 210*this.idx;
    rect(150 + offy, 150 + offx, 200,200);
    image(img, 50+ offy, 50+  offx, 200,200);
  
    fill(255);
    textSize(23);
    text(this.name, 170 + offy , 170 + offx, 200,200); // Text wraps within text box
  
    let i = 0;
    let j = 0;
    for (var key in this.R ) {
        if(key =='NULL' || key == 'ALL' || key == 'I'){
          continue;
        }
          if(i == 15*6){
            j +=50;
            i = 0;
          }
          if(latestupdates.includes(key)){
            fill(255, 255,0); 
          }else{
            fill(220, 220,220); 
          }
          
          rect(100 + offy + j, 150 + offx + i, 40,12);
          fill(0); textSize(12);
          text(key + ":" + this.R[key], 100 + offy +j, 150 + offx + i, 40,12);
          i+=15;

          
    }
  }
}

function setup() {
  green=false;
  frameRate(5);
  createCanvas(windowWidth - 10, windowHeight + 600);

  console_area=createElement('textarea', 'Console ');
  console_area.attribute("rows","40");
  console_area.attribute("cols","70");
  console_area.attribute("readonly",true);

  area= createElement('textarea', 'Visualization Log');
  area.attribute("rows","40");
  area.attribute("cols","42");
  area.attribute("readonly",true);


  code_area= createElement('textarea', 'Copy Paste Assembly Code');
  code_area.attribute("rows","40");
  code_area.attribute("cols","35");

  matrix_area = createElement('textarea', 'Copy Paste Matrix');
  matrix_area.attribute("rows","40");
  matrix_area.attribute("cols","40");

  rectMode(CENTER);
  angleMode(DEGREES);


  
  gui = createGui('Processor Visualizer', windowWidth/2 - 150 , windowHeight/2 - 100);
  sliderRange(1,16,1);
  gui.addGlobals('cores_n');
  gui.addGlobals('samplecodes');
  gui.addButton("Select Sample", function() {
    LoadSample();
  });
  gui.addButton("Load Code & Matrix", function() {
    LoadCode();
    LoadMatrix();

  });
  gui.addButton("Next Instruction ", function() {
    Next();
  });
  gui.addButton("Reset", function() {
    Reset();
  });
  gui.addGlobals('autorun');


  sliderRange(0, 90, 1);
  gui.addGlobals('GridSize');
  sliderRange(0, 360, 5);
  gui.addGlobals('OrientationOffSet');
  sliderRange(0.3, 3, 0.01);
  gui.addGlobals('Zoom');
  sliderRange(0, 1023,1);
  gui.addGlobals('PanZoom');

  consoleLog = loadStrings('isa.txt');
  regLog     = loadStrings('reg.txt');
  code       = loadStrings('code.txt');
  matrix     = loadStrings('matrix.txt');
  
  console.log("ammo");
}


function draw_grid(){
  for (var x = 0; x < width; x +=GridSize*Zoom) {
		for (var y = 0; y < height; y += GridSize*Zoom) {
			stroke(59, 172, 251);
			strokeWeight(0.04);
      line(-x, -height, -x, height);
      line(x, -height, x, height);
      line(-width, y, width, y);
      line(-width, -y, width, -y);
		}
  }
}

function draw_ISA(){
  for (var x = 100; x < width/4; x +=GridSize*Zoom/2) {
		for (var y = 100; y < height/4; y += GridSize*Zoom/2) {
			stroke(255, 0, 0);
			strokeWeight(0.04);
      line(-x, -height, -x, height);
      line(x, -height, x, height);
      line(-width, y, width, y);
      line(-width, -y, width, -y);
		}
  }
}


let core1 = new Core(0,0,1);
let core2 = new Core(0,1,2);
let core5 = new Core(0,2,5);
let core10 = new Core(0,3,10);
let core3 = new Core(1,0,3);
let core4 = new Core(1,1,4);
let core6 = new Core(1,2,6);
let core11 = new Core(1,3,11);
let core7 = new Core(2,0,7);
let core8 = new Core(2,1,8);
let core9 = new Core(2,2,9);
let core12 = new Core(2,3,12);
let core13 = new Core(3,0,13);
let core14 = new Core(3,1,14);
let core15 = new Core(3,2,15);
let core16 = new Core(3,3,16);

function draw() {
  background(Background);
  translate(bx,by); // pan on mouse drag
  draw_grid();
  
  DM.displayMem();
  M.displayMem();
  //DM.M[3] = cores_n
  scale(Zoom);

  for(let k = 1;k<=cores_n;k++){
    eval('core'+k+'.displaycore()');
  }

  fill(55);
  rect(windowWidth/2 - 50, 100 - 80, 200,30);
  fill(255, 255, 255);
  textSize(17);
  text(current_instruction, windowWidth/2 - 50 + 20 , 100 - 80 + 5, 200,30); // Text wraps within text box

  fill(220, 220,220);
  rect(windowWidth/2 + 10 , 100 - 60, 320,20);
  fill(0);
  textSize(13);
  var temp = current_instruction.split(" ")[0]
  text(Instruction_Info[temp], windowWidth/2   + 30 , 100 - 50 , 260,30); // Text wraps within text box

  console_area.elt.value = consoleLog.join("\n");
  area.elt.value         = regLog.join("\n");

  
  push();
  let fps = frameRate();
  fill(100);
  stroke(1);
  text("FPS: " + fps.toFixed(2),  9*width/10, 9*height/10 -20*5);
  pop();

  if(autorun)
  if(code_pos < code.length){
    
      Next();
      delay(speed);
  }else{
    autorun = false;
  }

}
function mousePressed(){
  xOffset = mouseX - bx;
  yOffset = mouseY - by;
}
function mouseDragged() {
  if(mouseX>windowWidth/5 &&false){
    bx = mouseX - xOffset;
    by = mouseY - yOffset;
  }
}
function mouseWheel(event) {


  print(event.delta);
  //move the square according to the vertical scroll amount
  //if(event.delta>0){
    if(mouseY < windowHeight*2/3 && false){
      Zoom+=event.delta*0.01;
    }
  //}
  //uncomment to block page scrolling
  //return false;
  return false;
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
function ResetWindow() {

  Zoom=1;
  bx=0;
  by=0;

}
function delay(ms) {
  var cur_d = new Date();
  var cur_ticks = cur_d.getTime();
  var ms_passed = 0;
  while(ms_passed < ms) {
      var d = new Date();  // Possible memory leak?
      var ticks = d.getTime();
      ms_passed = ticks - cur_ticks;
      // d = null;  // Prevent memory leak?
  }
}
function Reset() {

  code_pos = 0;
  code_pos_p = 0;
  current_instruction ="HI";

}

function Next(){
  latestupdates = [];
  latestmemoryupdates = [];
  console.log("Next Instruction");
  code_pos_p = code_pos;
  console.log("=> "+M.M[code_pos][0]);
  for(var iter = 1; iter <= cores_n; iter++){
    AC = eval('core' + iter + '.R["AC"]' );
    console.log(AC);
    if (AC >= 0){
      switch(M.M[code_pos][0]) {
        case 'RST':
          current_instruction = M.M[code_pos][0] + " " + M.M[code_pos][1];
          eval('core'+iter+'.'+M.M[code_pos][0]+'('+regIdentifier[M.M[code_pos][1]]+')');
          if(iter==cores_n)code_pos+=1;
          break;
        case 'ADDONE':
          current_instruction = M.M[code_pos][0] + " " + M.M[code_pos][1];
          eval('core'+iter+'.'+M.M[code_pos][0]+'('+regIdentifier[M.M[code_pos][1]]+')');
          if(iter==cores_n)code_pos+=1;
          break;
        case 'SUBONE':
          current_instruction = M.M[code_pos][0] + " " + M.M[code_pos][1];
          eval('core'+iter+'.'+M.M[code_pos][0]+'('+regIdentifier[M.M[code_pos][1]]+')');
          if(iter==cores_n)code_pos+=1;
          break;
        case 'JMPNZ':
          current_instruction = M.M[code_pos][0] + " " + M.M[code_pos][1];
          eval('core'+iter+'.'+M.M[code_pos][0]+'('+M.M[code_pos][1]+')');
          if(iter==cores_n){
            if(core1.R['Z']==0) code_pos = parseInt(M.M[code_pos][1])
            else code_pos+=1;
          }
          break;
        case 'LOAD':
          current_instruction = M.M[code_pos][0] + " " + M.M[code_pos][1] + " " + M.M[code_pos][2];
          eval('core'+iter+'.'+M.M[code_pos][0]+'('+M.M[code_pos][1]+','+regIdentifier[M.M[code_pos][2]]+')');
          if(iter==cores_n)code_pos+=1;
          break;
        default:
          current_instruction = M.M[code_pos][0] + " " + M.M[code_pos][1] + " " + M.M[code_pos][2];
          eval('core'+iter+'.'+M.M[code_pos][0]+'('+regIdentifier[M.M[code_pos][1]]+','+regIdentifier[M.M[code_pos][2]]+')');
          if(iter==cores_n)code_pos+=1;
          break;
      }
    }else{
      console.log('negq')
      if(iter==cores_n)code_pos+=1;
    }
  }
}

function LoadCode(){
  
  if(code_area.elt.value=="Copy Paste Assembly Code"){
    code_area.elt.value = code.join("\n");
    console.log("karanawa");

  }else{
    code  = code_area.elt.value.split("\n");
    console.log("hmm")
  }
  
  l = 0;

  console.log(code.length)
  for (var k = 0; k < Object.size(M.M) ; k++ ) {
      if(k < code.length){
        
        temp = code[k].replace(/[.,;\t]/g,"");
        split = temp.split(" ");
        M.M[l] = split;
      }else{
        M.M[l] = ['0'];
      }
      l++;
  }
  console.log("Load Code");
}
function LoadMatrix(){
  if(matrix_area.elt.value=="Copy Paste Matrix"){
     matrix_area.elt.value = matrix.join("\n");

  }else{
    matrix  = matrix_area.elt.value.split("\n");
  }
  
  l = 0;
  for (var k = 0; k < matrix.length; k++ ) {
      split = matrix[k].split(" ");
  
      for (var m = 0;m < split.length; m++){
        if(split[m]==" "){
          continue;
        }else{
          var temp = split[m];
          temp = temp.replace(/[.,;\s]/g,"");
          DM.M[l] = parseInt(temp);
          l++;
        }
      }
  }

  console.log("Load Code");
}

function LoadSample(){
  code_area.elt.value="Copy Paste Assembly Code";
  matrix_area.elt.value="Copy Paste Matrix";

  code       = loadStrings(samplecodes+'.txt');
  matrix     = loadStrings(samplecodes+'_data.txt');
}