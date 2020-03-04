// Colour triads gradient generation through mathematical principles of justly intonated music
// Jan Machalski 2019

var modus = 3; // three logarithmic intervals per octave
var baseFreq = 440.0;
var utonal = 0; // negative harmony switch
let voice = [];
let skladnik = [];
let oktawa = [];
let freq = [];
let hue = [];
var s = 200; //saturation
var l = 150; // luminescence
var tuneHue = 530.0; // tune audio and colour spectrum if needed
var X_AXIS = 2; // ze skopiowanego kodu do setGradient
let myszkaTresh = 4 // if set to 4 then mouse has to travel quarter of the screen to make action

function setup() {
  createCanvas(750, 750);
  colorMode(HSL, 255);
  x = width;
  y = height;

  for (let i = 0; i < 3; i++) {
    skladnik[i] = i;
    oktawa[i] = 0;
  }

}

function draw() {
  colorMode(HSL, 255);
  background(0);
  noStroke();

  for (let i = 0; i < 3; i++) {
    freq[i] = superparticularMath(i)
    hue[i] = freqToHue(freq[i], tuneHue);

    // fast mouse click bug fix
    if ((oktawa[i] > 5) || (oktawa[i] < -5)) {
      oktawa[i] = 0;
    }
  }

  if (baseFreq > 32768) {
    baseFreq /= 64;
  } // bug fix
  if (baseFreq < 10) {
    baseFreq *= 64;
  } // bug fix, octaves don't matter for colours (light spectrum is 1 octave)

  c1 = color(hue[0], s, l);
  c2 = color(hue[1], s, l);
  c3 = color(hue[2], s, l);

  setGradient(0, 0, width / 2 - 1, height, c1, c2, X_AXIS);
  setGradient(width / 2, 0, width / 2, height, c2, c3, X_AXIS);

  //  fill(hue[0], s, l);
  //  rect(0, 0, width / 3, height); // pierwsza wartosc to width*i/3

  //  fill(hue[1], s, l);
  //  rect(width / 3, 0, width / 3, height); // pierwsza wartosc to width*i/3

  // fill(hue[2], s, l);
  //  rect(width / (3 / 2), 0, width / 3, height); // pierwsza wartosc to width*i/3

}

function freqToHue(freq, tuneHue) {
  pitch = 69.00 + 12.0 * log(freq / tuneHue) / log(2); //freq to pitch
  h = pitch - (12.0 * int(pitch / 12.0)); // float modulo
  h = int(map(h, 0.0, 12.0, 255, 0)); // convert to hue 0-255h
  return h;
  print(h);
}

function superparticularMath(i) { //generator harmonii
  let f;
  if (utonal == 0) {
    f = baseFreq * pow(2, oktawa[i]) * (modus + skladnik[i]) / modus;
  } else {
    f = baseFreq * pow(2, oktawa[i]) * modus / (modus + skladnik[i]);
  }
  //  print(f);
  return f;

}


function count012(i) { // counting 0, 1, 2 through octaves (przewroty akordow)
  if (skladnik[i] >= modus - 1) {
    skladnik[i] = 0;
    switch (utonal) {
      case 0:
        oktawa[i] += 1;
        break;
      case 1:
        oktawa[i] -= 1;
        break;
    }
  } else {
    skladnik[i] += 1;
  }
}


function count210(i) { // counting 2, 1, 0 through octaves (przewroty akordow)
  if (skladnik[i] <= 0) {
    skladnik[i] = modus - 1;
    switch (utonal) {
      case 0:
        oktawa[i] -= 1;
        break;
      case 1:
        oktawa[i] += 1;
        break;
    }
  } else {
    skladnik[i] -= 1;
  }
}

function transpozycja(a, b) {
  ulamek = a / b;
  baseFreq = baseFreq * (ulamek);
  for (let i = 0; i < 3; i++) {
    switch (utonal) {
      case 0:
        if (ulamek > 1) {
          count210(i);
        }
        if (ulamek < 1) {
          count012(i);
        }
        break;
      case 1:
        if (ulamek > 1) {
          count012(i);
        }
        if (ulamek < 1) {
          count210(i);
        }
        break;
    }
  }
}

function change() {

  switch (utonal) {
    case 0:
      utonal = 1;
      for (let i = 0; i < 3; i++) {
        if (skladnik[i] != 0) {
          oktawa[i] += 1;
        }
      }

      break;
    case 1:
      utonal = 0;
      for (let i = 0; i < 3; i++) {
        if (skladnik[i] != 0) {
          oktawa[i] -= 1;
        }
      }
      break;
  }
}

function setGradient(x, y, w, h, c1, c2, axis) {
  for (var i = x; i <= x + w; i++) {
    colorMode(RGB, 255);
    var inter = map(i, x, x + w, 0, 1);
    var c = lerpColor(c1, c2, inter);
    stroke(c);
    line(i, y, i, y + h);
  }
}

function mousePressed() {
  klikniecieX = mouseX;
  klikniecieY = mouseY;
}

function mouseReleased() {
  if ((mouseX - (width / myszkaTresh)) > klikniecieX) {
    count210(0);
    count210(1);
    count210(2);
  } else if ((mouseX + (width / myszkaTresh)) < klikniecieX) {
    count012(0);
    count012(1);
    count012(2);
  } else if 
 ((mouseY - (height / myszkaTresh)) > klikniecieY) {
     transpozycja(4,3);
      } else if ((mouseY + (height / myszkaTresh)) < klikniecieY) {
        transpozycja(3,4); }
  else {
    transpozycja(5, 4);
  }
}