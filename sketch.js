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


var Cores = ['core1','core2','core3','core4','core5','core6','core7','core8','core9','core10','core11','core12','core13','core14','core15','core16'];
var cores_n = 4;
var Instructions = ['RSTALL','CONST','MOV','SIZE n','SUB','JMPNZ a','MOVMSB','ADDX','ADDY','MUL','ADD','LOAD'];
var Instruction_Info = {
'HI' : 'WELCOME'
,'RSTALL'		: 'ALL GPR = 0'		
,'CONST'	    : 'R1 = a'		
,'MOV'	      : 'MOV Ra Rb => Ra = Rb'		
,'SIZE'	    	: 'R3 = n, R4 = n^2'		
,'SUB'		    : 'AC = AC - R5'		
,'JMPNZ'      : 'PC = a IF z != 0'		
,'MOVMSB'	  	: 'AC = {000000, R1[3:2]}'		
,'ADDX'		    : 'AC = AC + IDX'		
,'ADDY'		    : 'AC = AC + IDY'		
,'MUL'		    : 'AC = AC * R5'		
,'ADD'		    : 'AC = AC + R5'		
,'LOAD'		    : 'DR = M[AC]'		
,'MOVLSB'		  : 'AC = {000000, R1[1:0]}'		
,'INCI'		    : 'R2 = R2 + 1'		
,'STORE'		  : 'M[AC] = R7'		
,'RSTI'		    : 'R2 = 0'};
var RegIdentifier = {'AR':0b0001,
'DR':0b0010,
'PC':0b0011,
'IR':0b0100,
'R1':0b0101,
'R2':0b0110,
'R3':0b0111,
'R4':0b1000,
'R5':0b1001,
'R6':0b1010,
'R7':0b1011,
'AC':0b1100}

var latestupdates=[];


var Ra=0;
var Rb=0;


var consoleLog=[];
var regLog=[];
var code="";
var matrix;

var code_pos = 0;
var code_pos_p = 0;
var current_instruction ="HI";

var infoLog=[];
var line_array_readings=[]
var consoleBuffer=0;

function dec2bin(dec){
  return (dec >>> 0).toString(2);
}

let img;
function preload() {
  img = loadImage('core.png');
}

class Memory {
  constructor(name,x) {
    this.name = name;
    this.x = x;
    this.M ={};
    for (var x = 0; x < 80; x++) {
      this.M[x] = 0;
    }

  }

  displayMem(){
    let s = this.name + 'Memory';
    fill(0, 102, 153);
    let offy = windowWidth - 350;
    let offx = this.x;
    rect(200 + offy - 70, 200 + offx , 380,350);
  
    fill(255);
    textSize(20);
    text(s, 210 + offy - 70 , 220 + offx, 380,350); // Text wraps within text box
  
    let i = 0;
    let j = 0;
    for (var key in this.M ) {
          if(i == 15*20){
            j +=87;
            i = 0;
          }
          if(this.name=='Instruction ')
          if(code_pos_p==key){
            fill(0, 255,0);
          }else{
            fill(220, 255,255);
          }
          if(this.name=='Data ')
          if(eval(Cores+".R['AR']")==key){
            fill(254, 255,0);
          }else{
            fill(220, 255,255);
          }
          
        
          rect(70 + offy + j - 70, 75 + offx + i, 85,12);
          fill(0); textSize(12);
          text(key + ":   " + this.M[key], 70 + offy + j - 70, 75 + offx + i, 85,12);
          i+=15;
    }
  }
}

let M = new Memory('Instruction ',0);
let DM =new Memory('Data ',350);
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
    for (var key = 0; key < this.Rkeys.length; key++ ) {
      this.R[this.Rkeys[key]] = 0;
      latestupdates.push(this.Rkeys[key]);
      console.log(this.name + " | " + "==> " + this.Rkeys[key] + " set to 0")
    }
  }
  CONST(a){   //R1 = a
    this.R['R1']=a;
    latestupdates.push('R1');
    console.log(this.name + " | " + "==> R1 " + "set to "+a)
  }
  MOV(Ra,Rb){ //Ra = Rb
    this.R[this.Rkeys[Ra]] = this.R[this.Rkeys[Rb]]
    latestupdates.push(this.Rkeys[Ra],this.Rkeys[Rb])
    console.log(this.name + " | " + "==> " + this.Rkeys[Ra] + " set to "+ this.Rkeys[Rb])
  }
  SIZE(n){    //R3 = n, R4 = n^2
    this.R['R3'] = n;
    this.R['R4'] = n**2;
    latestupdates.push('R3','R4');
    console.log(this.name + " | " + "==> R3 = "+ this.R['R3'] + "; R4 = "+ this.R['R4']);
  }
  SUB(){      //AC = AC - R5
    console.log(this.name + " | " + "==> AC = "+ this.R['AC'] + " - "+ this.R['R5']);
    this.R['AC'] = this.R['AC'] - this.R['R5'];
    latestupdates.push('AC','R5');
  }
  JMPNZ(a){   //PC = a IF z!=0
    if(this.z!=0){
      this.R['PC'] = a
      
    }
    latestupdates.push('PC');
    console.log(this.name + " | " + "==> PC = "+ a +" (if z!=0)");

  }
  MOVMSB(){   //AC = {000000,R1[3:2]}
    var R1_B     = dec2bin(this.R['R1'])
    var R1_b2    = '0b'+'0'.repeat((8-(R1_B.length))) + R1_B;
    this.R['AC'] =  (R1_b2&0b1100)>>2

    latestupdates.push('R1','AC');
    console.log(this.name + " | " + "==> AC = {000000, "+ dec2bin((R1_b2&0b1100)>>2) +"}");;

  } 
  ADDX(){     //AC = AC + IDX
    this.R['AC'] = this.R['AC'] + this.idx
    console.log(this.name + " | " + "==> AC = "+ this.R['AC'] + " + " + this.idx);
    latestupdates.push('AC');
  }
  ADDY(){     //AC = AC + IDY
    this.R['AC'] = this.R['AC'] + this.idy 
    latestupdates.push('AC');
    console.log(this.name + " | " + "==> AC = "+ this.R['AC'] + " + " + this.idy);
  }
  MUL(){      //AC = AC * R5
    this.R['AC'] = this.R['AC']*this.R['R5']
    latestupdates.push('AC','R5');
    console.log(this.name + " | " + "==> AC = "+ this.R['AC'] + " * " + this.R['R5']);
  }
  ADD(){      //AC = AC + R5
    this.R['AC'] = this.R['AC'] + this.R['R5'];
    latestupdates.push('AC','R5');
    console.log(this.name + " | " + "==> AC = "+ this.R['AC'] + " + " + this.R['R5']);
  }
  LOAD(){     //DR = M[AC]
    this.R['DR'] = DM.M[this.R['AC']];
    latestupdates.push('DR','AC');
    console.log(this.name + " | " + "==> DR = DM.M["+ this.R['AC'] + "]");
  }
  MOVLSB(){
    var R1_B     = dec2bin(this.R['R1'])
    var R1_b2    = '0b'+'0'.repeat((8-(R1_B.length))) + R1_B;
    this.R['AC'] =  (R1_b2&0b0011)
    latestupdates.push('AC','R1');

    console.log(this.name + " | " + "==> AC = {000000, "+ dec2bin((R1_b2&0b0011)) +"}");;
  }
  INCI(){
    this.R['R2'] = this.R['R2'] + 1;
    latestupdates.push('R2');
    console.log(this.name + " | " + "==> R2 = "+ this.R['R2'] + " + 1");
  }
  STORE(){
    DM.M[this.R['AC']] = this.R['R7'];
    latestupdates.push('AC','R7');
    console.log(this.name + " | " + "==> DM.M[this.R['AC']] = "+ this.R['R7']);
  }
  RSTI(){
    this.R['R2'] = 0;
    latestupdates.push('R2');
    console.log(this.name + " | " + "==> R2 +  set to 0")
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
        if(key =='NULL'){
          continue;
        }
          if(i == 15*4){
            j +=50;
            i = 0;
          }
          if(latestupdates.includes(key)){
            fill(255, 255,0); 
          }else{
            fill(220, 255,255); 
          }
          
          rect(125 + offy + j, 150 + offx + i, 40,12);
          fill(0); textSize(12);
          text(key + ":" + this.R[key], 125 + offy +j, 150 + offx + i, 40,12);
          i+=15;

          
    }
  }
}




function setup() {
  green=false;
  frameRate(5);
  //pixelDensity(4);
  createCanvas(windowWidth - 10, windowHeight + 200);

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

  //arduino_mega2 = loadImage('arduino_mega_small.png');
  rectMode(CENTER);
  angleMode(DEGREES);


  
  gui = createGui('Processor Visualizer', windowWidth/2 - 150 , windowHeight/2 - 100);
  sliderRange(1,16,1);
  gui.addGlobals('cores_n');
  gui.addButton("Load Code", function() {
    LoadCode();
  });
  gui.addButton("Load Matrix", function() {
    LoadMatrix();
  });
  gui.addButton("Next Instruction ", function() {
    Next();
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


  gui2 = createGui('Custom Instructions', windowWidth/4+ 90, windowHeight +200 );
  gui2.addGlobals('Cores');
  gui2.addGlobals('Instructions');
  
  sliderRange(0,15,1);
  gui2.addGlobals('Ra');
  sliderRange(0,15,1);
  gui2.addGlobals('Rb');
  
  
  gui2.addButton("Execute ", function() {
    Execute();
  });

  gui2.addButton("Reset", function() {
    ResetWindow();
  });

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


let core1 = new Core(0,0);
let core2 = new Core(0,1);
let core5 = new Core(0,2);
let core10 = new Core(0,3);
let core3 = new Core(1,0);
let core4 = new Core(1,1);
let core6 = new Core(1,2);
let core11 = new Core(1,3);
let core7 = new Core(2,0);
let core8 = new Core(2,1);
let core9 = new Core(2,2);
let core12 = new Core(2,3);
let core13 = new Core(3,0);
let core14 = new Core(3,1);
let core15 = new Core(3,2);
let core16 = new Core(3,3);

function draw() {
  background(Background);
  translate(bx,by); // pan on mouse drag
  draw_grid();
  M.displayMem();
  DM.displayMem();
  scale(Zoom);
  //draw_ISA();

  for(let k = 1;k<=cores_n;k++){
    eval('core'+k+'.displaycore()');
  }


  //IM.displayMem();




  fill(55);
  rect(windowWidth/2 - 50, 100 - 80, 200,30);
  fill(255, 255, 255);
  textSize(17);
  text(current_instruction, windowWidth/2 - 50 + 20 , 100 - 80 + 5, 200,30); // Text wraps within text box

  fill(233, 255, 255);
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
  latestupdates = [];
  console.log("Next Instruction");
  code_pos_p = code_pos;

  for(var iter = 1; iter <= cores_n; iter++){
  switch(M.M[code_pos]) {
    case 'CONST':
      current_instruction = M.M[code_pos] + " " + M.M[code_pos+1];
      eval('core'+iter+'.'+M.M[code_pos]+'('+M.M[code_pos+1]+')');
      
      if(iter==cores_n)code_pos+=2;
      break;
    case 'SIZE':
      current_instruction = M.M[code_pos] + " " + M.M[code_pos+1];
      eval('core'+iter+'.'+M.M[code_pos]+'('+M.M[code_pos+1]+')');
      if(iter==cores_n)code_pos+=2;
      break;
    case 'MOV':
      current_instruction = M.M[code_pos] + " " + M.M[code_pos+1] + " " + M.M[code_pos+2];
      eval('core'+iter+'.'+ M.M[code_pos] +'('+ RegIdentifier[M.M[code_pos+1]]+',' + RegIdentifier[M.M[code_pos+2]]+')');
      if(iter==cores_n)code_pos+=3;
      break;
    case 'JMPNZ':
      current_instruction = M.M[code_pos] + " " + M.M[code_pos+1];
      eval('core'+iter+'.'+M.M[code_pos]+'('+M.M[code_pos+1]+')');
      if(iter==cores_n)code_pos+=2;
      break;
    default:
      current_instruction = M.M[code_pos]
      eval('core'+iter+'.' + M.M[code_pos]+'()');
      if(iter==cores_n)code_pos+=1;
      
      // code block
  }
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
          DM.M[l] = temp;
          l++;
        }
      }
  }
  console.log("Load Code");
}