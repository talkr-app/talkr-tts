import Utterance from './utterance.js';
import Voice from './voice.js';
import Face from './face.js';
import Base from './base.js';

const hasWindow = typeof window === 'object' && window !== null && window.self === window;
const speechSynthesis = hasWindow && 'speechSynthesis' in window ? window.speechSynthesis : null;

export default class Clip extends Base {
  constructor(utterances, face, id) {
    super('clip', id);
    if (utterances === undefined) {
      utterances = [];
    }
    if (typeof (utterances) === 'string') {
      this._utterances = this._splitUtterances(utterances);
    } else if (Array.isArray(utterances)) {
      utterances.forEach((ut) => {
        if (!(ut instanceof Utterance)) {
          throw Error('Invalid utterance array.');
        }
      });
      this._utterances = utterances;
    } else {
      throw Error('Unknown type for utterances.');
    }
    if (typeof (face) === 'string') {
      this._faceid = face;
    } else if (face instanceof Face) {
      this._faceid = face.id;
    } else {
      let lastID = Face.getlastID();

      if (!lastID) {
        lastID = new Face().id;
      }
      this._faceid = lastID;
    }
    this._stopped = true;
  }

  /**
   * Get the utterances.
   * @return {Utterance[]}
   */
  get utterances() {
    return this._utterances;
  }

  get face() {
    var f = Face.getById(this._faceid);

    if (f) {
      return f;
    }
    return null;
  }

  set face(face) {
    if (face.id) {
      this._faceid = face.id;
    } else {
      throw new Error('not a face');
    }
  }
  /**
   * Gets the Voice
   * @return {Voice}
   */
  get voice() {
    return this.face.voice;
  }
  set voice(voice) {
    this.face.voice = voice;
  }
  get text() {
    let combinedText = '';
    let numUtterances = this._utterances.length;

    for (let i = 0; i < numUtterances; ++i) {
      combinedText = combinedText + this._utterances[i].text + ' ';
    }
    return combinedText.trim();
  }

  get sceneid() {
    return this._sceneid;
  }

  set sceneid(id) {
    this._sceneid = id;
  }

  /**
   * Gets the Face
   * @return {Face}
   */
  get face() {
    return Face.getByID(this._faceid);
  }
  set face(face) {
    if (typeof (face) === 'string') {
      if (Face.getByID(face)) {
        this._faceid = face;
      }
    }
    this._faceid = face.id;
  }

  playAfterDelay(msg) {
    if (this._stopped) {
      return;
    }
    speechSynthesis.speak(msg);
    // The delay parameter is added to the SpeechSynthesisUtterance object
    if (msg.delay > 0) {

      speechSynthesis.pause();

      setTimeout(function () {
        var event = new Event('start');

        // Trigger the start events again.
        msg.delay = 0;
        msg.dispatchEvent(event);
        speechSynthesis.resume();
      }, msg.delay * 1000);
    }
  }
  playUtterances(onPlayUtteranceWithDur, onFinishedClip, onStartClip) {
    this._stopped = false;
    Clip.playing = this;

    if (speechSynthesis) {
      if (speechSynthesis.speaking) {
        // console.log("Can't play TTS when we are already speaking");
        // if (onFinishedClip) onFinishedClip();
        // return;
        speechSynthesis.cancel();
      }

      this._ssUtterances = [];
      for (let i = 0, l = this._utterances.length; i < l; ++i) {
        let utterance = this._utterances[i];
        let utteranceText = utterance.text;

        if (!utteranceText || utteranceText.length === 0) {
          continue;
        }
        let msg = new SpeechSynthesisUtterance();
        // if you change the rate, you would have to adjust
        let speakingDurationEstimate = utteranceText.length * 50;

        // Chinese needs a different calculation.  Haven't tried other Asian languages.
        if (utteranceText.match(/[\u3400-\u9FBF]/)) {
          speakingDurationEstimate = utteranceText.length * 200;
        }

        msg.rate = utterance.rate;
        msg.pitch = utterance.pitch;
        msg.text = utteranceText;

        // Add delay as paramater for ease of use
        msg.delay = utterance.delay;
        if (this.voice) {
          msg.voice = Voice.getTTSVoice(this.voice);
          if (msg.voice) {
            msg.voiceURI = msg.voice.voiceURI;
          }
        }
        this._ssUtterances.push([msg, speakingDurationEstimate]);
      }
      // Now setup the events
      if (this._ssUtterances.length > 0) {
        this._ssUtterances[0][0].addEventListener('start', () => {
          if (onStartClip) {
            if (this._ssUtterances[0][0].delay === 0) {
              onStartClip();
            }
          }
        });
        this._ssUtterances[this._ssUtterances.length - 1][0].addEventListener('end', () => {
          if (onFinishedClip) {
            onFinishedClip();
          }
          this._stopped = true;
          Clip.playing = null;
          // Safe to clear this out now.
          this._ssUtterances = [];
        });
        for (let i = 0, l = this._ssUtterances.length; i < l; ++i) {
          ((msg, dur) => {
            msg.addEventListener('start', () => {
              if (onPlayUtteranceWithDur) {
                if (msg.delay === 0) {
                  onPlayUtteranceWithDur(dur, this.face);
                }
              }
            });
          })(this._ssUtterances[i][0], this._ssUtterances[i][1]);
        }
        for (let i = 0, l = this._ssUtterances.length - 1; i < l; ++i) {
          ((msg1, msg2) => {
            msg1.addEventListener('end', () => {
              this.playAfterDelay(msg2);
            });
          })(this._ssUtterances[i][0], this._ssUtterances[i + 1][0]);
        }
        this.playAfterDelay(this._ssUtterances[0][0]);
      }
    }
  }

  updateText(text) {
    let newUtterances = this._splitUtterances(text);

    let curLen = this._utterances.length;
    let newLen = newUtterances.length;

    // Easy case, the number of Utterances didn't change
    if (curLen === newLen) {
      for (let i = 0; i < curLen; ++i) {
        this._utterances[i].text = newUtterances[i].text;
      }
      return;
    }

    // Store the original utterances in a dictionary with text as key.
    let utteranceDict = {};

    for (let i = 0; i < curLen; ++i) {
      if (this._utterances[i].text in utteranceDict) {
        // handle duplicate utterances with different pitch/rate
        utteranceDict[this._utterances[i].text].push(this._utterances[i]);
      } else {
        utteranceDict[this._utterances[i].text] = [this._utterances[i]];
      }
    }

    let defaultRateIndices = [];

    for (let i = 0; i < newLen; ++i) {
      let newText = newUtterances[i].text;

      if (newText in utteranceDict) {
        newUtterances[i] = utteranceDict[newText].shift();
        if (utteranceDict[newText].length === 0) {
          delete utteranceDict[newText];
        }
      } else {
        defaultRateIndices.push(i);
      }
    }

    // Match the leftovers
    if (defaultRateIndices.length > 0 && Object.values(utteranceDict).length > 0) {
      let cachedText = newUtterances[defaultRateIndices[0]].text;

      newUtterances[defaultRateIndices[0]] = Object.values(utteranceDict)[0][0];
      newUtterances[defaultRateIndices[0]].text = cachedText;
    }
    this._utterances = newUtterances;
  }

  /**
   * Convert a string containing punctuation-separated utterances into an array
   * of utterances
   * @param {string} text - The string containing punctuation-separated utterances.
   * @return {Utterance[]} An array of Utterance objects
   */
  _splitUtterances(text) {

    // Splitting each utterance up using punctuation is important.  Intra-utterance
    // punctuation will add silence to the tts which looks bad unless the mouth stops moving
    // correctly. Better to split it into separate utterances so play_for_duration will move when
    // talking, and be on frame 0 when not.
    let utterances = [];

    // split everything betwen deliminators [.?,!], but include the deliminator.
    let substrings = text.match(/[^.?,!]+[.?,!]?/g);

    if (substrings) {
      for (let i = 0, l = substrings.length; i < l; ++i) {
        let str = substrings[i].trim();

        // Make sure there is something to say other than the deliminator
        let numpunc = (str.match(/[.?,!]/g) || []).length;

        if (str.length - numpunc > 0) {
          utterances.push(new Utterance(str));
        }
      }
    }
    return utterances;
  }
  static stop() {
    if (Clip.playing) {
      Clip.playing._stopped = true;
    }
    Clip.playing = null;
    if (speechSynthesis) {
      speechSynthesis.cancel();
    }
  }
  static getByID(id) {
    return Base.getByTypeAndID('clip', id);
  }
  static fromJSON(json) {
    if (json['_utterances'] && json['_id']) {
      let utterances = [];

      for (let i = 0, l = json['_utterances'].length; i < l; ++i) {
        let ut = json['_utterances'][i];

        utterances.push(new Utterance(ut._text, ut._rate, ut._pitch, ut._delay));
      }

      let newClip = new Clip(utterances, json['_faceid'], json['_id']);

      newClip._sceneid = json['_sceneid'];

      return newClip;
    }
    return null;
  }
}
Clip.playing = null;

