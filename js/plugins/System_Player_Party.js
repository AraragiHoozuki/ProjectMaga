class CharSet {
    constructor() {

    }

    /** @returns {Character[]} */
    get members() { return []; }
    /** @returns {Character[]} */
    get battleMembers() {return [];}

    /**
     * @param {string} param_name
     * @param {Character} exclude
     */
    MaxParamByName(param_name, exclude= undefined) {
        let list = this.battleMembers.filter(chr=>chr.IsAlive());
        if (exclude !== undefined) list.remove(exclude);
        if (list.length < 1) return undefined;
        let max = list[0];
        for (const chr of list) {
            if (param_name === 'hprate') {
                if (chr.hprate > max.hprate) {
                    max = chr;
                }
            } else {
                if (chr.GetParamByName(param_name) > max.GetParamByName(param_name)) {
                    max = chr;
                }
            }
        }
        return max;
    }

    /**
     * @param {string} param_name
     * @param {Character} exclude
     */
    MinParamByName(param_name, exclude = undefined) {
        let list = this.battleMembers.filter(chr=>chr.IsAlive());
        if (exclude !== undefined) list.remove(exclude);
        if (list.length < 1) return undefined;
        let min = list[0];
        for (const chr of list) {
            if (param_name === 'hprate') {
                if (chr.hprate < min.hprate) {
                    min = chr;
                }
            } else {
                if (chr.GetParamByName(param_name) < min.GetParamByName(param_name)) {
                    min = chr;
                }
            }
        }
        return min;
    }

    OnBattleStart() {
        this.battleMembers.forEach(char => char.OnBattleStart());
    }

    OnBattleEnd() {
        this.battleMembers.forEach(chr => chr.OnBattleEnd());
    }
}
/** Party */
var $gameParty;
class Party extends CharSet {
    /** @type Item[] */
    _items = [];
    /** @type PlayerChar[] */
    _members = [];
    constructor() {
        super();
    }

    static BattleMemberCount = 4;

    /** @returns {PlayerChar[]} */
    get members() { return this._members;}
    /** @returns {PlayerChar[]} */
    get battleMembers() { return this.members.slice(0, 4);}

    IsAllDead() {
        return this.battleMembers.every(c => !c.IsAlive())
    }



    /**
     * no real usage, only for compatibility of built-in codes
     * @returns {boolean}
     */
    inBattle() {
        return false;
    }


    /**
     * @param {string} iname
     * @returns {PlayerChar}
     */
    MemberJoin(iname) {
        let ch = new PlayerChar(iname);
        this._members.push(ch);
        if (ch.data.joinMsg) {
            toast(ch.data.joinMsg, Colors.Indigo);
        } else {
            toast(`${ch.name}加入了队伍`, Colors.Indigo);
        }
        return ch;
    }

    GameStart() {
        this.MemberJoin('PLC_TYRFINGR');
        this.GetArk('ARK_SWORD_AND_SHIELD');
        //this.GetItem('IT_WP_AHURAMAZDA_STAFF', 1);
        //this.GetItem('IT_KAKERA_PLC_ROSELIA', 999);
    }

    //#region Stages
    /** @type string[] */
    _clearedStages = [];
    /** @type string[] */
    _unlockedLocations = ['LM_PRIME_CASTLE'];

    get clearedStages() {return this._clearedStages;}
    get unlockedLocations() {return this._unlockedLocations;}

    IsStageCleared(iname) {
        return this._clearedStages.includes(iname);
    }
    ClearStage(iname) {
        if (!this.IsStageCleared(iname)) {
            this._clearedStages.push(iname);
            if ($dataStages[iname].unlock_location) {
                this.UnlockLocation($dataStages[iname].unlock_location);
            }
        }
    }
    IsStageAccessible(iname) {
        if (this.IsStageCleared(iname)) {
            return !$dataStages[iname].onetime;
        } else {
            return $dataStages[iname].previous_stages.every(i => this.IsStageCleared(i));
        }
    }
    IsLocationUnlocked(iname) {
        return this._unlockedLocations.includes(iname);
    }
    UnlockLocation(iname) {
        if (!this.IsLocationUnlocked(iname)) {
            this._unlockedLocations.push(iname);
        }
    }
    /** @type Stage */
    _currentStage;
    /** @type string[] */
    _pendingBattles = [];

    /**
     * @param {Stage} stg
     */
    StartStage(stg) {
        this._currentStage = stg;
        this._pendingBattles = stg.battles.clone();
        this.ConcludeBattle();
    }

    ConcludeBattle() {
        let iname = this._pendingBattles.shift();
        if (iname) {
            BattleFlow.BeginBattle(iname);
        } else {
            this.ClearStage(this._currentStage.iname);
            this.FullRecover();
            if(this._currentStage.joins) {
                for (iname of this._currentStage.joins) {
                    $gameParty.MemberJoin(iname);
                }
            }
            if (!(SceneManager._scene instanceof MainScene)) SceneManager.goto(MainScene);
            this._currentStage = undefined;
            $gameParty.ClearBattleSprite();
            DataManager.saveGame(0);
        }
    }
    //#endregion

    //#region Items
    /** @returns {Item[]} */
    get items() { return this._items;}

    get equips() {return this.items.filter(it => it.IsEquip());}

    /**
     * @param {string} iname
     * @param {number} num
     * @constructor
     */
    GetItem(iname, num = 1) {
        if ($dataItems[iname].type === Item.Type.EQUIP) {
            for (let i = 0; i < num; i++) {
                this._items.push(new Equip(iname));
            }
        } else {
            let it = this.items.find(i => i.iname === iname);
            if (!it) {
                it = new Item(iname);
                this._items.push(it);
            }
            it.Add(num);
            if (it.amount <= 0) {
                this._items.remove(it);
            }
        }
    }

    ItemAmount(iname) {
        let it = this.items.find(it => it.iname === iname);
        if (it) {
            return it.amount;
        } else {
            return 0;
        }
    }
    /** @type Ark[] */
    _arks = [];
    get arks() {return this._arks;}

    GetArk(iname) {
        this._arks.push(new Ark(iname));
    }
    //#endregion

    FullRecover() {
        for (let chr of this.members) {
            chr.FullRecover();
        }
    }

    ClearBattleSprite() {
        for (const chr of this.members) {
            chr.ClearBattleSprite(undefined);
        }
    }

    OnBattleStart() {
        super.OnBattleStart();
        let chr = this.battleMembers[Math.floor(Math.random() * this.battleMembers.length)];
        AudioManager.PlayEncounter(chr.voice);
    }

    OnBattleEnd() {
        super.OnBattleEnd();
        let chr = this.battleMembers.randomChoice();
        AudioManager.PlayWin(chr.voice, chr.hprate <= 25);
    }
}

/**
 * @typedef {Object} TroopJson
 * @property {string} iname - internal name
 * @property {EnemySetting[]} enemies - enemies of the troop
 * @property {EnemyDrop[]} drops - item drop info
 * @property {string} bgm - bgm
 * @property {string} btl_back1 - background image
 * @property {string} btl_back2 - background image
 */

/**
 * @typedef {Object} EnemySetting
 * @property {string} iname - internal name
 * @property {number} level - level
 * @property {string} ai - ai func

 */

/**
 * @typedef {Object} EnemyDrop
 * @property {string} iname
 * @property {number} amount
 * @property {number} probability
 */

/** @type TroopJson[] */
var $dataEnemySets;

class EnemySet extends CharSet {
    /** @type EnemyChar[] */
    _members = [];
    _iname = '';

    constructor() {
        super();
    }
    /** @returns TroopJson */
    get data() { return $dataEnemySets[this._iname]; }

    /** @returns {EnemyChar[]} */
    get members() { return this._members;}
    get battleMembers() { return this._members;}
    get drops() {return this.data.drops;}
    get bgm() {return this.data.bgm || null;}
    get back1() {return this.data.btl_back1;}
    get back2() {return this.data.btl_back2;}

    IsAllDead() {
        return this.members.every(c => !c.IsAlive())
    }

    /**
     * @param {string} iname
     */
    Setup(iname) {
        this._iname = iname;
        this._members = [];
        this.data.enemies.forEach(es => {
            let e = new EnemyChar(es.iname, es.level);
            e.SetAi(es.ai);
            this._members.push(e);
        })
    }
}