//Warning! This p5js sketch seems to only work on Google Chrome for now..

/* This instrument auto-generates a series of chimes, 
played in various different ways dependent on the JSON 
data from Berkeley weather. Press 's' to start the instrument, 
and 'e' to pause. 
Playable link: http://alpha.editor.p5js.org/tinaye/sketches/Hky3jk3vM
*/

// Global variables
var boundary;
//defines the boundary line between the chimes and raindrops
var currPan;
var currIndex;

// UI
var menuOn = false;

// Rain variables
var dropAcc = 5;
var allDrops = [];
var deltaT = 0.02;
var num_of_drops = 6;
var defaultYVel = 0;
var velocity = 3;
var defaultXVel;
var currentDrop;
var dropLoad = 10;
var loadIndex = 0;

// Chime variables
// A wind direction vector
var angle;
// Circle position
var windmag = 0.0;
var chimes;
// don't trigger new chimes if 'e' was pressed
var is_playing = true;
var windowWidth;
// controls division of directional audio locations
var sets = 8;

//Background variables
var r = 80;
var g = 80;
var b = 80;

//Rain sound variables
var drizzle;
var rain;
var pour;

//Rain Day/Night variables
var birds;
var crickets;

// Rain class construction
class Drop {
  constructor(dropXPos, dropYPos, dropXVel, dropYVel, time, start) {
    this.dropXPos = dropXPos;
    this.dropYPos = dropYPos;
    this.dropXVel = dropXVel;
    this.dropYVel = dropYVel;
    this.time = time;
    this.start = start;
    this.size = random(1, 5);
  }
  //move drop by dropYVel for each call  
  update() {
    if (this.start < 1) {
      // down 3 pixels each frame, but maybe should be accelerating?
      this.dropXPos += this.dropXVel;
      this.dropYPos += this.dropYVel;
      this.dropYPos = this.dropYPos + 1 / 2 * dropAcc * this.time * this.time;
      this.dropYVel = deltaT * this.time;
      this.time += deltaT;
    } else {
      this.start -= 1
    }
    // if invisible for a full “height” amount…
    if (this.dropYPos >= (boundary - (height / 8) * (4 - this.size))) {
      // reset
      this.reset();
      return true;
    }
    return false;
  }

  reset() {
    this.dropYPos = random(-60, -10);
    this.dropXPos = random(-100, width + 100);
    this.dropYVel = defaultYVel;
    this.dropXVel = defaultXVel;
    this.time = 0;
    this.size = random(1, 5);
  }
}

function preload() {
  chimes = [];
  for (var i = 1; i < 5; i += 1) {
    append(chimes, [1]);
    for (var j = 0; j < dropLoad; j += 1) {
    	append(chimes[i - 1], loadSound('assets/chime' + i + '.mp3'));
    }
  }
  birds = loadSound('assets/birds.mp3');
  crickets = loadSound('assets/crickets.mp3');
  drizzle = loadSound('assets/drizzling.mp3');
  rain = loadSound('assets/raining.mp3');
  pour = loadSound('assets/pouring.mp3');
  crickets = loadSound('assets/crickets.mp3');
  // Request the data from apixu.com
  var url = 'http://api.apixu.com/v1/current.json?key=0f240eb4030c4e75ad864051182202&q=Berkeley';
  loadJSON(url, gotWeather);
}


function setup() {
  createCanvas(1500, 900);
	push();
  colorMode(RGB);
  background(r, g, b);
	pop();
  colorMode(HSB);
  strokeWeight(10);
  windowWidth = width - 2 * (width / 7);
  defaultXVel = Math.sin(angle) * windmag / 10;
  boundary = height - (height / 6); 
  drizzle.loop();
}

function drawRain() {
   if (allDrops.length < num_of_drops) {
    dropXPos = random(-100, width + 100);
    append(allDrops, new Drop(dropXPos, random(-60, -10), defaultXVel, velocity, 0, int(random(0, 100))));
  }

  // draw drip
  for (var i = 0; i < allDrops.length; i += 1) {
  	noStroke();
    currentDrop = allDrops[i];
    var x = currentDrop.dropXPos;
    var y = currentDrop.dropYPos;
    var size = currentDrop.size;
    fill(180 + (270 - 180) / width * allDrops[i].dropXPos, 75, (85 / 4) * currentDrop.size);
    ellipse(currentDrop.dropXPos, currentDrop.dropYPos, 10);
    if (currentDrop.update()) {
      currPan = floor(currentDrop.dropXPos / (width / sets));
      currIndex = (ceil((currentDrop.dropXPos - ((width / sets) * currPan)) / (width / sets / chimes.length))) % chimes.length;
      drawChimes(currIndex, currPan, x, y, size);
    }
  }
}

function drawChimes(index, pan, pos, distance, size) {
  //refactor range of pan
  pan = (pan - (sets - 1) / 2) / ((sets - 1) / 2);
  push();
  colorMode(RGB);
  background('rgba('+r+', '+g+', '+b+', 0.1)');
  //rect(0, 0, width, boundary - (height / 16) * 6); 
  pop();
  if (is_playing) {
    waitTime = int(random(200, 1000));
		nextTime = millis() + waitTime + (250)/(windmag+1);
    playRate = 1 + windmag / 5.0;
    //var randomIndex = int(random(0, chimes.length));
		//var randomPan = random(-1.0, 1.0);
    loadIndex = chimes[index][0];
  	chimes[index][loadIndex].rate(playRate);
		chimes[index][loadIndex].pan(pan);
	  chimes[index][loadIndex].setVolume(random(0.1, 1.0));
    chimes[index][loadIndex].play();
    chimes[index][0] += 1;
    if(loadIndex + 1 > dropLoad) {
      chimes[index][0] = 1;
    }
    push();
    noFill();
    //strokeWeight(4);
    stroke((360 / width * pos), 50, (85 / 4) * size);
    strokeWeight(size);
    //stroke(180 + (270 - 180) / width * pos, 75, (85 / 4) * size);
    ellipse(pos, distance + 10, 50 * size, 5 * size);
    pop();
    //line((width / 7) + (windowWidth / 8) * (round((pan + 1) * 4)), height / 2 - (20 * (1000 - waitTime) / 250), (width / 7) + (windowWidth / 8) * (round((pan + 1) * 4)), height/2 + (20 * (1000 - waitTime) / 250));
  }
}

function drawUI() {
  push();
  noStroke();
  fill('lightgray');
	textAlign(CENTER);
  text('p - menu', width/2, height - 20);
  if(menuOn) {
    text('s - play | e - pause | r -reset', width/2, height/2 - 40);
    text('d - day | n - night', width/2, height/2 - 20);
    text('j - decrease angle | l - increase angle', width/2, height/2);
    //text('I - decrease speed | K - increase speed', width/2, height/2 + 20);
    text('m - drizzling | k - raining | i - pouring', width/2, height/2 + 20);
  }
  pop();
  if (millis() < 6000) {
    background('black');
    text('rainworld', width / 2, height / 2);
  }
}


var nextTime = 0;
function draw() {
  //fill('rgba(20, 20, 20, 0.2)');
  //rect(0, boundary - (height / 16) * 6, width, height); 
  drawRain();
  drawUI();
}


//if 's' is pressed, start playing; 
function keyPressed() {
  if (key == 'P') {
    menuOn = true;
  }
	if (key == 'S') {
    is_playing = true;
  }
  if (key == 'E') {
    for (var i = 0; i < chimes.length; i += 1) {
      for (var j = 1; j < dropLoad + 1; j += 1) {
    		chimes[i][j].pause();
      }
    }
    is_playing = false;
	}
  if (key == 'D') {
    r = 112;
    g = 143;
    b = 167;
    if (!birds.isPlaying()) {
      birds.loop();
    }
    if (crickets.isPlaying()) {
      crickets.pause();
    }
  }
  if (key == 'N') {
    r = 36;
    g = 42;
    b = 47;
    if (!crickets.isPlaying()) {
      crickets.loop();
    }
    if (birds.isPlaying()) {
      birds.pause();
    }
  }
  if (key == 'R') {
    r = 80;
    g = 80;
    b = 80;
    birds.pause();
    crickets.pause();
    if (!drizzle.isPlaying()) {
      drizzle.loop();
    }
    if (rain.isPlaying()) {
      rain.pause();
    }
    if (pour.isPlaying()) {
      pour.pause();
    }
  }
  if (key == 'J') {
    for (var i = 0; i < allDrops.length; i += 1) {
    	allDrops[i].dropXVel -= 2;
    }
  	defaultXVel -= 0.1;
    defaultXVel = max(-0.8, min(0.8, defaultXVel));
  }
  if (key == 'L') {
    for (var i = 0; i < allDrops.length; i += 1) {
    	allDrops[i].dropXVel += 2;
    }
  	defaultXVel += 0.1;
    defaultXVel = max(-0.8, min(0.8, defaultXVel));
  }
  /*if (key == 'I') {
    for (var i = 0; i < allDrops.length; i += 1) {
    	allDrops[i].dropYVel += 2;
    }
  	defaultYVel += 2;
    defaultYVel = max(-16, min(16, defaultYVel));
  }
  if (key == 'K') {
    for (var i = 0; i < allDrops.length; i += 1) {
    	allDrops[i].dropYVel -= 2;
    }
  	defaultYVel -= 2;
    defaultYVel = max(-16, min(16, defaultYVel));
  }*/
  if (key == 'M') {
    dropAcc = 2;
    if (!drizzle.isPlaying()) {
      drizzle.loop();
    }
    if (rain.isPlaying()) {
      rain.pause();
    }
    if (pour.isPlaying()) {
      pour.pause();
    }
  }
  if (key == 'K') {
    dropAcc = 10;
    if (drizzle.isPlaying()) {
      drizzle.pause();
    }
    if (!rain.isPlaying()) {
      rain.loop();
    }
    if (pour.isPlaying()) {
      pour.pause();
    }
  }
  if (key == 'I') {
    dropAcc = 30;
    if (drizzle.isPlaying()) {
      drizzle.pause();
    }
    if (rain.isPlaying()) {
      rain.pause();
    }
    if (!pour.isPlaying()) {
      pour.loop();
    }
  }
}

function keyReleased() {
  menuOn = false;
}

function gotWeather(weather) {
  // Get the angle (convert to radians)
  angle = radians(Number(weather.current.wind_degree));
  // Get the wind speed
  windmag = Number(weather.current.wind_mph);
}
