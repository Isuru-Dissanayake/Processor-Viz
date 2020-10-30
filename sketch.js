/**  Author : Ramith Hettiarachchi
 * 
 * 
 *  Visualizer for Processor H^2KR
 * 
 *  im@ramith.fyi
 * 
 * 
 *  **/



let xOffset = 0.0;
let yOffset = 0.0;
let bx=0;
let by=0;
var PanZoom = false;


var cols, rows;
var offset=37.5 + 14;
var GridSize=50;
var Zoom=1;
var Background=[245,25];

var Cores = ['core1','core2','core3','core4'];
var Instructions = ['RSTALL','CONST','MOV','SIZE n','SUB','JMPNZ a','MOVMSB','ADDX','ADDY','MUL','ADD','LOAD'];
var Ra=0;
var Rb=0;


var consoleLog=[];
var regLog=[];
var code="";

var code_pos = 0;
var code_pos_p = 0;
var current_instruction ="";

var infoLog=[];
var line_array_readings=[]
var consoleBuffer=0;

function dec2bin(dec){
  return (dec >>> 0).toString(2);
}

class Memory {
  constructor(name,x) {
    this.name = name;
    this.x = x;
    this.M ={};
    for (var x = 0; x < 64; x++) {
      this.M[x] = 0;
    }

  }

  displayMem(){
    let s = this.name + ' memory';
    fill(0, 102, 153);
    let offy = windowWidth-350;
    let offx = 0;
    let x = this.x;
    rect(200 + offy + x, 200 + offx, 380,350);
  
    fill(0);
    textSize(20);
    text(s, 220 + offy +x , 220 + offx, 380,350); // Text wraps within text box
  
    let i = 0;
    let j = 0;
    for (var key in this.M ) {
          if(i == 15*16){
            j +=87;
            i = 0;
          }
          if(code_pos_p==key){
            fill(0, 255,0);
          }else{
            fill(220, 255,255);
          }
          
        
          rect(80 + offy + j + x, 100 + offx + i, 85,12);
          fill(0); textSize(12);
          text(key + ":   " + this.M[key], 80 + offy + j + x, 100 + offx + i, 85,12);
          i+=15;
    }
  }
}

let M = new Memory('Data',-70);
//let IM = new Memory('Instruction',0);

class Core {
  constructor (idx, idy) {
    this.idx = idx;
    this.idy = idy;
    this.z   = 0;
    this.name = 'Core (' + this.idx + "," + this.idy + ")";
    this.R ={'NULL':0,'AR':0, 'DR':0 ,'PC':0,'IR':0,'R1':0, 'R2':0 , 'R3':0, 'R4':0, 'R5':0, 'R6':0, 'R7':0, 'AC':0};
    this.Rkeys = Object.keys(this.R);
    
  }
  RSTALL(){   //Clears all General Purpose Registers
    for (var key = 5; key < 12; key++ ) {
      this.R[this.Rkeys[key]] = 0;
      console.log(this.name + " | " + "==> " + this.Rkeys[key] + " set to 0")
    }
  }
  CONST(a){   //R1 = a
    this.R['R1']=a;
    console.log(this.name + " | " + "==> R1 " + "set to "+a)
  }
  MOV(Ra,Rb){ //Ra = Rb
    this.R[this.Rkeys[Ra]] = this.R[this.Rkeys[Rb]]
    console.log(this.name + " | " + "==> " + this.Rkeys[Ra] + " set to "+ this.Rkeys[Rb])
  }
  SIZE(n){    //R3 = n, R4 = n^2
    this.R['R3'] = n;
    this.R['R4'] = n**2;
    console.log(this.name + " | " + "==> R3 = "+ this.R['R3'] + "; R4 = "+ this.R['R4']);
  }
  SUB(){      //AC = AC - R5
    console.log(this.name + " | " + "==> AC = "+ this.R['AC'] + " - "+ this.R['R5']);
    this.R['AC'] = this.R['AC'] - this.R['R5'];
    
  }
  JMPNZ(a){   //PC = a IF z!=0
    if(this.z!=0){
      this.R['PC'] = a
    }
    console.log(this.name + " | " + "==> PC = "+ a +" (if z!=0)");

  }
  MOVMSB(){   //AC = {000000,R1[3:2]}
    var R1_B     = dec2bin(this.R['R1'])
    var R1_b2    = '0b'+'0'.repeat((8-(R1_B.length))) + R1_B;
    this.R['AC'] =  (R1_b2&0b1100)>>2


    console.log(this.name + " | " + "==> AC = {000000, "+ dec2bin((R1_b2&0b1100)>>2) +"}");;

  } 
  ADDX(){     //AC = AC + IDX
    this.R['AC'] = this.R['AC'] + this.idx
    console.log(this.name + " | " + "==> AC = "+ this.R['AC'] + " + " + this.idx);

  }
  ADDY(){     //AC = AC + IDY
    this.R['AC'] = this.R['AC'] + this.idy 
    console.log(this.name + " | " + "==> AC = "+ this.R['AC'] + " + " + this.idy);
  }
  MUL(){      //AC = AC * R5
    this.R['AC'] = this.R['AC']*this.R['R5']
    console.log(this.name + " | " + "==> AC = "+ this.R['AC'] + " * " + this.R['R5']);
  }
  ADD(){      //AC = AC + R5
    this.R['AC'] = this.R['AC'] + this.R['R5'];
    console.log(this.name + " | " + "==> AC = "+ this.R['AC'] + " + " + this.R['R5']);
  }
  LOAD(){     //DR = M[AC]
    this.R['DR'] = M[this.R['AC']];
    console.log(this.name + " | " + "==> DR = M["+ this.R['AC'] + "]");
  }
  displaycore(){
    fill(200);
    let offy = 210*this.idy;
    let offx = 210*this.idx;
    rect(200 + offy, 200 + offx, 200,200);
  
    fill(0, 102, 153);
    textSize(26);
    text(this.name, 220 + offy , 220 + offx, 200,200); // Text wraps within text box
  
    let i = 0;
    let j = 0;
    for (var key in this.R ) {
          if(i == 15*7){
            j +=50;
            i = 0;
          }
          fill(255-j*4 , j*3,j*5); rect(200 + offy + j, 200 + offx + i, 40,12);
          fill(0); textSize(12);
          text(key + ":" + this.R[key], 200 + offy +j, 200 + offx + i, 40,12);
          i+=15;
    }
  }
}




function setup() {
  green=false;
  frameRate(5);
  //pixelDensity(4);
  createCanvas(windowWidth, windowHeight);

  console_area=createElement('textarea', 'Console ');
  console_area.attribute("rows","40");
  console_area.attribute("cols","62");
  console_area.attribute("readonly",true);

  area= createElement('textarea', 'Visualization Log');
  area.attribute("rows","40");
  area.attribute("cols","42");
  area.attribute("readonly",true);


  code_area= createElement('textarea', 'Copy Paste Assembly Code');
  code_area.attribute("rows","40");
  code_area.attribute("cols","50");

  //arduino_mega2 = loadImage('arduino_mega_small.png');
  rectMode(CENTER);
  angleMode(DEGREES);


  
  gui = createGui('Processor Visualizer', windowWidth - 230 , windowHeight - 430 );
  gui.addButton("Load Code", function() {
    LoadCode();
  });
  
  sliderRange(0, 90, 1);
  gui.addGlobals('GridSize');
  sliderRange(0, 360, 5);
  gui.addGlobals('OrientationOffSet');
  sliderRange(0.3, 3, 0.01);
  gui.addGlobals('Zoom');
  sliderRange(0, 1023,1);
  gui.addGlobals('PanZoom');

  gui.addGlobals('Background');
  gui.addGlobals('Cores');
  gui.addGlobals('Instructions');
  
  sliderRange(0,15,1);
  gui.addGlobals('Ra');
  sliderRange(0,15,1);
  gui.addGlobals('Rb');
  
  
  gui.addButton("Execute ", function() {
    Execute();
  });
  gui.addButton("Next ", function() {
    Next();
  });
  gui.addButton("Reset", function() {
    ResetWindow();
  });

  consoleLog = loadStrings('isa.txt');
  regLog     = loadStrings('reg.txt');
  code       = loadStrings('code.txt');
  
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
let core1 = new Core(0,0);
core1.RSTALL();
eval('core1.CONST(0b1111)');
core1.MOV(0b1001,0b0101);
core1.SUB();
core1.JMPNZ(0b10);
core1.SIZE(0b110);
core1.MOVMSB();

let core2 = new Core(0,1);
let core3 = new Core(1,0);
let core4 = new Core(1,1);

function draw() {
  background(Background);
  translate(bx,by); // pan on mouse drag
  draw_grid();
  scale(Zoom);
  //draw_ISA();

  core1.displaycore();
  core2.displaycore();
  //core3.displaycore();
  core4.displaycore();
  M.displayMem();
  //IM.displayMem();

  fill(55);
  rect(windowWidth/2 - 50, 100 - 70, 200,30);
  fill(255, 255, 255);
  textSize(17);
  text(current_instruction, windowWidth/2 - 50 + 20 , 100 - 70 + 5, 200,30); // Text wraps within text box

  console_area.elt.value = consoleLog.join("\n");
  area.elt.value         = regLog.join("\n");

  
  push();
  let fps = frameRate();
  fill(100);
  stroke(1);
  text("FPS: " + fps.toFixed(2),  9*width/10, 9*height/10 -20*5);
  pop();

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
function ResetWindow() {

  Zoom=1;
  bx=0;
  by=0;

}

function Execute(){
  if(Instructions=='CONST'){
    eval(Cores+'.'+Instructions+'('+Ra+')');
  }else if(Instructions=='MOV'){
    eval(Cores+'.'+Instructions+'('+Ra+','+Rb+')');
  }else{

    eval(Cores+'.'+Instructions+'()');
  }
  i+=1;
  console.log("Execute Instruction");
}
function Next(){

  console.log("Next Instruction");
  code_pos_p = code_pos;
  switch(M.M[code_pos]) {
    case 'CONST':
      current_instruction = M.M[code_pos] + " " + M.M[code_pos+1];
      code_pos+=2;
      break;
    case 'SIZE':
      current_instruction = M.M[code_pos] + " " + M.M[code_pos+1];
      code_pos+=2;
      break;
    case 'MOV':
      current_instruction = M.M[code_pos] + " " + M.M[code_pos+1] + " " + M.M[code_pos+2];
      code_pos+=3;
        break;
    case 'JMPNZ':
      current_instruction = M.M[code_pos] + " " + M.M[code_pos+1];
      code_pos+=2;
        break;
    default:
      current_instruction = M.M[code_pos]
      code_pos+=1;
      
      // code block
  }

}

function LoadCode(){
  if(code_area.elt.value=="Copy Paste Assembly Code"){
    code_area.elt.value = code.join("\n");

  }else{
    code  = code_area.elt.value.split("\n");
  }
  
  l = 0;
  for (var k = 0; k < code.length; k++ ) {
      split = code[k].split(" ");
  
      for (var m = 0;m <split.length;m++){
        if(split[m]==" "){
          continue;
        }else{
          var temp = split[m];
          temp = temp.replace(/[.,;\s]/g,"");
          M.M[l] = temp;
          l++;
        }
      }
  }
  console.log("Load Code");
}



