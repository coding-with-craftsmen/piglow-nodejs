var i2c = require('i2c');
var seq = require('seq');

var io = require('socket.io').listen(80);

io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});

var PIGLOW_ADDRESS = 0x54;
var BYTE_ENABLE_OUTPUT = 0x00;
var BYTE_ENABLE_LEDS = 0x13;
var BYTE_SET_PWM_VALUES = 0x01;
var BYTE_UPDATE = 0x16;

// LEDS mapping 
var piglow = new function(){
 this.L1 = { red : 0, orange : 0 , yellow : 0x44, green : 0, blue : 0, white : 0 };
 this.L2 = { red : 0, orange : 0 , yellow : 0x44, green : 0, blue : 0, white : 0 };
 this.L3 = { red : 0, orange : 0 , yellow : 0x44, green : 0, blue : 0, white : 0 };
 // Clear all leds
 this.clear = function(){
  for(var i = 1; i <= 3; i++){
   this.setLed(i,'red',0);
   this.setLed(i,'orange',0);
   this.setLed(i,'yellow',0);
   this.setLed(i,'green',0);
   this.setLed(i,'blue',0);
   this.setLed(i,'white',0);
  }
 };
 
 // Set led
 this.setLed = function(leg, color, intense){
  this['L'+leg][color] = intense;
 };
 
 // Return piglow led instructions
 this.getPiglowInstruction = function(){
  return  [this.L1.red, this.L1.orange, this.L1.yellow, this.L1.green, this.L2.blue, 
   this.L2.green, this.L2.red, this.L2.orange, this.L2.yellow, this.L2.white, this.L3.white, 
   this.L3.blue, this.L1.white,this.L3.green, this.L1.blue, this.L3.yellow, this.L3.orange, this.L3.red];
 };
}

var wire = new i2c(PIGLOW_ADDRESS, {device: '/dev/i2c-1'}); // point to your i2c address, debug provides REPL interface

wire.scan(function(err, data) {
  console.log("piglow addresses",data);
});

try{
 wire.setAddress(PIGLOW_ADDRESS);
}catch(e){
 console.log("Setting PIGLOW address did not work",e);
}

seq()

 .seq(function(){
  wire.writeBytes(BYTE_ENABLE_OUTPUT,[0x01]);
  wire.writeBytes(BYTE_ENABLE_LEDS,[0xFF,0xFF,0xFF]);
  piglow.clear(); // Clear the piglow
  wire.writeBytes(BYTE_SET_PWM_VALUES,piglow.getPiglowInstruction());
  wire.writeBytes(BYTE_UPDATE, [0xFF]);

  var i = 0;
  var interval = setInterval(function(){
   piglow.clear();
   piglow.setLed((i%3+1),'red',0x88); 
   piglow.setLed((i%3+1),'orange',0x44); 
   i++;
   //console.log(i);
   // Write new state to piglow
   wire.writeBytes(BYTE_SET_PWM_VALUES,piglow.getPiglowInstruction());
   wire.writeBytes(BYTE_UPDATE, [0xFF]);

   if(i === 200) clearInterval(interval);
  },50);
 })
  

 .seq(function(){
  wire.readBytes(BYTE_UPDATE,1,function(err,ress){
   console.log("Reading bytes: ",err,ress);
  });
 })

 .catch(function(data){

  console.log("something was thrown",data);
 });
