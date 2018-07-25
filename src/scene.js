
import Clip from './clip.js';
import Base from './base.js';
import EventEmitter from 'events';

export default class Scene extends Base {

  constructor(clipIDs, id) {
    super('scene', id);

    if (clipIDs === undefined) {
      clipIDs = [];
    }
    if (Array.isArray(clipIDs)) {
      clipIDs.forEach((id) => {
        if (typeof (id) !== 'string') {
          throw Error('Invalid clip id.');
        }
      });
    } else {
      throw Error('clipIDs were not an array.');
    }
    this._clips = clipIDs;
    this._stopped = true;
    this._name = null;
  }
  get clipIDs() {
    return this._clips;
  }

  deleteClip(id) {
    var i = this._clips.indexOf(id);

    if (i > -1) {
      let clip = Clip.getByID(id);

      this._clips.splice(i, 1);
      if (clip) {
        clip.delete();
      }
    }
  }

  addClip(id) {
    var clip = Clip.getByID(id);

    if (clip) {
      this._clips.push(id);
      clip.sceneid = this._id;
    }
  }

  get name() {
    return this._name;
  }
  set name(name) {
    this._name = name;
  }

  get text() {
    var text = '';

    this._clips.forEach((clipid)=> {
      let clip = Clip.getByID(clipid);

      if (!clip) {
        throw new Error('Invalid clip ID.');
      }
      text += clip.text + ' ';
    });
    return text.trim();
  }

  get clips() {
    var clips = [];

    this._clips.forEach((clipid)=> {
      let clip = Clip.getByID(clipid);

      if (!clip) {
        throw new Error('Invalid clip ID.');
      }
      clips.push(clip);
    });
    return clips;
  }

  delete() {
    this._clips.forEach((clipid)=> {
      delete Base.objects['clip'][clipid];
    });
    super.delete();
  }

  playClips(startIndex, endIndex) {
    Scene.stop();
    Scene.playing = this;
    if (startIndex === undefined) {
      startIndex = 0;
    } else if ( typeof (startIndex) === 'string'){
      startIndex = parseInt(startIndex);
    }

    if (endIndex === undefined) {
      endIndex = this._clips.length-1;
    } else if ( typeof (endIndex) === 'string'){
      endIndex = parseInt(endIndex);
    } 
    if( endIndex >= this._clips.length ){
      endIndex = this._clips.length-1;
    }

    this._stopped = false;
    if (endIndex < startIndex) {
      return;
    }

    let onPlayUtteranceWithDur = (dur, face) => {
      Scene.eventEmitter.emit('utterancestart', {'duration': dur, 'face': face});
    };

    let that = this;
    let onPlayNextClip = null;
    let playClipAtIndex = (clipIndex) => {
      if (this._stopped) {
        return;
      }
      let clip = Clip.getByID(that.clipIDs[clipIndex]);

      if (clip) {
        Scene.eventEmitter.emit('clipstart', clip);
        clip.playUtterances(onPlayUtteranceWithDur, onPlayNextClip);
      } else {
        throw new Error('unknown clip ID: ' + that.clipIDs[clipIndex]);
      }
    };
    let clipIndex = startIndex;

    onPlayNextClip = () => {
      if (clipIndex >= endIndex) {
        Scene.eventEmitter.emit('scenefinished');
        Scene.playing = null;
        return;
      }
      Scene.eventEmitter.emit('clipfinished', clipIndex);
      clipIndex += 1;
      playClipAtIndex(clipIndex);
    };
    playClipAtIndex(startIndex);
  }
  static stop() {
    if (Scene.playing) {
      Scene.playing._stopped = true;
    }
    Scene.playing = null;
    Clip.stop();
  }
  static fromTextAndFace(text, face) {
    let newClip = new Clip(text, face);

    return new Scene([newClip.id]);
  }
  static getByID(id) {
    return Base.getByTypeAndID('scene', id);
  }
  static fromJSON(json) {
    if (json['_clips'] && json['_id']) {
      let scene = new Scene(json['_clips'], json['_id']);
      let name = json['_name'];

      if (name) {
        scene.name = name;
      }
      return scene;
    }
    return null;
  }
}
Scene.playing = null;
Scene.eventEmitter = new EventEmitter();
Base.objects['scene'] = {};
