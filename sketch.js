// JUST INTONATION HARMONY ENGINE
// copyright Jan Machalski 2019
// version 2020_09_15
// made in P5JS
// prime factorization version

const iloscGlosow = 3;
const modusInit = 3; // three logarithmic/arithmetic (otonal/utonal) intervals per octave
const freqInit = 220.0; // reference frequency from which the rest is being built
let utonalInit = false; // false=major true=minor first chord switch (negative harmony switch)
const tuneHue = 530.0; // tune audio and colour spectrum if needed

const primeLimit = 7;
const maxModus = 8;
let ukladRozlegly = false;
const kolorTekstu = 255;
let instrukcja = true;
let saturacja = 100;
let swiatlo = 55;
let dzwiek = 0; //audio off przy starcie
let glosy = []; //wysokosci dzwiekow i obliczenia ich
let syntezatory = []; //oscylatory
let liczbaPierwsza = []; //array liczb pierwszych
let iToPrime = []; //dictionary of prime factorizations
let reverb;
let reverbTime = 5;

function setup() {
  createCanvas(600, 600);
  for (i = 0, j = 0; i < 100; i++) { // generuje array liczb pierwszych
    if (isPrime(i)) {
      liczbaPierwsza[j] = i;
      j += 1;
    }
  }
  initPrimeFactorization();
  for (let i = 0; i < iloscGlosow; i++) { //tworzy glosy po arpeggiu
    glosy[i] = new Glos();
    for (let j = 0; j < i; j++) {
      glosy[i].wyzej();
    }
    glosy[i].przelicz();
    syntezatory[i] = new p5.Oscillator('sine');
  }

  reverb = new p5.Reverb();
  for (let i = 0; i < iloscGlosow; i++) {
    reverb.process(syntezatory[i], reverbTime, 1.5);
  }
  colorMode(HSL, 255);
}

function draw() {
  background(220);
  noStroke();

  //rysuj prostokaty
  for (let i = 0; i < iloscGlosow; i++) {
    fill(freqToHue(glosy[i].freq), saturacja, swiatlo);
    rect(0, (height * (iloscGlosow - 1 - i) / iloscGlosow), width, height / iloscGlosow);
  }

  fill(kolorTekstu);

  switch (instrukcja) {
    case true:
      let wierszeOdstep = 20;
      textSize(15);
      text("Click left mouse button to start (left click or press n to restart).", 20, wierszeOdstep);
      text("Press left and right arrows to arpeggiate chords", 20, wierszeOdstep * 2);
      text("Press 1 to change between utonality and otonality.", 20, wierszeOdstep * 3);
      text("Press Q A W S E  or D for basic modulations. Alternate between keys and arrows", 20, wierszeOdstep * 4);
      text("Press B to switch between closed and open voicings", 20, wierszeOdstep * 5);
      text("Press up and down arrows to change the modus. Voices might overlap.", 20, wierszeOdstep * 6);
      text("R F T G Y H are the shortcuts for pressing 1 and qawsed simultaneously.", 20, wierszeOdstep * 7);
      text("T Y H N U J are like left and right arrow but work for 1 voice only.", 20, wierszeOdstep * 8);
      // wyswietl numery glosow
      for (let i = 0; i < iloscGlosow; i++) {
        text(i, 5, height * (iloscGlosow - i) / iloscGlosow);
      }
      break;

    case false:
      //tu bylo "rysuj rownania"

      break;
  }
  //rysuj rownania przeklejone
        textSize(20);
      for (let i = 0; i < iloscGlosow; i++) {
        fill(kolorTekstu);
        text(glosy[i].string, 25, (height * (iloscGlosow - i) / iloscGlosow) - 10);
      }

  if (dzwiek == 1) {
    for (let i = 0; i < iloscGlosow; i++) {
      syntezatory[i].freq(glosy[i].freq, 0.015);
      //12EDO: zmien glosy[i].freq na glosy[i].edo()
    }
  }
  //wyjscie poza mape resetuje parametry
  for (let i = 0; i < iloscGlosow; i++) {
    if (glosy[i].freq > 5000 ^ glosy[i].freq < 80) {
      reset();
    }
  }
}

class Glos {
  constructor() {
    this.modus = modusInit;
    this.skladnik = 0;
    this.utonal = utonalInit;
    this.transposition = freqInit;
    this.factorization = []; //prime factors (Monzos)
    for (let i = 0; i < primeLimit; i++) {
      this.factorization[i] = 0; //zero as default factorization
    }
    this.string = "new voice loading";
  }

  // MUSIC HARMONY ENGINE
  przelicz() {
    let x = 0;
    x += log(this.modus + int(!this.utonal) * this.skladnik);
    x -= log(this.modus + int(this.utonal) * this.skladnik);
    for (let i = 0; i < primeLimit; i++) {
      x += this.factorization[i] * log(liczbaPierwsza[i]);
    }
    this.freq = this.transposition * exp(x);
    this.matString();
  }

  //transpose by prime factors
  monzo() {
    for (let i = 0; i < arguments.length; i++) {
      this.factorization[i] += arguments[i];
    }
    this.przelicz();
  }

  set(utonal, modus, skladnik, oktawa, kwinta, tercja) {
    this.utonal = utonal;
    this.modus = modus;
    this.stopien = skladnik;
    for (let i = 0; i < arguments.length - 3; i++) {
      this.factorization[i] += arguments[i + 3];
    }
    this.przelicz();
  }

  //returns object variables
  info() {
    let stringZmiennych = "transp " + this.transposition
    stringZmiennych += " utonal " + int(this.utonal)
    stringZmiennych += " modus " + str(this.modus);
    stringZmiennych += " stopien " + str(this.skladnik);
    stringZmiennych += " epimericFactors "
    for (let i = 0; i < primeLimit; i++) {
      stringZmiennych += " " + str(this.factorization[i]);
    }
    return stringZmiennych;
  }

  //zwraca wzor na czestotliwosci jako string (zapis potegowy)
  matString() {
    this.string = this.transposition + "Hz";
    this.string += " * [(" + this.modus + " + " + int(!this.utonal) * this.skladnik
    this.string += ") / (" + this.modus + " + " + int(this.utonal) * this.skladnik + ")]";
    for (let i = 0; i < 4; i++) {
      this.string += " * " + liczbaPierwsza[i] + "^" + this.factorization[i];
    }
    this.string += " = " + nf(this.freq, 0, 3) + "Hz";
  }

  changeUtonal() { // "upside down" harmony switch (negative harmony)
    if (this.skladnik != 0) {
      this.skladnik = this.modus - this.skladnik;
      switch (this.utonal) {
        case false:
          this.factorization[0] += 1;
          break;
        case true:
          this.factorization[0] -= 1;
          break;
      }
    }
    this.utonal = !this.utonal;
    this.przelicz();
  }

  //przewroty akordow
  count012() { // counting 0, 1, 2 through octaves: if major then up, if minor then down
    if (this.skladnik >= this.modus - 1) {
      this.skladnik = 0;
      switch (this.utonal) {
        case false:
          this.factorization[0] += 1;
          break;
        case true:
          this.factorization[0] -= 1;
          break;
      }
    } else {
      this.skladnik += 1;
    }
    this.przelicz();
  }

  count210() { // counting 2, 1, 0 through octaves: if major then down, if minor then up.
    if (this.skladnik <= 0) {
      this.skladnik = this.modus - 1;
      switch (this.utonal) {
        case false:
          this.factorization[0] -= 1;
          break;
        case true:
          this.factorization[0] += 1;
          break;
      }
    } else {
      this.skladnik -= 1;
    }
    this.przelicz();
  }

  // przewroty akordow
  wyzej() {
    switch (this.utonal) {
      case false:
        if (this.skladnik == this.modus - 1) {
          this.skladnik = 0;
          this.factorization[0] += 1;
        } else {
          this.skladnik += 1;
        }
        break;
      case true:
        if (this.skladnik == 0) {
          this.skladnik = this.modus - 1;
          this.factorization[0] += 1;
        } else {
          this.skladnik -= 1;
        }
        break;
    }
    this.przelicz();
  }
  // przewroty akordow
  nizej() {
    switch (this.utonal) {
      case false:
        if (this.skladnik == 0) {
          this.skladnik = this.modus - 1;
          this.factorization[0] -= 1;
        } else {
          this.skladnik -= 1;
        }
        break;
      case true:
        if (this.skladnik == this.modus - 1) {
          this.skladnik = 0;
          this.factorization[0] -= 1;
        } else {
          this.skladnik += 1;
        }
        break;
    }
    this.przelicz();
  }

  transponuj(wpiszLicznik, wpiszMianownik) { //np. z akordu C do D to transponuj(9,8)
    for (let i = 0; i < iToPrime[wpiszLicznik].length; i++) {
      this.factorization[i] += iToPrime[wpiszLicznik][i];
    }
    for (let i = 0; i < iToPrime[wpiszMianownik].length; i++) {
      this.factorization[i] -= iToPrime[wpiszMianownik][i];
    }
    this.przelicz();
  }
  // transpozycja, w ktorej wybiera sie ktory skladnik akordu ma zostac w miejscu i jakim nowym skladnikiem ma byc
  itoi(i1, i2) {
    switch (this.utonal) {
      case false:
        this.transponuj((this.modus + i1), (this.modus + i2));
        if (i1 > i2) {
          for (let i = 0; i < i1 - i2; i++) {
            this.nizej();
          }
        } else if (i1 < i2) {
          for (let i = 0; i < i2 - i1; i++) {
            this.wyzej();
          }
        }
        break;
      case true:
        this.transponuj((this.modus + i2), (this.modus + i1));
        if (i1 < i2) {
          for (let i = 0; i < i2 - i1; i++) {
            this.nizej();
          }
        } else if (i1 > i2) {
          for (let i = 0; i < i1 - i2; i++) {
            this.wyzej();
          }
        }
        break;
    }
    this.przelicz();
  }
  modusUp() {
    if (this.modus <= maxModus) {
      this.modus += 1;
    }
    this.przelicz();
  }
  modusDown() {
    if (this.modus > 1) {
      this.modus -= 1;
    }
    if (this.modus < this.skladnik) {
      this.skladnik = this.modus - 1;
    }
    this.przelicz();
  }
  edo() { //kwantyzuj do 12EDO (chyba dziala)
    let i;
    let polTon = pow(2, 1 / 12);
    for (i = 55; i < this.freq; i *= polTon) {}
    if (this.freq / i > (i * polTon) / this.freq) {
      return (i * polTon);
    } else {
      return i;
    }
  }

  //zostaw same faktoryzacje bez zmiany wysokosci 
  faktor() { //stopien przechodzi na 0 bez zmiany wysokosci
    let intA = this.modus + int(!this.utonal) * this.skladnik;
    let intB = this.modus + int(this.utonal) * this.skladnik;
    transponuj(intA, intB);
    this.skladnik = 0;
    this.przelicz();

  }

  reset() {
    this.modus = modusInit;
    this.skladnik = 0;
    this.transposition = freqInit;
    for (let i = 0; i < primeLimit; i++) {
      this.factorization[i] = 0;
    }
    this.przelicz();
  }
}

// SOUND CHROMA TO COLOUR CHROMA CONVERSION (frequency to hue)
function freqToHue(freq) {
  let pitch = 69.00 + 12.0 * log(freq / tuneHue) / log(2); //freq to pitch
  let h = pitch - (12.0 * int(pitch / 12.0)); // float modulo
  h = int(map(h, 0.0, 12.0, 255, 0)); // convert to hue 0-255h
  return h;
}

function isPrime(int) {
  for (var i = 2; i <= sqrt(int); i++) {
    if (int % i === 0) return false;
  }
  return int !== 1 && int !== 0;
}

// USER INTERFACE
function mousePressed() {
  reset();
//  instrukcja = false; //uncomment to turn off instructions
  saturacja = 180;
  swiatlo = 125;
  klikniecieX = mouseX;
  klikniecieY = mouseY;
  if (dzwiek == 0) {
    dzwiek = 1;
    for (let i = 0; i < iloscGlosow; i++) {
      syntezatory[i].amp(0.0);
      syntezatory[i].start();
      syntezatory[i].amp(0.025, 1.0);
    }
  }
}

function mouseReleased() {
  //  for (let i = 0; i < iloscGlosow; i++) {
  //    syntezatory[i].amp(0.06, 0.4);
  //  }
  for (let i = 0; i < iloscGlosow; i++) {
    glosy[i].przelicz();
  }
}

function keyPressed() {
  if (key == "n") {
    reset();
  } else if (key == "1") {
    for (let i = 0; i < iloscGlosow; i++) {
      glosy[i].changeUtonal();
    }
  } else if (key == "q") {
    for (let i = 0; i < iloscGlosow; i++) {
      switch (glosy[i].utonal) {
        case false:
          glosy[i].itoi(1, 0);
          break;
        case true:
          glosy[i].itoi(0, 1);
          break;
      }
    }
  } else if (key == "a") {
    for (let i = 0; i < iloscGlosow; i++) {
      switch (glosy[i].utonal) {
        case false:
          glosy[i].itoi(0, 1);
          break;
        case true:
          glosy[i].itoi(1, 0);
          break;
      }
    }
  } else if (key == "w") {
    for (let i = 0; i < iloscGlosow; i++) {
      switch (glosy[i].utonal) {
        case false:
          glosy[i].itoi(1, 2);
          break;
        case true:
          glosy[i].itoi(2, 1);
          break;
      }
    }
  } else if (key == "s") {
    for (let i = 0; i < iloscGlosow; i++) {
      switch (glosy[i].utonal) {
        case false:
          glosy[i].itoi(2, 1);
          break;
        case true:
          glosy[i].itoi(1, 2);
          break;
      }
    }
  } else if (key == "e") {
    for (let i = 0; i < iloscGlosow; i++) {
      switch (glosy[i].utonal) {
        case false:
          glosy[i].itoi(2, 0);
          break;
        case true:
          glosy[i].itoi(0, 2);
          break;
      }
    }
  } else if (key == "d") {
    for (let i = 0; i < iloscGlosow; i++) {
      switch (glosy[i].utonal) {
        case false:
          glosy[i].itoi(0, 2);
          break;
        case true:
          glosy[i].itoi(2, 0);
          break;
      }
    }
  } else if (key == "r") {
    for (let i = 0; i < iloscGlosow; i++) {
      glosy[i].itoi(0, 1);
      glosy[i].changeUtonal();
    }
  } else if (key == "f") {
    for (let i = 0; i < iloscGlosow; i++) {
      glosy[i].itoi(1, 0);
      glosy[i].changeUtonal();
    }
  } else if (key == "t") {
    for (let i = 0; i < iloscGlosow; i++) {
      glosy[i].itoi(1, 2);
      glosy[i].changeUtonal();
    }
  } else if (key == "g") {
    for (let i = 0; i < iloscGlosow; i++) {
      glosy[i].itoi(2, 1);
      glosy[i].changeUtonal();
    }
  } else if (key == "y") {
    for (let i = 0; i < iloscGlosow; i++) {
      glosy[i].itoi(2, 0);
      glosy[i].changeUtonal();
    }
  } else if (key == "h") {
    for (let i = 0; i < iloscGlosow; i++) {
      glosy[i].itoi(0, 2);
      glosy[i].changeUtonal();
    }
  } else if (key == "u") {
    glosy[0].wyzej();
  } else if (key == "j") {
    glosy[0].nizej();
  } else if (key == "7") {
    glosy[0].wyzej();
    glosy[0].wyzej();
  } else if (key == "m") {
    glosy[0].nizej();
    glosy[0].nizej();
  } else if (key == "i") {
    glosy[1].wyzej();
  } else if (key == "k") {
    glosy[1].nizej();

  } else if (key == "b") { // uklad skupiony i rozlegly
    switch (ukladRozlegly) {
      case false:
        for (let i = 0; i < iloscGlosow; i++) {
          for (j = 0; j < i; j++) {
            glosy[i].wyzej();
          }
        }
        break;
      case true:
        for (let i = 0; i < iloscGlosow; i++) {
          for (j = 0; j < i; j++) {
            glosy[i].nizej();
          }
        }
        break;
    }
    ukladRozlegly = !ukladRozlegly;

  } else if (keyCode === LEFT_ARROW) {
    for (let i = 0; i < iloscGlosow; i++) {
      glosy[i].nizej();
    }
  } else if (keyCode === RIGHT_ARROW) {
    for (let i = 0; i < iloscGlosow; i++) {
      glosy[i].wyzej();
    }
  } else if (keyCode === UP_ARROW) {
    for (let i = 0; i < iloscGlosow; i++) {
      glosy[i].modusUp();
    }
  } else if (keyCode === DOWN_ARROW) {
    for (let i = 0; i < iloscGlosow; i++) {
      glosy[i].modusDown();
    }
  } else {
    print("No keyboard shortcut found.");
  }
  for (let i = 0; i < iloscGlosow; i++) {
    glosy[i].przelicz();
  }
}

function reset() {
  for (let i = 0; i < iloscGlosow; i++) {
    glosy[i].modus = modusInit;
    glosy[i].skladnik = 0;
    glosy[i].transposition = freqInit;
    for (let j = 0; j < 10; j++) {
      glosy[i].factorization[j] = 0;
    }
    for (let j = 0; j < i; j++) {
      glosy[i].wyzej();
    }
    glosy[i].przelicz();
  }
}

//LOADS A DICTIONARY OF EPIMORIC INTEGER FACTORIZATIONS (Monzos)
function initPrimeFactorization() {
  iToPrime[1] = [0];
  iToPrime[2] = [1];
  iToPrime[3] = [0, 1];
  iToPrime[4] = [2];
  iToPrime[5] = [0, 0, 1];
  iToPrime[6] = [1, 1];
  iToPrime[7] = [0, 0, 0, 1];
  iToPrime[8] = [3];
  iToPrime[9] = [0, 2];
  iToPrime[10] = [1, 0, 1];
  iToPrime[11] = [0, 0, 0, 0, 1];
  iToPrime[12] = [2, 1];
  iToPrime[13] = [0, 0, 0, 0, 0, 1];
  iToPrime[14] = [1, 0, 0, 1];
  iToPrime[15] = [0, 1, 1];
  iToPrime[16] = [4];
  iToPrime[17] = [0, 0, 0, 0, 0, 0, 1];
  iToPrime[18] = [1, 2];
  iToPrime[19] = [0, 0, 0, 0, 0, 0, 0, 1];
  iToPrime[20] = [2, 0, 1];
  iToPrime[21] = [0, 1, 0, 1];
  iToPrime[22] = [1, 0, 0, 0, 1];
  iToPrime[23] = [0, 0, 0, 0, 0, 0, 0, 0, 1];
  iToPrime[24] = [3, 1];
  iToPrime[25] = [0, 0, 2];
  iToPrime[26] = [1, 0, 0, 0, 0, 1];
  iToPrime[27] = [0, 3];
  iToPrime[28] = [2, 0, 0, 1];
  iToPrime[29] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
  iToPrime[30] = [1, 1, 1];
  iToPrime[31] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
  iToPrime[32] = [5];
  iToPrime[33] = [2, 0, 0, 0, 1];
  iToPrime[34] = [1, 0, 0, 0, 0, 0, 1];
  iToPrime[35] = [0, 0, 1, 1];
  iToPrime[36] = [2, 2];
  iToPrime[37] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
  iToPrime[38] = [1, 0, 0, 0, 0, 0, 0, 1];
  iToPrime[39] = [0, 1, 0, 0, 0, 1];
  iToPrime[40] = [3, 0, 1];
  iToPrime[41] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
  iToPrime[42] = [1, 1, 0, 1];
  iToPrime[43] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
  iToPrime[44] = [1, 1, 0, 0, 1];
  iToPrime[45] = [0, 2, 1];
  iToPrime[46] = [1, 0, 0, 0, 0, 0, 0, 0, 1];
  iToPrime[47] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
  iToPrime[48] = [4, 1];
  iToPrime[49] = [0, 0, 0, 2];
  iToPrime[50] = [1, 0, 2];
  iToPrime[51] = [0, 1, 0, 0, 0, 0, 1];
  iToPrime[52] = [2, 0, 0, 0, 0, 1];
  iToPrime[53] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
  iToPrime[80] = [4, 0, 1];
  iToPrime[81] = [0, 4];
}
