var mraa = require('mraa');

//Pin connected to ST_CP of 74HC595
var latchPin = 9;

//Pin connected to SH_CP of 74HC595
var clockPin = 10;

////Pin connected to DS of 74HC595
var dataPin = 8;

////Pin connected to MR of 74HC595
var clearPin = 12;

var latchPinOut;
var clockPinOut;
var dataPinOut;
var clearPinOut;
var registers = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

function outputGPIO(pin) {
	var out = new mraa.Gpio(pin);
	out.dir(mraa.DIR_OUT);
	return out;
}

function setup(){
	latchPinOut = outputGPIO(latchPin);
	clockPinOut = outputGPIO(clockPin);
	dataPinOut = outputGPIO(dataPin);
	clearPinOut = outputGPIO(clearPin);

	clearPinOut.write(1);
	console.log('main program start');
	writeReg();
}

function loop() {
	console.log('loop start...\n\n');

	syncLoop(0, 16, 1, function(index){
			return new Promise((res)=> {
				registers[index] = 1;
				console.log('1 index i:', index, ' ke value: 1');
				writeReg();
				delay(100).then(()=> {res();});
			});
		},
		nextMove
	);

	function nextMove() {
		syncLoop(0, 16, 1, function(index){
				return new Promise((res)=> {
					registers[15-index] = 0;
					console.log('2 index i:', 15-index, ' ke value: 0');
					writeReg();
					delay(100).then(()=> {res();});
				});
			},
			loop
		);
	}

}

function writeReg() {
	latchPinOut.write(0);
	
	for(var i=15; i>=0; i--) {
		clockPinOut.write(0);
		dataPinOut.write(registers[i]);
		console.log(`Registry i${i}: ${registers[i]}`);
		clockPinOut.write(1);
	}

	latchPinOut.write(1);
}
 
function syncLoop(start, end, step, newPromiseCB, callBack) {
	const forLoop = syncForLoop(start, end, step);
	var c = forLoop.next();
	const loop = function() {
		if(!c.done) {
			newPromiseCB(c.value).then(()=> {
				console.log('promise done, called next loop');
				c = forLoop.next();
				loop();
			});
		} else {
			if(typeof callBack === 'function') callBack();
			console.log('loop complete...\n\n\n');
		}
	}
	loop();
}

function* syncForLoop(start, end, step) {
    for (var i = start; i < end; i += step) {
        yield i;
    }
}


function delay(time) {
	return new Promise((res) => setTimeout(()=>res(), time));
}

setup();
loop();
