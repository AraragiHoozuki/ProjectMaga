const $fs = require('fs');

class DataUtils {
    static Load(path, options={}) {
        return new Promise((resolve, reject)=> {
            if (PIXI.Loader.shared.resources[path]) {
                resolve(PIXI.Loader.shared.resources[path]);
            } else {
                PIXI.Loader.shared.add(path, path, options).load((loader, res) => {
                    resolve(res[path]);
                });
            }
        });
    }
}

ImageManager.loadBitmapWithExt = function(folder, filename) {
    if (filename) {
        const url = folder + Utils.encodeURI(filename);
        return this.loadBitmapFromUrl(url);
    } else {
        return this._emptyBitmap;
    }
};

Array.prototype.randomChoice = function() {
    return this[Math.randomInt(this.length)];
}

const ImagePreLoadPathPrefix = '';
Scene_Boot.prototype.loadSystemImages = function() {
    ColorManager.loadWindowskin();
    ImageManager.loadSystem("IconSet");

    const fs = $fs;
    let files;

    files = fs.readdirSync(ImagePreLoadPathPrefix + 'img/ui/');
    files.forEach(function(path) {
        if (path.endsWith('.png')) {
            ImageManager.loadBitmapWithExt('img/ui/', path, 0 , true);
        }
    });

    files = fs.readdirSync(ImagePreLoadPathPrefix + 'img/icons/skill/');
    files.forEach(function(path) {
        if (path.endsWith('.png')) {
            ImageManager.loadBitmapWithExt('img/icons/skill/', path, 0 , true);
        }
    });

    files = fs.readdirSync(ImagePreLoadPathPrefix + 'img/icons/item/');
    files.forEach(function(path) {
        if (path.endsWith('.png')) {
            ImageManager.loadBitmapWithExt('img/icons/item/', path, 0 , true);
        }
    });

    files = fs.readdirSync(ImagePreLoadPathPrefix + 'img/faces/');
    files.forEach(function(path) {
        if (path.endsWith('.png')) {
            ImageManager.loadBitmapWithExt('img/faces/', path, 0 , true);
        }
    });

    files = fs.readdirSync(ImagePreLoadPathPrefix + 'img/taties/');
    files.forEach(function(path) {
        if (path.endsWith('.png')) {
            ImageManager.loadBitmapWithExt('img/taties/', path, 0 , true);
        }
    });

    AudioManager.LoadVoices(fs, ImagePreLoadPathPrefix + 'audio/voice/');
};

Math.ProbCheck = function(p, luck = 0, scale = 1) {
    luck *= scale;
    return Math.randomInt(100) <= p + p * luck/300 + Math.sqrt(luck);
};


/** @type Party */
var $gameParty;
/** @type EnemySet */
var $gameTroop;


DataManager.createGameObjects = function() {
    $gameTemp = new Game_Temp();
    $gameSystem = new Game_System();
    $gameScreen = new Game_Screen();
    $gameTimer = new Game_Timer();
    $gameMessage = new Game_Message();
    $gameSwitches = new Game_Switches();
    $gameVariables = new Game_Variables();
    $gameSelfSwitches = new Game_SelfSwitches();
    $gameActors = new Game_Actors();
    $gameParty = new Party();
    $gameTroop = new EnemySet();
    $gameMap = new Game_Map();
    //$gamePlayer = new Game_Player();
};

DataManager.setupNewGame = function() {
    this.createGameObjects();
    this.selectSavefileForNewGame();
    $gameParty.GameStart();
    Graphics.frameCount = 0;
};

DataManager.makeSavefileInfo = function() {
    const info = {};
    info.title = $dataSystem.gameTitle;
    info.playtime = $gameSystem.playtimeText();
    info.timestamp = Date.now();
    return info;
};

DataManager.extractSaveContents = function(contents) {
    $gameSystem = contents.system;
    $gameScreen = contents.screen;
    $gameTimer = contents.timer;
    $gameSwitches = contents.switches;
    $gameVariables = contents.variables;
    $gameSelfSwitches = contents.selfSwitches;
    $gameActors = contents.actors;
    $gameParty = contents.party;
    $gameMap = contents.map;
    $gamePlayer = contents.player;

    for (const chr of $gameParty.members) {
        chr.InitParam();
        chr.RefreshStatus();
    }
};

DataManager.correctDataErrors = function() {
    //$gameParty.removeInvalidMembers();
};

DataManager.isDatabaseLoaded = function() {
    this.checkError();
    for (const databaseFile of this._databaseFiles) {
        if (!window[databaseFile.name]) {
            return false;
        }
    }

    //Automatically add kakeras;
    for(let key of Object.keys($dataPLC)) {
        if (key !== '$schema') {
            $dataItems[`IT_KAKERA_${key}`] = {
                iname: `IT_KAKERA_${key}`,
                name: `记忆碎片·${$dataPLC[key].name}`,
                icon: 'kakera_rare',
                description: '用来提升对应角色的技能等级',
                type: 1,
                slot: 0,
                wept: 0,
                skills: []
            }
        }
    }

    return true;
};
