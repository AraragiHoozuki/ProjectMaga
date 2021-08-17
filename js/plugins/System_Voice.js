AudioManager.createBuffer = function(folder, name) {
    let ext = this.audioFileExt(); // .ogg
    const $fs = require('fs');
    if (!$fs.existsSync(this._path + folder + name + ext)) {
        ext = '.wav';
    }
    const url = this._path + folder + Utils.encodeURI(name) + ext;
    const buffer = new WebAudio(url);
    buffer.name = name;
    buffer.frameCount = Graphics.frameCount;
    return buffer;
};


AudioManager.PlaySe = function(name) {
    AudioManager.playSe({
        name: name,
        pitch: 100,
        volume: 200
    });
};

/** @type string[] */
AudioManager._voicefiles = [];
AudioManager.LoadVoices = function(fs, path) {
    let files = fs.readdirSync(path);
    AudioManager._voicefiles = files.filter(f => f.endsWith('.ogg'));
};

AudioManager.VoiceExistsQ = function(name) {
    return AudioManager._voicefiles.includes(name + '.ogg');
};

AudioManager.PlayVoice = function(name) {
    let vo = {};
    vo.name = name;
    vo.pitch = 100;
    vo.volume = 200;
    if (vo.name) {
        AudioManager._seBuffers = AudioManager._seBuffers.filter(function(audio) {
            return audio.isPlaying();
        });
        let buffer = AudioManager.createBuffer('voice/', vo.name);
        AudioManager.updateSeParameters(buffer, vo);
        buffer.play(false);
        AudioManager._seBuffers.push(buffer);
    }
};

/**
 *
 * @param {string} model
 * @param {string} event
 * @param {number} index
 */
AudioManager.PlaySpecifiedVoice = function(model, event, index = 1) {
    let name = `voice_${model}_${event}${index}`;
    if (AudioManager.VoiceExistsQ(name)) {
        AudioManager.PlayVoice(name);
    } else {
        console.log(`tried to play voice ${name}.ogg but file not exists!`);
    }
}

/**
 *
 * @param {string} model
 * @param {string} event
 */
AudioManager.PlayRandomVoice = function(model, event) {
    let name = `voice_${model}_${event}`;
    let voices = AudioManager._voicefiles.filter(f => f.startsWith(name));
    if (voices.length > 0) {
        name = voices[Math.floor(Math.random() * voices.length)];
        name = name.substring(0, name.lastIndexOf("."));
        AudioManager.PlayVoice(name);
    } else {
        console.log(`tried to play a random voice with ${name}, but file not exists!`);
    }
}

/**
 * @param {string} model
 */
AudioManager.PlayEncounter = function(model) {
    AudioManager.PlayRandomVoice(model, 'encounter');
}
/**
 * @param {string} model
 */
AudioManager.PlayAttack = function(model) {
    AudioManager.PlayRandomVoice(model, 'attack');
}

/**
 * @param {string} model
 * @param {boolean} IsBarely
 */
AudioManager.PlayWin= function(model, IsBarely = false) {
    if (IsBarely) {
        AudioManager.PlayRandomVoice(model, 'win_barely');
    } else {
        AudioManager.PlayRandomVoice(model, 'win');
    }
}

/**
 * @param {string} model
 * @param {boolean} IsBig
 */
AudioManager.PlayDamaged = function(model, IsBig = false) {
    if (IsBig) {
        AudioManager.PlayRandomVoice(model, 'damaged_big');
    } else {
        AudioManager.PlayRandomVoice(model, 'damaged');
    }
}

/**
 * @param {string} model
 */
AudioManager.PlayHealed = function(model) {
    AudioManager.PlayRandomVoice(model, 'healed');
}

/**
 * @param {string} model
 */
AudioManager.PlayDeath = function(model) {
    AudioManager.PlayRandomVoice(model, 'retire');
}

/**
 * @param {string} model
 * @param {string} event
 */
AudioManager.PlayUnique = function(model, event) {
    AudioManager.PlayRandomVoice(model, event);
}


