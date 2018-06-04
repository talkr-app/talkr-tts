export default class Utterance {
  constructor(text, pitch, rate, delay) {
    this._text = text;
    this._pitch = pitch;
    this._rate = rate;
    this._delay = delay;
    if (this._pitch === undefined) {
      this._pitch = 1.0;
    }
    if (this._rate === undefined) {
      this._rate = 1.0;
    }
    if (this._delay === undefined) {
      this._delay = 0.0;
    }
  }
  get text() {
    return this._text;
  }
  get pitch() {
    return this._pitch;
  }
  get rate() {
    return this._rate;
  }
  get delay() {
    return this._delay;
  }
  set text(val) {
    this._text = val;
  }
  set pitch(val) {
    this._pitch = val;
  }
  set rate(val) {
    this._rate = val;
  }
  set delay(val) {
    this._delay = val;
  }
}
