/**
 * Enum for primary params
 * @readonly
 * @enum {number}
 */
const ParamType = {
    MHP: 0,
    MMA: 1,
    STR: 2,
    INT: 3,
    CON: 4,
    MND: 5,
    PER: 6, //感知
    SPD: 7
}

/**
 * Enum for secondary params
 * @readonly
 * @enum {number}
 */
const SecParamType = {
    ARMOR: 0,
    CRITICAL_CHANCE: 1,
    CRITICAL_DAMAGE: 2
}

class Status {
    /** @type Object */
    _type;

    /** @type number[] */
    _values;

    /** @type Character */
    _owner;

    /**
     * 
     * @param {Object} type
     * @param {Character} owner
     * @param {number[]} values
     */
    constructor(type, owner= undefined, values = (new Array(Object.keys(type).length)).fill(0)) {
        this._type = type;
        this._values = values;
        this._owner = owner;
    }

    get type() { return this._type;}
    get owner() { return this._owner;}

    /**
     * @param {number} index 
     */
    GetValue(index) {
        return this._values[index];
    }

    /**
     * @param {string} name 
     */
    GetValueByName(name) {
        return this._values[this._type[name]];
    }

    /**
     * @param {number} index 
     * @param {number} val 
     */
    SetValue(index, val) {
        this._values[index] = val;
    }

    /**
     * @param {number} index
     * @param {number} val
     */
    AddValue(index, val) {
        this._values[index] += val;
    }

    /**
     * set all values with an array in one time
     * @param {number[]} values 
     */
    SetValues(values) {
        for (let i = 0; i < this._values.length; i++) {
            this._values[i] = values[i];
        }
    }

    /**
     * add all values with an array in one time
     * @param {number[]} values
     */
    AddValues(values) {
        for (let i = 0; i < this._values.length; i++) {
            this._values[i] += (typeof values[i] === 'number'? values[i] : 0);
        }
    }

    Floor() {
        for (let i = 0; i < this._values.length; i++) {
            this._values[i] = Math.floor(this._values[i]);
        }
    }

    Clear() {
        this._values.fill(0);
    }

    /**
     * Change param type (all values will be reset to 0)
     * @param {Object} type 
     */
    ChangeType(type) {
        this._type = type;
        this._values = (new Array(Object.keys(type).length)).fill(0);
    }

    /**
     * check if the status is of the same paramtypes as this, before other operations
     * @param {Status} status 
     */
    CheckTypeIdentity(status) {
        return this.type === status.type;
    }

    /**
     * @param {Status} source 
     */
    Plus(source) {
        if (this.CheckTypeIdentity(source)) {
            for (let i = 0; i < this._values.length; i++) {
                this._values[i] += source.GetValue(i);
            }
        } else {
            throw new Error('Cannot operate on 2 status of different param type');
        }
    }

    /**
     * @param {Status} source 
     */
    Scale(source) {
        if (this.CheckTypeIdentity(source)) {
            for (let i = 0; i < this._values.length; i++) {
                this._values[i] += this.GetValue(i) * source.GetValue(i) / 100;
            }
        } else {
            throw new Error('Cannot operate on 2 status of different param type');
        }
    }
}

/**
 * @typedef {Object} CharTalent
 * @property {string} iname - talent skill iname
 * @property {number} level - talent learned at level
 * */

/**
 * @typedef {Object} CharJSON
 * @property {string} iname - internal name
 * @property {string} name - character name
 * @property {string} model - filename of icon, picture, etc.
 * @property {string} voice - voice file name
 * @property {string} race - related to some racist skills
 * @property {string[]} tags - tags
 * @property {number} wept - weapon type
 * @property {string} wep_model - default weapon model
 * @property {string} wep_slot - default weapon model slot of the spine
 * @property {number} gender - 0:f, 1:m, 2:etc
 * @property {string} profile - profile
 * @property {number[]} iniparam - initial primary params
 * @property {string[]} classes - initial primary params
 * @property {(string|number)[][]} talents - talent table
 * @property {string} joinMsg - message to be shown when joins party
 */

var $dataPLC;
var $dataENC;
 
class Character {
    _iname = '';
    _hp = 1;
    _mana = 0;

    /**
     * @param {string} iname 
     */
    constructor(iname) {
        this._iname = iname;
        this.InitClass();
    }

    //#region basic
    get iname() {return this._iname;}
    /** @returns {CharJSON} */
    get data() { return null;}
    /** @returns {string} */
    get model() { return this.data.model; }
    get voice() { return this.data.voice; }

    get name() { return this.data.name; }
    get race() {return this.data.race;}
    get tags() {return this.data.tags;}
    get gender() {return this.data.gender;}
    get profile() {return this.data.profile;}
    get memory() {return this._memory;}

    IsChanting() {
        return false;
    }

    IsAlive() { return this.hp > 0; }
    isAlive() { return this.IsAlive(); }
    //#endregion

    //#region hp, mana, ct related
    static MAXCP = 200;
    get hp() { return this._hp; }
    get mana() { return this._mana; }
    get cp() { return this._cp; }
    get ct() { return this._ct; }
    get hprate() { return this._hp * 100 / this.mhp;}
    get manarate() { return this._mana * 100 / this.mma;}

    get mhp() { return this.GetParam(ParamType.MHP);}
    get mma() { return this.GetParam(ParamType.MMA);}

    LevelUp() {
        if (this._level < this.MaxLevel) {
            this._level ++;
            this._memory ++;
            this.MarkParamChange();
        }
    }

    ActionCt() {
        return 1000;
    }

    IsCtFull() {
        return this._ct >= this.ActionCt();
    }

    Die() {
        this._hp = 0;
        this.ClearModifiers();
    }

    Revive() {
        if (this._hp === 0) {
            this._hp = 1;
        }
    }

    /**
     * @param {number} val 
     */
    SetHp(val) {
        this._hp = val;
        this.Refresh();
    }

    /**
     * @param {number} val 
     */
    SetMana(val) {
        this._mana = val;
        this.Refresh();
    }

    /**
     * @param {number} val 
     */
    SetCp(val) {
        this._cp = val;
        this.Refresh();
    }

    /**
     * @param {number} val 
     */
    SetCt(val) {
        this._ct = val;
        this.Refresh();
    }

    /**
     * @param {number} val 
     */
    AddHp(val) {
        val = Math.floor(val);
        this.SetHp(this.hp + val);
        this._paramChanged = true;
    }

    /**
     * @param {number} val 
     */
    AddMana(val) {
        val = Math.floor(val);
        this.SetMana(this.mana + val);
        this._paramChanged = true;
    }

    /**
     * @param {number} val 
     */
    AddCp(val) {
        val = Math.floor(val);
        this.SetCp(this.cp + val);
        this._paramChanged = true;
    }

    /**
     * @param {number} val 
     */
    AddCt(val) {
        val = Math.floor(val);
        this.SetCt(this.ct + val);
        this._paramChanged = true;
    }

    /**
     * @param {Modifier.FLAG} flag
     * @returns {boolean}
     */
    HasFlag(flag) {
        return this.allModifiers.some(mod => mod.HasFlag(flag));
    }


    IsImmortal() {
        return this.allModifiers.some(mod =>  mod.HasFlag(Modifier.FLAG.IMMORTALITY));
    }

    GetGutsModifier() {
        return this.acquiredModifiers.find(mod => mod.HasFlag(Modifier.FLAG.GUTS));
    }

    Refresh() {  
        this._hp = Math.min(Math.max(this._hp, 0), this.GetParam(ParamType.MHP));
        this._mana = Math.min(Math.max(this._mana, 0), this.GetParam(ParamType.MMA));
        this._cp = Math.min(Math.max(this._cp, 0), Character.MAXCP);
        this._ct = Math.max(this._ct, 0);
        if (this.hp <= 0) {
            let mod;
            if (this.IsImmortal()) {
                this._hp = 1;
                this.OnGuts(true);
            } else if ((mod = this.GetGutsModifier()) !== undefined) {
                this._hp = 1;
                mod.Stack(-1);
                this.OnGuts(false);
            } else {
                this.Die();
                this.OnDeath();
            }
        }
    }

    FullRecover() {
        this.SetHp(this.GetParam(ParamType.MHP));
        this.SetMana(this.GetParam(ParamType.MMA));
    }
    //#endregion

    //#region param related
    
    /**
     * Home Primary Status 
     * @type Status */
    _homePStatus;
    
    /**
     * Home Secondary Status 
     * @type Status */
    _homeSStatus;
    /**
     * Temp Plus Status 
     * @type Status */
    _tempPlusStatus;
    /**
     * Temp Scale Status 
     * @type Status */
    _tempScaleStatus;
    /**
     * Final Primary Status 
     * @type Status */
    _finalPStatus;
    /**
     * Final Secondary Status 
     * @type Status */
    _finalSStatus;

    InitParam() {
        this._homePStatus = new Status(ParamType, this);
        this._homeSStatus = new Status(SecParamType, this);
        this._tempPlusStatus = new Status(ParamType, this);
        this._tempScaleStatus = new Status(ParamType, this);
        this._finalPStatus = new Status(ParamType, this);
        this._finalSStatus = new Status(SecParamType, this);

        this.CalcLevelStatus();
    }

    CalcLevelStatus() {
        this._homePStatus.Clear();
        this._homeSStatus.Clear();
        this._homePStatus.SetValues(this.data.iniparam);
        this._homeSStatus.Clear();
    }

    /**
     * Calculate passive skill and equipment bonus
     */
    CalcHomeStatus() {
        this._tempPlusStatus.Clear();
        this._tempScaleStatus.Clear();
        for (let mod of this.intrinsicModifiers) {
            this._tempPlusStatus.AddValues(mod.GetPrimaryStatusPlus());
            this._tempScaleStatus.AddValues(mod.GetPrimaryStatusScale());
            this._homeSStatus.AddValues(mod.GetSecondaryStatusPlus());
        }
        this._homePStatus.Plus(this._tempPlusStatus);
        this._homePStatus.Scale(this._tempScaleStatus);
    }

    /**
     * Calculate modifier and environment bonus
     */
    CalcFinalStatus() {
        this._tempPlusStatus.Clear();
        this._tempScaleStatus.Clear();
        for (let mod of this.acquiredModifiers) {
            this._tempPlusStatus.AddValues(mod.GetPrimaryStatusPlus());
            this._tempScaleStatus.AddValues(mod.GetPrimaryStatusScale());
            this._homeSStatus.AddValues(mod.GetSecondaryStatusPlus());
        }
        this._homePStatus.Plus(this._tempPlusStatus);
        this._homePStatus.Scale(this._tempScaleStatus);

        this._finalPStatus.Plus(this._homePStatus);
        this._finalSStatus.Plus(this._homeSStatus);
    }

    RefreshStatus() {
        this._homePStatus.Clear();
        this._homeSStatus.Clear();
        this._finalPStatus.Clear();
        this._finalSStatus.Clear();

        this.CalcLevelStatus();
        this.CalcHomeStatus();
        this.CalcFinalStatus();
        this._finalPStatus.Floor();
        this._finalSStatus.Floor();
    }

    _paramChanged = false;
    MarkParamChange() { this._paramChanged = true; }

    /**
     * Get param value without refresh all params
     * @param {number} index
     * @param {boolean} isSecondary
     *
     * @returns {number}
     */
    GetInstantParam(index, isSecondary = false) {
        if (isSecondary) {
            return this._finalSStatus.GetValue(index);
        } else {
            return this._finalPStatus.GetValue(index);
        }
    }

    /**
     * Get param value by index
     * @param {number} index
     * @param {boolean} isSecondary
     *
     * @returns {number}
     */
    GetParam(index, isSecondary = false) {
        if (this._paramChanged) this.RefreshStatus();
        this._paramChanged = false;
        if (isSecondary) {
            return this._finalSStatus.GetValue(index);
        } else {
            return this._finalPStatus.GetValue(index);
        }
    }

    /**
     * Get param value by name
     * @param {string} name 
     */
    GetParamByName(name) {
        if (this._paramChanged) this.RefreshStatus();
        this._paramChanged = false;

        if (Object.keys(ParamType).includes(name)) {
            return this._finalPStatus.GetValueByName(name);
        } else if (Object.keys(SecParamType).includes(name)) {
            return this._finalSStatus.GetValueByName(name);
        } else {
            throw new Error(`No param name '${name}' found.`);
        }
    }
    //#endregion

    //#region Modifier
    /** @returns Modifier[] */
    get allIntrinsicModifiers() {
        /** @type Modifier[]*/
        let mods = [];
        for (let skill of this.skills) {
            mods = mods.concat(skill.intrinsicModifiers);
        }
        return mods;
    }
    /** @returns Modifier[] */
    get intrinsicModifiers() {
        return this.allIntrinsicModifiers.filter(mod => mod.IsValid());
    }

    /**
     * @param {string} cname
     * @param {Skill} skill
     * @returns {Modifier}
     */
    GetIntrinsicModifier(cname, skill= undefined) {
        return this.allIntrinsicModifiers.find( mod => mod.constructor.name === cname && ((!skill)||mod.skill.iname===skill.iname));
    }

    /**
     * acquired modifiers
     * @type Modifier[] */
    _modifiers = [];
    get allAcquiredModifiers() { return this._modifiers;}
    /** @type Modifier[] */
    get acquiredModifiers() { return this.allAcquiredModifiers.filter(mod => mod.IsValid()); }
    /** @type Modifier[] */
    get validModifiers() { return this.intrinsicModifiers.concat(this.acquiredModifiers); }
    /** @type Modifier[] */
    get allModifiers() { return this.allIntrinsicModifiers.concat(this.allAcquiredModifiers); }

    ClearModifiers() {
        this._modifiers = [];
        this.MarkParamChange();
    }

    /**
     * @param {string} cname
     * @param {Skill} skill
     * @returns {boolean}
     */
    HasAcquiredModifier(cname, skill = undefined) {
        return this.allAcquiredModifiers.some(mod => mod.constructor.name === cname && ((!skill)||mod.skill.iname===skill.iname))
    }
    /**
     * @param {string} cname
     * @param {Skill} skill
     * @returns {Modifier}
     */
    GetAcquiredModifier(cname, skill= undefined) {
        return this.allAcquiredModifiers.find( mod => mod.constructor.name === cname && ((!skill)||mod.skill.iname===skill.iname));
    }

    /**
     * @param  {Modifier} mod
     */
    AcquireModifier(mod) {
        this._modifiers.push(mod);
        this.MarkParamChange();
        this.OnAcquireModifier(mod);
    }

    /**
     * @param  {Modifier} mod
     */
    RemoveModifier(mod) {
        if (this.HasAcquiredModifier(mod.constructor.name, mod.skill)) {
            this.OnRemoveModifier(mod);
            this._modifiers.remove(mod);
            this.MarkParamChange();
        }

    }
    //#endregion

    /** @type Class */
    _class;
    get currentClass() {return this._class;}
    /** @type Class[]*/
    _unlockClasses = [];
    get unlockClasses() {return this._unlockClasses;}

    InitClass() {
        this._class = this.UnlockClass(this.data.classes[0]);
    }

    GetClassRank(iname = '') {
        const c = this.unlockClasses.find(c => c.iname===iname);
        if (c) return c.rank;
        else return 0;
    }

    UnlockClass(iname) {
        if (this.GetClassRank(iname) === 0) {
            const c = new Class(iname);
            c.RankUp();
            this._unlockClasses.push(c);
            return c;
        }
        return undefined;
    }

    //#region skill
    /** @type Skill[] */
    _talents = [];
    /** @type Skill[] */
    _freeSkills = [];
    /** @type Skill[] */
    _equippedActiveSkills = [];
    /** @type Skill[] */
    _equippedPassiveSkills = [];

    get classActives() {return this.currentClass.fixedSkills;}

    get allSkills() {return this._talents.concat(this.classActives, this._freeSkills);}
    /**
     * 生效中的技能
     * @returns {Skill[]} */
    get skills() { return this._talents.concat(this.classActives, this._equippedActiveSkills, this._equippedPassiveSkills);}

    /** 生效中的被动技能 
     * @returns {Skill[]} */
    get passiveSkills() {
        return this.skills.filter(s => s.IsPassive());
    }

    /** @returns {Skill[]} */
    get activeSkills() {
        return this.skills.filter(s => !s.IsPassive());
    }

    /**
     * @param {string} iname
     * @returns {boolean}
     */
    HasSkill(iname) {
        return this._freeSkills.some(sk => sk.iname === iname);
    }

    /**
     * @param {string} iname
     * @returns {boolean}
     */
    CanLearnSkill(iname) {
        return !this.HasSkill(iname);
    }

    /**
     * @param {string} iname
     * @param {boolean} isTalent
     */
    LearnSkill(iname, isTalent) {
        if (this.CanLearnSkill(iname)) {
            const data = $dataSkills[iname];
            let cla = eval(data.script);
            /** @type Skill */
            const skill = new cla(iname, this);
            if (isTalent) {
                this._talents.push(skill);
            } else {
                this._freeSkills.push(skill);
            }
            return skill;
        }
        return undefined;
    }

    /**
     * @param {Skill} sk
     */
    EquipSkill(sk) {
        sk.Equip(true);
        this.MarkParamChange();
    }

    /**
     * @param {Skill} sk
     */
    UnequipSkill(sk) {
        sk.Equip(false);
        this.MarkParamChange();
    }
    //#endregion

    //#region Battle events
    /**
     * @returns {CharSet}
     */
    AllySet() {
        return this instanceof PlayerChar?$gameParty:$gameTroop;
    }

    /**
     * @returns {CharSet}
     */
    EnemySet() {
        return this instanceof PlayerChar?$gameTroop:$gameParty;
    }

    _turn = 0;
    get turnCount() {return this._turn;}
    OnBattleStart() {
        this._turn = 0;
        this.SetCt(0);
        this.validModifiers.forEach(mod => mod.OnBattleStart());
    }

    OnBattleEnd() {
        this.validModifiers.forEach(mod => mod.OnBattleEnd());
        const mods = this.allAcquiredModifiers;
        for (let i = mods.length - 1; i >=0; i--) {
            mods[i].Remove();
        }
    }

    OnTurnStart() {
        this._turn ++;
        this.AddCp(this.GetParam(SecParamType.CP_AUTO_REGEN, true) + 5);
        const mods = this.validModifiers;
        for (let i = mods.length - 1; i >=0; i--) {
            mods[i].OnTurnStart();
        }
    }

    /**
     * @param {Action} action
     */
    OnActionEnd(action) {
        action._skill.OnSkillEnd();
        const mods = this.validModifiers;
        for (let i = mods.length - 1; i >=0; i--) {
            mods[i].OnActionEnd(action);
        }
    }

    /**
     * @param {Damage} damage
     */
    OnBeforeTakeDamage(damage) {
        const mods = this.validModifiers;
        for (let i = mods.length - 1; i >=0; i--) {
            mods[i].OnBeforeTakeDamage(damage);
        }
    }

    /**
     * @param {Damage} damage
     */
    OnTakeDamage(damage) {
        if(damage.absValue > this.mhp * 0.1) AudioManager.PlayDamaged(this.voice, damage.absValue > this.mhp * 0.5);
        this.controller.SetDamageAnimation();
        const mods = this.validModifiers;
        for (let i = mods.length - 1; i >=0; i--) {
            mods[i].OnTakeDamage(damage);
        }
        this.AddCp(5 + 30 * damage.absValue / this.mhp);
    }

    /**
     * @param {Damage} damage
     */
    OnTakeHealing(damage) {
        if(damage.source !== this) AudioManager.PlayHealed(this.voice);
        const mods = this.validModifiers;
        for (let i = mods.length - 1; i >=0; i--) {
            mods[i].OnTakeHealing(damage);
        }
    }

    /**
     * @param {Damage} damage
     */
    OnDealDamage(damage) {
        const mods = this.validModifiers;
        for (let i = mods.length - 1; i >=0; i--) {
            mods[i].OnDealDamage(damage);
        }
    }

    /**
     * @param {Damage} damage
     */
    OnBeforeDealDamage(damage) {
        const mods = this.validModifiers;
        for (let i = mods.length - 1; i >=0; i--) {
            mods[i].OnBeforeDealDamage(damage);
        }
    }

    /**
     * @param {Damage} damage
     */
    OnDealHealing(damage) {
        const mods = this.validModifiers;
        for (let i = mods.length - 1; i >=0; i--) {
            mods[i].OnDealHealing(damage);
        }
    }

    /**
     * @param {Damage} damage
     */
    OnDefPiercing(damage) {
        const mods = this.validModifiers;
        for (let i = mods.length - 1; i >=0; i--) {
            mods[i].OnDefPiercing(damage);
        }
    }

    /**
     * @param {boolean} IsImmortalGuts - guts trigger buy immortality > true; by gtus > false
     */
    OnGuts(IsImmortalGuts) {
        const mods = this.validModifiers;
        for (let i = mods.length - 1; i >=0; i--) {
            mods[i].OnGuts(IsImmortalGuts);
        }
    }

    OnDeath() {
        AudioManager.PlayDeath(this.voice);
    }
    /**
     * @param {Modifier} mod
     */
    OnAcquireModifier(mod) {

    }
    /**
     * @param {Modifier} mod
     */
    OnRemoveModifier(mod) {
        mod.OnRemove();
    }
    //#endregion

    //#region Sprite
    _selected = false;
    isSelected() {
        return this._selected;
    }
    _damagePopup;
    isDamagePopupRequested() {
        return this._damagePopup;
    }

    _effectType;
    isEffectRequested() {
        return !!this._effectType;
    }

    /** @type PIXI.spine.Spine */
    _sprite;
    /** @type BtlSprCtrl */
    _controller;

    SetBattleSprite(sprite) {
        this._sprite = sprite;
        this._controller = sprite.controller;
    }

    ClearBattleSprite() {
        this._sprite = undefined;
        this._controller = undefined;
    }
    /** @returns {PIXI.spine.Spine} */
    get battleSprite() { return this._sprite;}
    /** @returns {BtlSprCtrl} */
    get controller() { return this._controller;}
    //#endregion
}

class PlayerChar extends Character {
    /**
     * @param {string} iname 
     */
    constructor(iname) {
        super(iname);
        this.InitParam();
        this.InitSkills();
        this.RefreshStatus();
        this.FullRecover();
    }

    /** @returns {CharJSON} */
    get data() { return $dataPLC[this._iname];}

    get weapon_model() {
        if (this.weapon && this.weapon.model) {
            return this.weapon.model;
        } else {
            return this.data.wep_model;
        }
    }
    get weapon_slot() {
        return this.data.wep_slot;
    }

    /**
     * 自由属性点
     * @type number */
    _statusPoints = 0;
     /**
     * Added Primary Status (属性加点)
     * @type Status */
    _addedPStatus;
     InitParam() {
        this._homePStatus = new Status(ParamType, this);
        this._addedPStatus = new Status(ParamType, this);
        this._homeSStatus = new Status(SecParamType, this);
        this._tempPlusStatus = new Status(ParamType, this);
        this._tempScaleStatus = new Status(ParamType, this);
        this._finalPStatus = new Status(ParamType, this);
        this._finalSStatus = new Status(SecParamType, this);

        this.CalcLevelStatus();
    }

    CalcLevelStatus() {
        this._homePStatus.Clear();
        this._homeSStatus.Clear();
        this._homePStatus.SetValues(this.data.iniparam);
        this._homePStatus.Plus(this._addedPStatus);
        this._homeSStatus.Clear();
    }

    InitSkills() {
        // this.LearnTalentSkill('SK_WAIT');
        // this.LearnTalentSkill(this.data.attack);
        // for (const t of this.data.talents) {
        //     if(t.level <= this.level) {
        //         this.LearnTalentSkill(t.iname);
        //     }
        // }
    }


    //#region Skill
    /**
     * @returns {Skill[]}
     */
    GetSkillsGrantedByEquips() {
        let sks = [];
        for (const eq of this.noEmptyEquips) {
            for (let sk of eq.skills) {
                sks.push(sk);
            }
        }
        return sks;
    }

    get skills() {
        return super.skills.concat(this.GetSkillsGrantedByEquips());
    }

    get nonEquipSkills() {
        return super.skills;
    }
    //#endregion

    //#region Sprite
    /** @type BattleCharFace */
    _battleFace;
    /** @param {BattleCharFace} face */
    SetBattleFace(face) {
        this._battleFace = face;
    }
    ClearBattleFace() {
        this._battleFace = undefined;
    }
    /** @returns {BattleCharFace} */
    get battleFace() {return this._battleFace;}
    //#endregion

    //#region Equips
    /** @type Equip[] */
    _equips = [null, null, null, null];
    get equips() {return this._equips;}
    get noEmptyEquips() {return this.equips.filter(e => e !== null);}
    get weapon() {return this._equips[0];}

    /**
     * @param {Equip} it
     * @param {number} slot
     * @returns {boolean}
     */
    CanEquip(it, slot) {
        return ((it.slot === slot) || (it.slot===2&&slot>=2));
    }
    /**
     * @param {Equip} eq
     * @param {number} slot
     */
    EquipItem(eq, slot) {
        if (this.CanEquip(eq, slot)) {
            if (this._equips[slot]) this.RemoveEquipBySlot(slot);
            if (eq.IsEquipped()) eq.equippingChr.RemoveEquipByObject(eq);
            this._equips[slot] = eq;
            eq.OnEquipped(this);
            this.MarkParamChange();
        }
    }

    /** @param {number} slot */
    RemoveEquipBySlot(slot) {
        if (this._equips[slot]) {
            this._equips[slot].OnRemoved();
            this._equips[slot] = null;
            this.MarkParamChange();
        }
    }
    /** @param {Equip} eq */
    RemoveEquipByObject(eq) {
        if (this._equips.includes(eq)) {
            eq.OnRemoved();
            this._equips[this._equips.indexOf(eq)] = null;
            this.MarkParamChange();
        }
    }
    //#endregion

    OnDeath() {
        super.OnDeath();
        this.controller.SetDeathAnimation();
    }

    OnBattleEnd() {
        super.OnBattleEnd();
        this.ClearBattleFace();
        this.controller.SetVictoryAnimation();
    }
}

class EnemyChar extends Character {
    /**
     * @param {string} iname
     * @param {number} level
     */
    constructor(iname, level) {
        super(iname);
        this.InitParam();
        this.InitSkills();
        this.RefreshStatus();
        this.FullRecover();
    }

    /** @returns {CharJSON} */
    get data() { return $dataENC[this._iname];}
    get skills() { return this._learnedSkills;}

    _ai = 'Normal';
    get ai() {return this._ai;}
    /** @param {string} ai */
    SetAi(ai) {
        this._ai = ai;
    }

    _aiFlags = {};
    get aiFlags() { return this._aiFlags;}

    /**
     * @param {string} name
     * @param {number} n
     */
    SetAiFlag(name, n) {
        this._aiFlags[name] = n;
    }


    InitSkills() {
        // for (let sk of this.data.skills) {
        //     this._ForceLearnSkill(sk);
        // }
    }

    //#region param related
    //#endregion

    //#region AI
    DecideAction() {
        if (this.ai) {
            eval('AI.' + this.ai)(this);
        } else {
            AI.Normal(this);
        }
    }
    //#endregion

    //#region Battle Events
    OnDeath() {
        super.OnDeath();
        this.controller.StartDisappear();
    }
    //#endregion

    //#region Sprite
    _x = 0;
    _y = 0;
    SetSpritePos(x, y) {
        this._x = x;
        this._y = y;
    }
    get screenX() { return this._x;}
    get screenY() { return this._y;}



    isHidden() { return false;}
    //#endregion
}


/**
 * @typedef {Object} ClassJson
 * @property {string} name - class name
 * @property {string} expr - class basic description
 * @property {string} icon - skill icon name
 * @property {string[]} fixed_skills - fixed skills
 * @property {number[]} fixed_skill_ranks - fixed skill unlock ranks
 * @property {string[]} free_skills - free skills
 * @property {number[]} free_skill_ranks - free skill unlock ranks
 */
/** @type ClassJson[] */
var $dataClasses;
class Class {
    
    /**
     * @param {string} iname 
     */
    constructor(iname) {
        this._iname = iname;
    }

    static MaxRank = 5;

    _iname = '';
    _rank = 0;
    get iname() {return this._iname;} 
    get data() {return $dataClasses[this.iname];}
    get rank() {return this._rank;}

    _fixedSkills = [];
    _freeSkills = [];
    get fixedSkills() {return this._fixedSkills;}
    get freeSkills() {return this._freeSkills;}

    RankUp() {
        if (this._rank < Class.MaxRank) {
            this._rank ++;
            for(let i = 0; i< this.data.free_skill_ranks.length; i++) {
                if (this.data.free_skill_ranks[i] == this._rank) {
                    const data = $dataSkills[this.data.free_skills[i]];
                    const cla = eval(data.script);
                    /** @type Skill */
                    const skill = new cla(this.data.free_skills[i]);
                    this._freeSkills.push(skill);
                }
            }
            for(let i = 0; i< this.data.fixed_skill_ranks.length; i++) {
                if (this.data.fixed_skill_ranks[i] == this._rank) {
                    const data = $dataSkills[this.data.fixed_skills[i]];
                    const cla = eval(data.script);
                    /** @type Skill */
                    const skill = new cla(this.data.fixed_skills[i]);
                    this._fixedSkills.push(skill);
                }
            }
        }
    }
}