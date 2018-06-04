# talkr-tts

`talkr-tts` wraps speechSynthesis calls with a framework that helps animate something to the voice.  An attempt is made to estimate the duration of the speech.  Events are emitted by the Scene class to communicate when a Face is speaking, and for how long it will speak for.

## Classes

### Utterance

An utterance is the smallest unit of speech.  There should be no pauses in an utterance, so a phrase with a comma in it should be split into two utterances.  An utterance has a pitch, rate, and a delay.  Only local TTS voices, (as opposed to cloud-based ones by google) can change pitch and rate.

### Voice

A voice is a TTS voice.  It has a locale ('en-US', or 'ru-RU'), a gender, and a voice preference.  Different operating systems and browsers will have access to different voices, so the voice preference will only be selected if it exists (even if the locale or gender doesn't match).  If the voice preference is an integer i, we'll use the i'th voice that matches the locale and gender.  Partial locales are supported, so 'en' will consider all English voices, including those from the US, UK and other locations.

### Face

A face consists of a Voice and an id.  The id is commonly a URL to something that will animate.

### Clip

A clip is one or more utterances that are spoken consecutively by a Face.  

### Scene

A scene contains one or more clips that are spoken consecutively, potentially by different Faces.  Scenes handles playing back the clips and emitting events including:

'clipstart' : Notifies you when a new clip is starting. Passes you the clip object.  This is normally a good time to change the currently visible character based on the face property of the clip.

'utterancestart': Notifies you when a new utterance starts. Passes you an object with a *duration* and a *face* keys.   The duration is an estimate for how long the utterance will play.  The face is the face object that is playing the utterance.  

'scenefinished': Notifies you when the scene has finished playing.


## iOS restrictions

iOS only allows text-to-speech to be initiated by the user.  So calling the playClips() function of the Scene object should only be done by user-initiated events (a click or a tap) if you want it to work on all mobile devices.  In most cases, all of the clips and utterances will play, but utterance delays of sufficient magnitude may invalidate the user-initiated event with respect to the utterance.


