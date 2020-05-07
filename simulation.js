const AUTOMATION_ON = true;

//neural network parameters
const NUM_INPUTS = 4; //fighter x and y , target x and y
const NUM_HIDDEN = 20;
const NUM_OUTPUTS = 2;
const NUM_SAMPLES = 1000000; //number of samples to train
const UP = 0;
const DOWN = 1;
const LEFT = 0;
const RIGHT = 1;
const OUTPUT_THRESHOLD = 0.25; //how close it needs to be to commit to moving
//set up neural network
var nn;
if(AUTOMATION_ON){
  nn = new NeuralNetwork(NUM_INPUTS, NUM_HIDDEN, NUM_OUTPUTS);

  //train the network
  let fx, fy, tx, ty;
  for (let i = 0; i < NUM_SAMPLES; i++){
    //random fighter position
    // TODO: may need to be updated
    fx = Math.random() * window.innerWidth;
    fy = Math.random() * window.innerHeight;
    // console.log("fx" + fx);
    // console.log("fy" + fy);

    //random target positions
    tx = Math.random() * window.innerWidth;
    ty = Math.random() * window.innerHeight;
    // console.log("tx" + tx);
    // console.log("ty" + ty);

    // calculate vector to fighter
    let track_vector = findVector(tx,ty,fx,fy);

    // determine how to move
    let hor = track_vector[0] > 0 ? RIGHT : LEFT;
    let ver = track_vector[1] > 0 ? DOWN : UP;

    // train network
    nn.train(normalizeInput(fx,fy,tx,ty), [hor,ver]);
  }
}

function normalizeInput(fighterX, fighterY, targetX, targetY){
  // normalize to between 0 and 1
  let input = [];
  input[0] = (fighterX/window.innerWidth);
  input[1] = (fighterY/window.innerHeight);
  input[2] = (targetX/window.innerWidth);
  input[3] = (targetY/window.innerHeight);
  return input;
}
function findVector(tx,ty,fx,fy) {
  //calculate components
  let vx = fx - tx;
  let vy = fy - ty;
  return [vx,vy];
}

function startEnvironment() {
  environment.start();
}

var environment = {
  counter : 1,
  dev : true,
  //create a canvas element
  canvas : document.createElement("canvas"),
  start : function() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.interval = setInterval(updateEnvironment, 20);
    //add listeners for keys
    window.addEventListener('keydown',function(e){
      e.preventDefault();
      environment.keys = (environment.keys || []);
      environment.keys[e.keyCode] = (e.type == "keydown");
    })
    window.addEventListener('keyup',function (e){
      environment.keys[e.keyCode] = (e.type == "keydown");
    })
  },
  clear : function() { //clear the board of everything before updating
    this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
  }
}
//stuff to get the canvas running and update it^^
//--------------------------------------------
//Triangle stuff (draw it with the x,y at centroid)
function drawTriangle(ctx, x, y, ang, width, height){
  ctx.translate(x,y);
  ctx.rotate(ang);
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.moveTo(0, 0-height/2);
  ctx.lineTo(0-width/2, 0+height/2);
  ctx.lineTo(0+width/2, 0+height/2);
  ctx.closePath();
  ctx.stroke();
}
//DRAW target
function drawTarget(ctx, x, y, ang,height){
  ctx.translate(x,y);
  ctx.rotate(ang);
  ctx.strokeStyle = "red";
  ctx.beginPath();
  // ctx.moveTo(0, -30);
  ctx.arc(0,-60, 30, 0.5*Math.PI, 2.5 * Math.PI);
  // ctx.closePath();
  ctx.stroke();
}
//General fighter variable
//------------------------------------------------------------
var fighter = {
  alive : true,
  counter : 0,
  //creating the fighter to control
  width : 15,
  height : 15,
  x : window.innerWidth/2, //current position
  y : window.innerHeight/2, //current position
  vx : 0,
  vy : 0,
  thr : 0, //will add to velocity instantly
  thrx : 0,
  thry : 0,
  yaw : 0, //will be positive or negative to adjust angle
  theta : 0,
  angle : 0,//for telemetry data
  fall : 0,
  lift : 0,
  momentumx : 0, //can be used to keep the fighter moving?
  momentumy : 0,
  airbrake : false,
  burn : false,
  alt : 1000, // should not go to 0 or crash || 0.1 list from thrust -0.1 from drag
  // drag : 1, //stays constant
  Target : false,
  update : function(){
    ctx = environment.context;
    if(fighter.alt <= 200){
      ctx.fillStyle = '#FFFAB3';
      ctx.fillRect(0,0,environment.canvas.width,environment.canvas.height);
    }
    if(fighter.alt <= 100){
      ctx.fillStyle = '#FFCCCC';
      ctx.fillRect(0,0,environment.canvas.width,environment.canvas.height);
      if(this.counter < 40){
        ctx.fillStyle = "black";
        ctx.fillText('**__LOW__ALTITUDE__**',20,environment.canvas.height-20);
        ctx.fillText('**__LOW__ALTITUDE__**',120,environment.canvas.height-20);
        ctx.fillText('**__LOW__ALTITUDE__**',220,environment.canvas.height-20);
        ctx.fillText('**__LOW__ALTITUDE__**',320,environment.canvas.height-20);
        ctx.fillText('**__LOW__ALTITUDE__**',420,environment.canvas.height-20);
        ctx.fillText('**__LOW__ALTITUDE__**',20,environment.canvas.height-60);
        ctx.fillText('**__LOW__ALTITUDE__**',120,environment.canvas.height-60);
        ctx.fillText('**__LOW__ALTITUDE__**',220,environment.canvas.height-60);
        ctx.fillText('**__LOW__ALTITUDE__**',320,environment.canvas.height-60);
        ctx.fillText('**__LOW__ALTITUDE__**',420,environment.canvas.height-60);
        ctx.fillText('**__LOW__ALTITUDE__**',20,environment.canvas.height-100);
        ctx.fillText('**__LOW__ALTITUDE__**',120,environment.canvas.height-100);
        ctx.fillText('**__LOW__ALTITUDE__**',220,environment.canvas.height-100);
        ctx.fillText('**__LOW__ALTITUDE__**',320,environment.canvas.height-100);
        ctx.fillText('**__LOW__ALTITUDE__**',420,environment.canvas.height-100);

        ctx.fillText('**__LOW__ALTITUDE__**',environment.canvas.width-20,20);
        ctx.fillText('**__LOW__ALTITUDE__**',environment.canvas.width-120,20);
        ctx.fillText('**__LOW__ALTITUDE__**',environment.canvas.width-220,20);
        ctx.fillText('**__LOW__ALTITUDE__**',environment.canvas.width-320,20);
        ctx.fillText('**__LOW__ALTITUDE__**',environment.canvas.width-420,20);
        ctx.fillText('**__LOW__ALTITUDE__**',environment.canvas.width-20,60);
        ctx.fillText('**__LOW__ALTITUDE__**',environment.canvas.width-120,60);
        ctx.fillText('**__LOW__ALTITUDE__**',environment.canvas.width-220,60);
        ctx.fillText('**__LOW__ALTITUDE__**',environment.canvas.width-320,60);
        ctx.fillText('**__LOW__ALTITUDE__**',environment.canvas.width-420,60);
        ctx.fillText('**__LOW__ALTITUDE__**',environment.canvas.width-20,100);
        ctx.fillText('**__LOW__ALTITUDE__**',environment.canvas.width-120,100);
        ctx.fillText('**__LOW__ALTITUDE__**',environment.canvas.width-220,100);
        ctx.fillText('**__LOW__ALTITUDE__**',environment.canvas.width-320,100);
        ctx.fillText('**__LOW__ALTITUDE__**',environment.canvas.width-420,100);
      }else if(this.counter > 90)
      {
        this.counter = 0;
      }
      this.counter++;
      // this.counter = 0;
    }
    ctx.save();

    drawTriangle(ctx, this.x, this.y, this.theta, this.width, this.height);

    ctx.restore();
    ctx.save();
    if(this.target == true)
    {
      drawTarget(ctx, this.x,this.y, this.theta, this.height);
      // console.log('target');
      this.target = false;
    }

    ctx.restore();

    // console.log('tx:',this.thrx,'ty:',this.thry); //optional telemetry for thrust
  },
  newPos : function(){
    this.theta += this.yaw * Math.PI / 180;
    this.angle += this.yaw; //for telemetry data
    if(this.angle >= 360){this.angle-=360;}
    if(this.angle < 0){this.angle+=360;}
    this.thrx = this.thr * Math.sin(this.theta);
    this.thry = this.thr * Math.cos(this.theta);
    if(Math.abs(this.thrx) > 0){this.momentumx = this.thrx;}
    if(Math.abs(this.thry) > 0){this.momentumy = this.thry;}

    //check gravity v lift
    this.gravity();
    this.alt += this.lift - this.fall;
    //add momentum
    if(Math.sqrt(Math.pow(this.vx,2) + Math.pow(this.vy,2)) < 9.9){
      // console.log('ye');
      this.vx += this.momentumx;
      this.vy += this.momentumy;
    }

    //check boundaries to loop
    if(this.x > environment.canvas.width){this.x = 0;}
    if(this.x < 0){this.x = environment.canvas.width;}
    if(this.y > environment.canvas.height){this.y = 0;}
    if(this.y < 0){this.y = environment.canvas.height;}

    this.x += this.vx;
    this.y -= this.vy;
  },
  thrust : function(){
    //Todo: increase acceleration
    //Todo: adjust for angle
    if(!this.burn)
    {
      this.thr = 10;
    }
    else{
      this.thr = 17;
    }
    this.lift = 5;
  },
  break : function(){

  },
  turn : function(dir){
    //change angle of fighter
    if(dir == -1){
      this.yaw-=5;
    }
    else if(dir == 1){
      this.yaw+=5;
    }
  },
  drag : function(){
    if(!this.airbrake){
      //stop changes so they dont go on forever
      if(this.momentumx > 0){
        this.momentumx -= 0.1;
      }
      else if(this.momentumx < 0){
        this.momentumx += 0.1;
      }
      if(this.momentumy > 0){
        this.momentumy -= 0.1;
      }
      else if(this.momentumy < 0){
        this.momentumy += 0.1;
      }
    }
    else{
      this.momentumx = 0;
      this.momentumy = 0;
    }
    this.lift = 0;
    this.fall = 0;
    this.vx = 0;
    this.vy = 0;
    this.thr = 0;
    // this.airbrake = false;
    this.yaw = 0; //set yaw back to 0 after the movement
    this.ground();
  },
  laze : function(){
    this.target = true;
  },
  gravity : function() {
    this.fall += 5;
  },
  climb : function() {
    this.lift += 10;
  },
  drop : function() {
    this.fall += 10;
  },
  ground : function() {
    //check if fighter is too low
    if(this.alt <=0 )
    {
      // console.log('dead');
      if(!environment.dev){
        this.alive = false;
      }
      this.alt = 0;
    }
  },
  //HUD  telemetry indication
  //--------------------------------------------
  hud : function(){
    ctx = environment.context;
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    //update telemetry
    ctx.fillText('x:'+this.x.toFixed().toString()+'  y:'+this.y.toFixed().toString()+'  alt:'+this.alt.toFixed().toString()+'m',20,20);
    ctx.fillText('vx:'+this.vx.toFixed().toString()+'m/s'+'  vy:'+this.vy.toFixed().toString()+'m/s'+'  at-ang:'+fighter.angle.toFixed().toString()+'°', 20, 60);
    ctx.fillText('thr:'+this.thr.toFixed().toString()+'m/sE2'+'  climb:'+(this.lift-this.fall).toFixed().toString()+ 'm/s'+'  yaw:'+this.yaw.toFixed().toString()+'°',20,100);
    ctx.fillText('mox:'+this.momentumx.toFixed().toString()+'m/s'+'  moy:'+this.momentumy.toFixed().toString()+'m/s',20,140);
    var brake;
    if (this.airbrake){brake = 'engaged';}else{brake = 'disengaged';}this.airbrake = false;
    ctx.fillText('RB: '+brake,20,180);
    if(this.burn){ctx.fillText('burner: engaged',100,180);}else{ctx.fillText('burner: disengaged',100,180);}this.burn = false;
    ctx.beginPath();
    ctx.rect(10, 10, 230, 180);
    ctx.stroke();
  }
}
//TODO: ADD OBSTACLES AND LAYERS (EVERY 100?)
//----------------------------------------------------------------------------------------------------

//Updating the environment and fighters
//---------------------------------------------------------------------------
function updateEnvironment() {
  environment.clear();
  if(fighter.alive || environment.dev){ //ONLY ALLOW CONTROLS IF fighter IS ALIVE
    if(environment.keys && environment.keys[87]){
      fighter.thrust();
      if(environment.keys && environment.keys[9]){fighter.climb();}
    }
    if(environment.keys && environment.keys[65]){fighter.turn(-1);}
    if(environment.keys && environment.keys[68]){fighter.turn(1);}
    if(environment.keys && environment.keys[32]){fighter.laze();}
    if(environment.keys && environment.keys[16]){fighter.drop();}
    if(environment.keys && environment.keys[83]){fighter.airbrake = true;fighter.drag();}
    if(environment.keys && environment.keys[66])
    {
      if(environment.keys && environment.keys[87])
      {
        fighter.burn = true;fighter.thrust();
        if(environment.keys && environment.keys[9]){fighter.climb();}
      }
    }
    fighter.newPos(); //calculate the new position
  }
  if(!AUTOMATION_ON){
    if(environment.keys && environment.keys[38]){aa.up();}
    if(environment.keys && environment.keys[40]){aa.down();}
    if(environment.keys && environment.keys[37]){aa.lef();}
    if(environment.keys && environment.keys[39]){aa.righ();}
  }else{
    //CONTROL AA
    //prediction based on current data
    let fx = fighter.x;
    let fy = fighter.y;
    let tx = aa.x;
    let ty = aa.y;
    let predict = nn.feedForward(normalizeInput(fx,fy,tx,ty)).data[0];
    // console.log(predict);

    //make movement (left or right)
    let dLeft = Math.abs(predict[0] - LEFT);
    let dRight = Math.abs(predict[0] - RIGHT);
    //compare to OUTPUT_THRESHOLD
    if(dLeft < OUTPUT_THRESHOLD){
      aa.lef();
    } else if(dRight < OUTPUT_THRESHOLD){
      aa.righ();
    }

    //make movement (up or down)
    let dUp = Math.abs(predict[1] - UP);
    let dDown = Math.abs(predict[1] - DOWN);
    //compare to OUTPUT_THRESHOLD
    if(dUp < OUTPUT_THRESHOLD){
      aa.up();
    } else if(dDown < OUTPUT_THRESHOLD){
      aa.down();
    }
  }

  // logTelemetry();
  fighter.update();
  if(environment.dev){
    aa.update();
  }
  fighter.hud();
  if(fighter.alive){fighter.drag();} //apply drag after calculating the new position

  //check for key inputs
}
//Log the fighter telemetry data
//-----------------------------------------------------------------------------------------
function logTelemetry(clear = false) {
  if((environment.counter % 15 == 0) && clear)
  {
    console.clear();
    environment.counter = 1;
  }
  else{
    environment.counter++;
  }
  console.log('x:',fighter.x,'y:',fighter.y,'vx:',fighter.vx,'vy:',fighter.vy);
  console.log('thr:',fighter.thr,'yaw:',fighter.yaw,'ang:',fighter.angle);
  console.log('alt:',fighter.alt,'climb:',fighter.lift-fighter.fall);
  console.log('mox:',fighter.momentumx,'moy:',fighter.momentumy);//output telemetry data
}
//Anti Air - track a target
//TODO: 2d Tracking
//--------------------------------------------------------------------------------------------------------------
if(environment.dev){
  var aa = {
    x : 20,
    y : 20,
    update : function() {
      //check boundaries to loop
      if(this.x > environment.canvas.width){this.x = 0;}
      if(this.x < 0){this.x = environment.canvas.width;}
      if(this.y > environment.canvas.height){this.y = 0;}
      if(this.y < 0){this.y = environment.canvas.height;}
      ctx = environment.context;
      ctx.moveTo(this.x,this.y);
      ctx.strokeStyle = "#FF0000";
      ctx.beginPath();
      ctx.arc(this.x,this.y, 30, 0.5*Math.PI, 2.5 * Math.PI);
      ctx.stroke();
    },
    righ : function(){
      this.x+=10;
    },
    lef : function(){
      this.x-=10;
    },
    up : function(){
      this.y-=10;
    },
    down : function(){
      this.y+=10;
    }
  }
}
