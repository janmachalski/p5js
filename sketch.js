// JUST INTONATION HARMONY ENGINE
// p5js
// copyright Jan Machalski 2019
// version 2020_07_25_17_28

let dzwiek = 0; //audio ON/OFF
const iloscGlosow = 2; // 3 dla triad ale domyslnie dwuglos
const modusInit = 3; // three logarithmic/arithmetic intervals per octave
const freqInit = 220.0; // reference frequency from which the rest is being built
let utonalInit = false; // false=major true=minor first chord switch (negative harmony switch)
const tuneHue = 530.0; // tune audio and colour spectrum if needed

let glosy = [];
let syntezatory = [];
let liczbaPierwsza = []; //array liczb pierwszych
let iToEpimeric = []; //dictionary of factorizations. Product (p/(p-1))^n
let reverb;
let reverbTime = 4;

function setup() {
  createCanvas(600, 600);
  for (i = 0, j = 0; i < 100; i++) { // generuje array liczb pierwszych
    if (isPrime(i)) {
      liczbaPierwsza[j] = i;
      j += 1;
    }
  }
  iToEpimericInit();
  for (let i = 0; i < iloscGlosow; i++) {
    glosy[i] = new Glos();


    for (let j = 0; j < i; j++) {
      glosy[i].wyzej();
    }
    glosy[i].przelicz();
    syntezatory[i] = new p5.Oscillator('sine');
  }

  rozpiszMatme();
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
    fill(freqToHue(glosy[i].freq), 255, 155);
    rect(0, (height * (iloscGlosow - 1 - i) / iloscGlosow), width, height / iloscGlosow); // pierwsza wartosc to width*i/3

  }

  //rysuj rownania
  for (let i = 0; i < iloscGlosow; i++) {
    fill(0, 0, 0);
    text(glosy[i].string, 25, (height * (iloscGlosow - i) / iloscGlosow) - 10);

  }

  // wyswietl numery glosow
  for (let i = 0; i < iloscGlosow; i++) {
    fill(0, 0, 0);
    text(i, 5, height * (iloscGlosow - i) / iloscGlosow);

  }

  if (dzwiek == 1) {

    for (let i = 0; i < iloscGlosow; i++) {
      syntezatory[i].freq(glosy[i].freq, 0.2);

    }
  }
  //wyjscie poza mape resetuje parametry
  for (let i = 0; i < iloscGlosow; i++) {
    if (glosy[i].freq > 4000 ^ glosy[i].freq < 80) {
      reset();
    }
  }
}

class Glos {
  constructor() {
    this.modus = modusInit
    this.skladnik = 0;
    this.utonal = utonalInit;
    this.transposition = freqInit;

    this.epimeric = []; // zero as default factorization
    for (let i = 0; i < 16; i++) {
      this.epimeric[i] = 0;
    }
    this.string = "loading";
  }

  // MUSIC HARMONY ENGINE
  przelicz() {
    let epimoricPart = 1;
    let epimericPart = 1;

    if (this.utonal == true) {
      epimoricPart = (this.modus / (this.modus + this.skladnik));
    } else {
      epimoricPart = ((this.modus + this.skladnik) / this.modus);
    }
    for (let i = 0; i < 8; i++) {
      epimericPart *= pow((liczbaPierwsza[i] / (liczbaPierwsza[i] - 1)), this.epimeric[i]);
    }
    this.freq = this.transposition * epimoricPart * epimericPart;

  }

  changeUtonal() { // "upside down" harmony switch (negative harmony)
    if (this.skladnik != 0) {
      this.skladnik = this.modus - this.skladnik;
      switch (this.utonal) {
        case false:
          this.epimeric[0] += 1;
          break;
        case true:
          this.epimeric[0] -= 1;
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
          this.epimeric[0] += 1;
          break;
        case true:
          this.epimeric[0] -= 1;
          break;
      }
    } else {
      this.skladnik += 1;
    }

    this.przelicz();

  }

  //przewroty akordow, moze da sie scalic z tym powyzej w jedna funkcje
  count210() { // counting 2, 1, 0 through octaves: if major then down, if minor then up.
    if (this.skladnik <= 0) {
      this.skladnik = this.modus - 1;
      switch (this.utonal) {
        case false:
          this.epimeric[0] -= 1;
          break;
        case true:
          this.epimeric[0] += 1;
          break;
      }
    } else {
      this.skladnik -= 1;
    }
    this.przelicz();
  }


  wyzej() {
    switch (this.utonal) {
      case false:
        if (this.skladnik == this.modus - 1) {
          this.skladnik = 0;
          this.epimeric[0] += 1;
        } else {
          this.skladnik += 1;
        }
        break;
      case true:
        if (this.skladnik == 0) {
          this.skladnik = this.modus - 1;
          this.epimeric[0] += 1;
        } else {
          this.skladnik -= 1;
        }
        break;
    }
    this.przelicz();
  }

  nizej() {
    switch (this.utonal) {
      case false:
        if (this.skladnik == 0) {
          this.skladnik = this.modus - 1;
          this.epimeric[0] -= 1;
        } else {
          this.skladnik -= 1;
        }
        break;
      case true:
        if (this.skladnik == this.modus - 1) {
          this.skladnik = 0;
          this.epimeric[0] -= 1;
        } else {
          this.skladnik += 1;
        }
        break;
    }

  }

  transponuj(wpiszLicznik, wpiszMianownik) {
    for (let i = 0; i < 9; i++) {
      this.epimeric[i] += iToEpimeric[wpiszLicznik][i];
      this.epimeric[i] -= iToEpimeric[wpiszMianownik][i];

    }
    this.przelicz();
  }

  /* Czyli poszczegolny glos mozna:
 -Przenosic przez oktawy
 - Przeniesc w gore lub w dol po skladnikach akordu
  -Przewrocic utonalnie
  -Przetransponowac o dowolny interwal
  -Przetransponowac o interwal zawarty w danym systemie (modus=2 to tylko kwarty i kwinty)
  (do zrobienia. Fajnie jakby zmieniajac modus generowaly sie dodatkowe przyciski)
  -Wtracic zmiane modusa na chwile (czyli w systemie triad modus=3, mozna by na chwile zmienic
  we wzorze na czestotliwosc danego glosu 3 na np. 2 albo 4 dajac w ten sposob dzwieki przejsciowe.)
  Do zrobienia: przetransponowac akord tak, aby struktura byla ta sama, ale wybrany dzwiek zostal w miejscu
  */
  itoi(i1, i2) {
    switch (this.utonal) {
      case false:
        //        this.transposition *= ((this.modus + i1) / this.modus) / ((this.modus + i2) / this.modus);
        this.transponuj((this.modus + i1), (this.modus + i2));
        if (i1 > i2) {
          for (let i = 0; i < i1 - i2; i++) {
            this.nizej();
          }
        } else if (i1 < i2) {
          for (let i = 0; i < i2 - i1; i++) {
            this.wyzej();
          }
        } else {

        }
        break;
      case true:
        //       this.transposition *= (this.modus / (this.modus + i1)) / (this.modus / (this.modus + i2));
        this.transponuj((this.modus + i2), (this.modus + i1));
        if (i1 < i2) {
          for (let i = 0; i < i2 - i1; i++) {
            this.nizej();
          }
        } else if (i1 > i2) {
          for (let i = 0; i < i1 - i2; i++) {
            this.wyzej();
          }
        } else {

        }
        break;
    }
    this.przelicz();
  }
  // tutaj wpisac (chyba zrobione itoi) funkcje dotyczaca transpozycji struktury harmonicznej wzgledem tego glosu.
  /* Wybieramy glos, ktory ma zostac w miejscu, czyli np. glos ma dzwiek E w trojdzwieku C-dur.
  Wybieramy docelowy skladnik dla tego glosu, np poprzez klikniecie na inny grajacy glos
  (np. grajace G, czyli kwinte obecnego trojdzwieku).
  Czyli np. chcemy aby cala harmonia zmienila sie wzgledem tego E,
  czyli aktualny glos grajacy E, nie gral tercji akordu tylko kwinte (jak G) w nowym akordzie (A-dur).
  Podstawowa czestotliwosc wszystkich glosow zostaje przemnozona przez interwal pomiedzy wybranym
  glosem ktory ma zostac w miejscu, a relatywnym innym, a nastepnie wszystkie glosy przesuwaja sie
  ("po arpeggiu") w dol lub w gore poprzez liczenie 0 1 2, albu 0 2 1, aby zrekompensowac
  roznice wysokosci.
  Czyli brzmi C-dur jako C=f*((3+1)/3)*2^0, E=f*((3+2)/3)*2^0, G=f*((3+0)/3)*2^1
  Klikamy E f*((3+2)/3)*2^0 i klikamy G f*((3+0)/3)*2^1
  Wszystkie glosy sa przemnozone przez 5/6
  Ulamek jest mniejszy od 1, wiec wszystkie glosy powinny isc w gore dla rekompensaty.
  Wszystkie glosy ida w gore (012), czyli dzwiek E przechodzi na ten sam dzwiek,
  ale zapisany jako f*(5/6)*((3+0)/3)*2^1
  (przechodzac na 0 po 0 1 2, lub na 2 przed 0 1 2, trzeba zmieniac oktawy)
  */
  modusUp() {
    this.modus += 1;

    this.przelicz();
  }
  modusDown() {
    if (this.modus > 1) {
      this.modus -= 1;
      if (this.modus == this.skladnik) {
        this.skladnik = 0;
        switch (this.utonal) {
          case false:
            this.epimeric[0] += 1;
            break;
          case true:
            this.epimeric[0] -= 1;
            break;
        }
      }
    }

    this.przelicz();
  }



}

// TO DO rozpiszMatme chyba powinno byc metoda dla klasy glosy (return string)
//writes equation as string
function rozpiszMatme() {
  for (let i = 0; i < iloscGlosow; i++) {
    glosy[i].string = "Glos[" + i + "]:   " + glosy[i].transposition + "Hz";
    if (glosy[i].utonal == true) {
      glosy[i].string += " * [(" + glosy[i].modus + " / (" + glosy[i].modus + " + " + glosy[i].skladnik + ")]";

    } else {
      glosy[i].string += " * [(" + glosy[i].modus + " + " + glosy[i].skladnik + ") / " + glosy[i].modus + "]";

    }
    for (let j = 0; j < 4; j++) {
      glosy[i].string += " * (" + liczbaPierwsza[j] + "/" + (liczbaPierwsza[j] - 1) + ")^" + glosy[i].epimeric[j];
    }
    glosy[i].string += " = " + glosy[i].freq + "Hz";
  }

}

// SOUND CHROMA TO COLOUR CHROMA CONVERSION (frequency to hue)
function freqToHue(freq) {
  let pitch = 69.00 + 12.0 * log(freq / tuneHue) / log(2); //freq to pitch
  let h = pitch - (12.0 * int(pitch / 12.0)); // float modulo
  h = int(map(h, 0.0, 12.0, 255, 0)); // convert to hue 0-255h
  return h;
}

function mousePressed() {
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


  //  for (let i = 0; i < iloscGlosow; i++) {}

}

function mouseReleased() {

  //  for (let i = 0; i < iloscGlosow; i++) {
  //    syntezatory[i].amp(0.06, 0.4);
  //  }

  for (let i = 0; i < iloscGlosow; i++) {
    // glosy[i].itoi(2, 1);
    // glosy[i].transponuj(5,4);
    // glosy[i].count012();
    // glosy[i].count210();
    //  glosy[i].nizej();
    //  glosy[i].wyzej();
    //  glosy[i].modusDown();
    // glosy[i].modusUp();
    glosy[i].przelicz();

  }
  rozpiszMatme();
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
      glosy[i].itoi(0, 1);
    }
  } else if (key == "a") {
    for (let i = 0; i < iloscGlosow; i++) {
      glosy[i].itoi(1, 0);
    }
  } else if (key == "w") {
    for (let i = 0; i < iloscGlosow; i++) {
      glosy[i].itoi(1, 2);
    }
  } else if (key == "s") {
    for (let i = 0; i < iloscGlosow; i++) {
      glosy[i].itoi(2, 1);
    }
  } else if (key == "e") {
    for (let i = 0; i < iloscGlosow; i++) {
      glosy[i].itoi(2, 0);
    }
  } else if (key == "d") {
    for (let i = 0; i < iloscGlosow; i++) {
      glosy[i].itoi(0, 2);
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
  } else if (key == "i") {
    glosy[1].wyzej();
  } else if (key == "k") {
    glosy[1].nizej();
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
  rozpiszMatme();
}

function isPrime(num) {
  for (var i = 2; i <= sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return num !== 1 && num !== 0;
}

function reset() {
  for (let i = 0; i < iloscGlosow; i++) {
    glosy[i].modus = modusInit;
    glosy[i].skladnik = 0;
    glosy[i].transposition = freqInit;
    for (let j = 0; j < 10; j++) {
      glosy[i].epimeric[j] = 0;

    }
    for (let j = 0; j < i; j++) {
      glosy[i].wyzej();
    }
    glosy[i].przelicz();


  }
}
//LOADS A DICTIONARY OF EPIMORIC FACORIZATION OF INT NUMBERS
function iToEpimericInit() {
  // int to prime epimeric factorization: int = [n1, n2, n3, n4...]
  // int = (2)^n1*(3/2)^n2*(5/4)^n3*(7/6)^n4*(11/10)^n5 etc.
  iToEpimeric[1] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[2] = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[3] = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[4] = [2, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[5] = [2, 0, 1, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[6] = [2, 1, 0, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[7] = [2, 1, 0, 1, 0, 0, 0, 0, 0, 0];
  iToEpimeric[8] = [3, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[9] = [2, 2, 0, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[10] = [3, 0, 1, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[11] = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0];
  iToEpimeric[12] = [3, 1, 0, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[13] = [3, 1, 0, 0, 0, 1, 0, 0, 0, 0];
  iToEpimeric[14] = [3, 1, 0, 1, 0, 0, 0, 0, 0, 0];
  iToEpimeric[15] = [3, 1, 1, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[16] = [4, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[17] = [4, 0, 0, 0, 0, 0, 1, 0, 0, 0];
  iToEpimeric[18] = [3, 2, 0, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[19] = [3, 2, 0, 0, 0, 0, 0, 1, 0, 0];
  iToEpimeric[20] = [4, 0, 1, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[21] = [3, 2, 0, 1, 0, 0, 0, 0, 0, 0];
  iToEpimeric[22] = [4, 0, 1, 0, 1, 0, 0, 0, 0, 0];
  iToEpimeric[23] = [4, 0, 1, 0, 1, 0, 0, 0, 1, 0];
  iToEpimeric[24] = [4, 1, 0, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[25] = [4, 2, 0, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[26] = [4, 1, 0, 0, 0, 1, 0, 0, 0, 0];
  iToEpimeric[27] = [3, 3, 0, 0, 0, 0, 0, 0, 0, 0];
  iToEpimeric[28] = [4, 1, 0, 1, 0, 0, 0, 0, 0, 0];

}