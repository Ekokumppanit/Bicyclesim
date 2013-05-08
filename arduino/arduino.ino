// Inspiration and parts of code from:
// http://www.instructables.com/id/Arduino-Bike-Speedometer/

// Connect the reed between 5V and A0.
// Add a 10kOhm resistor between ground and A0.

#define reed A0 // pin connected to read switch

// 80ms per wheel rev:
// (28 inch * pi) / (80 millisecond) = 100.543531 km/h
const int DEBOUNCE = 80; // 100 * 1/(1kHz) = 100ms

int val;
int revs = 0;
int counter = 0;

void setup() {
  pinMode(reed, INPUT);

  cli();

  // set timer1 interrupt at 1kHz
  TCCR1A = 0;// set entire TCCR1A register to 0
  TCCR1B = 0;// same for TCCR1B
  TCNT1  = 0;
  // set timer count for 1khz increments
  OCR1A = 1999;// = (1/1000) / ((1/(16*10^6))*8) - 1
  // turn on CTC mode
  TCCR1B |= (1 << WGM12);
  // Set CS11 bit for 8 prescaler
  TCCR1B |= (1 << CS11);
  // enable timer compare interrupt
  TIMSK1 |= (1 << OCIE1A);

  sei();

  Keyboard.begin();
}

// 1kHz timer
ISR(TIMER1_COMPA_vect) {
  val = digitalRead(reed);
  if (val) {
    if (counter == 0) {
      ++revs;
      counter = DEBOUNCE;
    } else if (counter > 0) {
      --counter;
    }
  } else if (counter > 0) {
    --counter;
  }
}

void output() {
  if (revs > 9) {
    Keyboard.write('a' + revs - 10);
  } else if (revs > 0) {
    Keyboard.write('0' + revs);
  }
  revs = 0;
}

void loop(){
  output();
  delay(1000);
}
