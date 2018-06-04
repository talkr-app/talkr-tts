import Base from './base.js';
import Voice from './voice.js';
export default class Face extends Base {

  // The id is the first parameter.  It is used to store the URL
  constructor(id, voice) {
    super('face', id);
    if (voice === undefined) {
      voice = new Voice();
    }
    this._voice = voice;
  }

  // TODO: remove
  get url() {
    return this._id;
  }
  set url(url) {
    this._id = url;
  }
  get voice() {
    return this._voice;
  }
  set voice(voice) {
    this._voice = voice;
  }

  static getByID(id) {
    return Base.getByTypeAndID('face', id);
  }
  static getlastID() {
    return Base.getlastID('face');
  }
  static fromJSON(json) {
    if (json['_id']) {
      let v = json['_voice'];
      let voice = null;

      if (v) {
        voice = new Voice(v['_locale'], v['_bIsMale'], v['_name']);
      }
      return new Face(json['_id'], voice);
    }
    return null;
  }
}

