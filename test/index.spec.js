/* global describe, it, before */

import chai from 'chai';
import {Locale, Face, Voice, Utterance, Clip, Scene} from '../lib/talkr-tts.js';

chai.expect();

const expect = chai.expect;

let lib;

describe('Given an instance of my Utterance library', () => {
  before(() => {
    lib = new Utterance("test");
  });
  describe('when I need the text', () => {
    it('should return the text', () => {
      expect(lib.text).to.be.equal('test');
    });
  });
});

describe('Given an instance of my Clip library', () => {
  before(() => {
    lib = new Clip("test");
  });
  describe('when I need the text', () => {
    it('should return the text', () => {
      expect(lib.text).to.be.equal('test');
    });
  });
});

describe('Given an instance of my Utterance library', () => {
  before(() => {
    lib = new Utterance("test");
    lib.pitch = 1.5
  });
  describe('The pitch', () => {
    it('should equal 1.5', () => {
      expect(lib.pitch).to.be.equal(1.5);
    });
  });
});

describe('Given an instance of my Clip library', () => {
  before(() => {
    lib = new Clip("test");
  });
  describe('The id', () => {
    it('should have length > 0', () => {
      expect(lib.id.length > 0).to.be.equal(true);
    });
  });
});
describe('Given an instance of my Clip library', () => {
  before(() => {
    lib = new Clip("test");
  });
  describe('The object', () => {
    it('should be retrievable from the Base class', () => {
      expect(Clip.getByID(lib.id) == lib).to.be.equal(true);
    });
  });
});
