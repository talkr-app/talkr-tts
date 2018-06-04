/**
 * Base class for TTS objects
 */
import EventEmitter from 'events';
export default class Base extends EventEmitter {

  constructor(type, id) {
    if (id === undefined) {
      id = Math.random().toString(36).substr(2, 9);
    } else if (typeof (id) !== 'string') {
      throw new Error('Invalid id');
    }
    super();
    this._id = id;
    this._type = type;

    if (!(this._type in Base.objects)) {
      Base.objects[this._type] = {};
    }
    Base.lastID[this._type] = this._id;
    Base.objects[this._type][this._id] = this;
  }

  /**
   * Get the id.
   * @return {string}
   */
  get id() {
    return this._id;
  }

  set id(id) {
    if (this._id in Base.objects[this._type]) {
      delete Base.objects[this._type][this._id];
    }
    this._id = id;
    Base.objects[this._type][this._id] = this;
    Base.lastID[this._type] = this._id;
  }

  delete() {
    delete Base.objects[this._type][this._id];
  }

  static get store() {
    return Base.objects;
  }
  static set store(store) {
    Base.objects = store;
  }

  static getlastID(type) {
    return Base.lastID[type];
  }

  static getByTypeAndID(type, id) {
    if (type in Base.objects) {
      if (id in Base.objects[type]) {
        Base.lastID[type] = id;
        return Base.objects[type][id];
      }
    }
    return null;
  }
}
Base.lastID = {};
Base.objects = {};
