
const hasWindow = typeof window === 'object' && window !== null && window.self === window && window.navigator !== null;
const bIsiOS = hasWindow && /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream;
const hasSpeechSynthesis = hasWindow && window.speechSynthesis !== null;

// const iOSEnglishVoices = ['Karen', 'Serena', 'Moira', 'Tessa', 'Samantha'];
// const bIsAndroid = /android/i.test(navigator.userAgent);
const iOSVoiceNames = [
  'Maged',
  'Zuzana',
  'Sara',
  'Anna',
  'Melina',
  'Karen',
  'Daniel',
  'Moira',
  'Tessa',
  'Alex',
  'Monica',
  'Paulina',
  'Satu',
  'Amelie',
  'Thomas',
  'Carmit',
  'Lekha',
  'Mariska',
  'Damayanti',
  'Alice',
  'Kyoko',
  'Yuna',
  'Ellen',
  'Xander',
  'Nora',
  'Zosia',
  'Luciana',
  'Joana',
  'Ioana',
  'Milena',
  'Laura',
  'Alva',
  'Kanya',
  'Yelda',
  'Ting-Ting',
  'Sin-Ji',
  'Mei-Jia'
];

const minimumPriority = 10;

const voiceProperties = {
  'Microsoft David Desktop - English (United States)': { male: true, priority: 13 },
  'Microsoft Hazel Desktop - English (Great Britain)': { male: false, priority: 14 },
  'Microsoft Zira Desktop - English (United States)': { male: false, priority: 14 },
  'Google US English': { male: false, priority: 24 },
  'Google UK English Female': { male: false, priority: 24 },
  'Google UK English Male': { male: true, priority: 23 },
  'Lee': { male: true, priority: 33 },
  'Fred': { male: true, priority: 8 },
  'Alex': { male: true, priority: 34 },
  'Daniel': { male: true, priority: 33 },
  'Daniel (Enhanced)': { male: true, priority: 43 },
  'Oliver': { male: true, priority: 33 },
  'Oliver (Enhanced)': { male: true, priority: 43 },
  'Samantha': { male: false, priority: 38 },
  'Victoria': { male: false, priority: 9 },
  'Veena': { male: false, priority: 32 },
  'Tessa': { male: false, priority: 37 },
  'Fiona': { male: false, priority: 37 },
  'Moira': { male: false, priority: 37 },
  'Karen': { male: false, priority: 37 }
};

const languageProperties = {
  'en': 'English',
  'zh': 'Chinese',
  'ru': 'Russian',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'vi': 'Vietnamese',
  'tr': 'Turkish',
  'th': 'Thai',
  'es': 'Spanish',
  'fr': 'French',
  'sk': 'Slovak',
  'ro': 'Romanian',
  'pl': 'Polish',
  'nl': 'Dutch',
  'ko': 'Korean',
  'ja': 'Japanese',
  'he': 'Hebrew',
  'el': 'Greek',
  'fi': 'Finish',
  'no': 'Norwegian',
  'da': 'Danish',
  'cs': 'Czech',
  'ar': 'Arabic'
};

const languagePropertiesInverted = {
  'English': 'en',
  'Chinese': 'zh',
  'Russian': 'ru',
  'German': 'de',
  'Italian': 'it',
  'Portuguese': 'pt',
  'Vietnamese': 'vi',
  'Turkish': 'tr',
  'Thai': 'th',
  'Spanish': 'es',
  'French': 'fr',
  'Slovak': 'sk',
  'Romanian': 'ro',
  'Polish': 'pl',
  'Dutch': 'nl',
  'Korean': 'ko',
  'Japanese': 'ja',
  'Hebrew': 'he',
  'Greek': 'el',
  'Finish': 'fi',
  'Norwegian': 'no',
  'Danish': 'da',
  'Czech': 'cs',
  'Arabic': 'ar'
};

/*
var langs =
[['Afrikaans',       ['af-ZA']],
 ['Bahasa Indonesia',['id-ID']],
 ['Bahasa Melayu',   ['ms-MY']],
 ['Català',          ['ca-ES']],
 ['Čeština',         ['cs-CZ']],
 ['Deutsch',         ['de-DE']],
 ['English',         ['en-AU', 'Australia'],
 ['Español',         ['es-AR', 'Argentina'],
 ['Euskara',         ['eu-ES']],
 ['Français',        ['fr-FR']],
 ['Galego',          ['gl-ES']],
 ['Hrvatski',        ['hr_HR']],
 ['IsiZulu',         ['zu-ZA']],
 ['Íslenska',        ['is-IS']],
 ['Italiano',        ['it-IT', 'Italia'],
 ['Magyar',          ['hu-HU']],
 ['Nederlands',      ['nl-NL']],
 ['Norsk bokmål',    ['nb-NO']],
 ['Polski',          ['pl-PL']],
 ['Português',       ['pt-BR', 'Brasil'],
 ['Română',          ['ro-RO']],
 ['Slovenčina',      ['sk-SK']],
 ['Suomi',           ['fi-FI']],
 ['Svenska',         ['sv-SE']],
 ['Türkçe',          ['tr-TR']],
 ['български',       ['bg-BG']],
 ['Pусский',         ['ru-RU']],
 ['Српски',          ['sr-RS']],
 ['한국어',            ['ko-KR']],
 ['中文',             ['cmn-Hans-CN', '普通话 (中国大陆)'],
 ['日本語',           ['ja-JP']],
 ['Lingua latīna',   ['la']]];
*/

export default class Voice {

  static getLangauges() {
    var codes = [];
    var languages = [];

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    if (hasSpeechSynthesis) {
      speechSynthesis.getVoices().forEach(function (v) {
        codes.push(v.lang.substring(0, 2));
      });
    }

    let unique = codes.filter(onlyUnique);

    unique.forEach(function (l) {
      if (l in languageProperties) {
        languages.push(languageProperties[l]);
      } else {
        languages.push(l);
      }
    });
    return languages;
  }

  static getVoicesForLangauge(language) {
    var code = languagePropertiesInverted[language];
    var names = [];
    var voices = [];

    if (code) {
      voices = Voice.getVoicesWithLangSubstring(code);
      voices.forEach(function (v) {
        names.push(v.name);
      });
      return names;
    }
    return [];
  }

  static getVoicesWithLangSubstring(langSubstr) {
    let filteredvoices = [];

    if (hasSpeechSynthesis) {
      filteredvoices = speechSynthesis.getVoices().filter(function (v) {
        if (voiceProperties[v.name]) {
          if (voiceProperties[v.name].priority < minimumPriority) {
            return false;
          }
        }
        return v.lang.substring(0, langSubstr.length) === langSubstr;
      });
    }
    // iOS returns more than they let you select.
    if (bIsiOS) {
      let newVoices = [];
      let last = filteredvoices.length - 1;

      for (let i = last; i >= 0; --i) {
        for (let j = 0; j < iOSVoiceNames.length; ++j) {
          if (filteredvoices[i].name === iOSVoiceNames[j]) {
            newVoices.push(filteredvoices[i]);
          }
        }
      }
      filteredvoices = newVoices;
    }

    // So does Android...all versions?

    function sortCompare(a, b) {
      let aPriority = 0;
      let bPriority = 0;

      if (voiceProperties[a.name]) {
        aPriority = voiceProperties[a.name].priority;
      }
      if (voiceProperties[b.name]) {
        bPriority = voiceProperties[b.name].priority;
      }
      if (a.name.includes('Enhanced')) {
        aPriority++;
      }
      if (b.name.includes('Enhanced')) {
        bPriority++;
      }
      return bPriority - aPriority;
    }
    return filteredvoices.sort(sortCompare);
  }
  static getTTSVoice(voiceObj) {
    return Voice._getBestVoice(voiceObj.name, voiceObj.locale, voiceObj.isMale, voiceObj.index);
  }
  static _getBestVoice(name, locale, bIsMale, index) {
    if (name) {
      let namedVoice = Voice._getVoiceWithName(name);

      if (namedVoice) {
        return namedVoice;
      }
    }
    let matchingVoices = Voice._getBestVoices(locale, bIsMale);

    if (matchingVoices.length > 0) {
      if (index != null) {
        index = Math.abs(parseInt(index, 10));
        index = index % matchingVoices.length;
      } else {
        index = 0;
      }
      return matchingVoices[index];
    }

    // Try english voices if we didn't get any for the provided locale.
    if (locale !== 'en') {
      console.warn('No voices for locale: ' + locale);
      return Voice._getBestVoice(null, 'en', bIsMale, index);
    }

    let lastResorts = [];

    if (hasSpeechSynthesis) {
      lastResorts = speechSynthesis.getVoices();
    }
    if (lastResorts[0]) {
      return lastResorts[0];
    }
    return null;
  }
  static _getBestVoices(locale, bIsMale) {

    let voices = [];
    let genderVoices = [];

    if (locale && locale.length > 1) {
      voices = Voice.getVoicesWithLangSubstring(locale);
    }

    voices.forEach(function (v) {
      if (v.name in voiceProperties) {
        if (bIsMale === voiceProperties[v.name].male) {
          genderVoices.push(v);
        }
      } else {
        // We don't know the gender of this voice.  Let's cross our fingers.
        genderVoices.push(v);
      }
    });

    // Try with only the first two letters of the locale.
    if (genderVoices.length === 0 && locale.length > 2) {
      return this._getBestVoices(locale.substring(0, 2), bIsMale);
    }

    // Any gender will do at this point.
    if (genderVoices.length === 0) {
      voices.forEach(function (v) {
        genderVoices.push(v);
      });
    }

    return genderVoices;
  }

  static _getVoicesWithName(name) {
    if (hasSpeechSynthesis) {
      return speechSynthesis.getVoices().filter(function (v) {
        return v.name === name;
      });
    }
    return [];
  }
  static _getVoiceWithName(name) {
    if (hasSpeechSynthesis) {
      let voices = speechSynthesis.getVoices().filter(function (v) {
        return v.name === name;
      });

      if (voices.length > 0) {
        return voices[0];
      }
    }

    return null;
  }
  static doesSupportPitchAndRate(name) {
    let namedVoice = Voice._getVoiceWithName(name);

    if (namedVoice) {
      return namedVoice.localService === true;
    }
    return false;
  }
  constructor(locale, bIsMale, preference) {

    this._locale = locale;
    this._bIsMale = bIsMale;
    this._name = preference;
    this._index = null;
    if (this._locale === undefined) {
      this._locale = Voice.defaultlocale;
    }
    if (this._bIsMale === undefined) {
      this._bIsMale = Voice.defaultbIsMale;
    }
    if (this._name !== undefined) {
      if (this._name in voiceProperties) {
        this._bIsMale = voiceProperties[this._name].male;
      }
    }
    // A number for the name indicates we should choose a different
    // voice than the first.
    if (this._name && !isNaN(this._name)) {
      this._index = this._name;
      this._name = null;
    }

    Voice.defaultlocale = this._locale;
    Voice.defaulbIsMale = this._bIsMale;
  }
  get index() {
    return this._index;
  }
  get name() {
    return this._name;
  }
  get locale() {
    return this._locale;
  }
  get isMale() {
    return this._bIsMale;
  }
  get language() {
    return languageProperties[this._locale.substring(0, 2)];
  }
}
Voice.defaultlocale = 'en-US';
Voice.defaultbIsMale = false;
