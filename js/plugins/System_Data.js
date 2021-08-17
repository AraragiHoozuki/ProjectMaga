class DataUtils {
    /** @type PIXI.Loader[] */
    static _pool = [PIXI.Loader.shared];

    static Load(path, options={}) {
        return new Promise((resolve, reject)=> {
            if (PIXI.Loader.shared.resources[path]) {
                resolve(PIXI.Loader.shared.resources[path]);
            } else {
                const loader = DataUtils.FirstAvailLoader();
                loader.add(path, path, options).load((loader, res) => {
                    if (!PIXI.Loader.shared.resources[path]) PIXI.Loader.shared.resources[path] = res[path];
                    resolve(res[path]);
                });
            }
        });
    }

    /**
     * 
     * @param {string[]} paths 
     * @param {Object} options 
     * @returns 
     */
    static LoadMulti(paths, options = {}) {
        return new Promise((resolve, reject)=> {
            if (paths.every(p => PIXI.Loader.shared.resources[p]!== undefined)) {
                resolve(paths.map(p=>PIXI.Loader.shared.resources[p]));
            } else {
                const loader = DataUtils.FirstAvailLoader();
                const arr = [];
                for(const p of paths) {
                    if (PIXI.Loader.shared.resources[p] === undefined) {
                        loader.add(p, p, options);
                        arr.push(p);
                    }
                }
                loader.load((ld, res)=> {
                    for (const p of arr) {
                        PIXI.Loader.shared.resources[p] = res[p];
                    }
                    resolve(paths.map(p=>PIXI.Loader.shared.resources[p]));
                });
            }
        });
    }

    static FirstAvailLoader() {
        let ld = this._pool.find((loader)=>loader.loading === false);
        if (ld === undefined) {
            ld = new PIXI.Loader();
            DataUtils._pool.push(ld);
        }
        return ld
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

ImageManager.LoadBitmapAsync = function(folder, filename) {
    return new Promise((resolve, reject)=> {
        const b = this.loadBitmap(folder, filename);
        b.addLoadListener(() => resolve(b));
    });
};

/**
 * 
 * @param {string} folder 
 * @param {string} filename
 * @returns {Bitmap} 
 */
 ImageManager.LoadUIBitmap = function(folder = 'img/ui/', filename) {
    return ImageManager.loadBitmap(folder, filename);
};

Array.prototype.randomChoice = function() {
    return this[Math.randomInt(this.length)];
}

const ImagePreLoadPathPrefix = '';
Scene_Boot.prototype.loadSystemImages = function() {
    ColorManager.loadWindowskin();
    ImageManager.loadSystem("IconSet");

    const fs = require('fs');
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
