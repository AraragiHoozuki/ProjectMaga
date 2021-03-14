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
    DEF: 4,
    MND: 5,
    SPD: 6,
    LUK: 7
}

/**
 * Enum for secondary params
 * @readonly
 * @enum {number}
 */
const SecParamType = {
    ASSIST_PYRO: 0,
    ASSIST_HYDRO: 1,
    ASSIST_AIR: 2,
    ASSIST_GEO: 3,
    ASSIST_NECRO: 4,
    ASSIST_DIVINE: 5,
    ASSIST_SOURCE: 6,
    RESIST_PYRO: 7,
    RESIST_HYDRO: 8,
    RESIST_AIR: 9,
    RESIST_GEO: 10,
    RESIST_NECRO: 11,
    RESIST_DIVINE: 12,
    RESIST_SOURCE: 13,

    ASSIST_SLASH: 14,
    ASSIST_PIERCE: 15,
    ASSIST_BLOW: 16,
    ASSIST_MAGIC: 17,
    RESIST_SLASH: 18,
    RESIST_PIERCE: 19,
    RESIST_BLOW: 20,
    RESIST_MAGIC: 21,

    CRITICAL_CHANCE: 22,
    CRITICAL_DAMAGE: 23,
    ASSIST_HEAL: 24,
    RESIST_HEAL: 25,
    ASSIST_PHYSICAL: 26,
    RESIST_PHYSICAL: 27,
    ASSIST_MAGICAL: 28,
    RESIST_MAGICAL: 29,

    CP_AUTO_REGEN: 30
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
        this._values = this._values.map(v => Math.floor(v));
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
 * @typedef {Object} CharJSON
 * @property {string} iname - internal name
 * @property {string} name - character name
 * @property {string} model - filename of icon, picture, etc.
 * @property {string} voice - voice file name
 * @property {number} inilevel - initial level
 * @property {string} race - related to some racist skills
 * @property {string[]} tags - tags
 * @property {number} wept - weapon type
 * @property {string} wep_model - default weapon model
 * @property {string} wep_slot - default weapon model slot of the spine
 * @property {number} gender - 0:f, 1:m, 2:etc
 * @property {string} profile - profile
 * @property {number[]} iniparam - initial primary params
 * @property {number[]} maxparam - maximal primary params
 * @property {string[]} skills - skills
 * @property {string} joinMsg - message to be shown when joins party
 */

var $dataPLC;
var $dataENC;
 
class Character {
    _iname = '';
    _hp = 1;
    _mana = 0;
    _cp = 0;
    _ct = 0;
    _level = 1;

    /**
     * @param {string} iname 
     */
    constructor(iname) {
        this._iname = iname;
    }

    //#region basic
    get iname() {return this._iname;}
    /** @returns {CharJSON} */
    get data() { return null;}
    /** @returns {string} */
    get model() { return this.data.model; }
    get voice() { return this.data.voice; }

    get name() { return this.data.name; }
    get level() { return this._level; }
    get MaxLevel() { return 100; }
    get race() {return this.data.race;}
    get tags() {return this.data.tags;}
    get gender() {return this.data.gender;}
    get profile() {return this.data.profile;}

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
        let arr = [];
        for (let i = 0; i < this.data.iniparam.length; i++) {
            arr.push(this.data.iniparam[i] + (this.data.maxparam[i] - this.data.iniparam[i]) * (this.level - 1) / (this.MaxLevel - 1));
        }
        this._homePStatus.SetValues(arr);
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

    //#region skill
    /** @type Skill[] */
    _skills = [];
    /** @returns {Skill[]} */
    get skills() { return this._skills;}

    /** @returns {Skill[]} */
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
        return this._skills.some(sk => sk.iname === iname);
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
     * @param {number} level
     */
    LearnSkill(iname, level = 1) {
        if (this.CanLearnSkill(iname)) {
            let data = $dataSkills[iname];
            let cla = eval(data.script);
            /** @type Skill */
            let skill = new cla(iname, this);
            this._skills.push(skill);
            if (level > 1) {
                skill.SetLevel(level);
            }
        }
    }

    ForgetSkill(iname) {
        if (this.HasSkill(iname)) {
            const sk = this._skills.find(s => s.iname === iname);
            this._skills.remove(sk);
            this.MarkParamChange();
        }
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
        this._level = this.data.inilevel;
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

    InitSkills() {
        this.LearnSkill('SK_WAIT');
        for (let sk of this.data.skills) {
            this.LearnSkill(sk);
        }
    }

    _exp = 0;
    get exp() {return Math.floor(this._exp);}

    GainExp(amt) {
        this._exp += amt;
        while (this._exp >= 100) {
            this.LevelUp();
            this._exp -= 100;
        }
    }

    LevelUp() {
        if (this._level < this.MaxLevel) {
            this._level ++;
            this.MarkParamChange();
        }
    }

    //#region Skill
    /**
     * @returns {Skill[]}
     */
    GetSkillsGrantedByEquips() {
        let sks = [];
        for (let eq of this.noEmptyEquips) {
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
        this._level = level;
        this.InitParam();
        this.InitSkills();
        this.RefreshStatus();
        this.FullRecover();
    }

    /** @returns {CharJSON} */
    get data() { return $dataENC[this._iname];}

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
        for (let sk of this.data.skills) {
            this.LearnSkill(sk, Math.ceil(this.level/20));
        }
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