/** @type SkillJSON[] */
var $dataSkills;
/**
 * @typedef {Object} SkillSpecialValue
 * @property {string} name - special value key
 * @property {[number]} values - special level values
 */

/**
 * @typedef {Object} SkillJSON
 * @property {string} name - skill name
 * @property {string} script - skill script class name
 * @property {string} icon - skill icon name
 * @property {boolean} passive - passive skill or not
 * @property {[number]} manacost - mana cost of the skill
 * @property {[number]} cpcost - cp cost of the skill
 * @property {[number]} ctcost - ct cost of the skill
 * @property {[number]} lucost - lv up cost of the skill
 * @property {string} lwf - lwf effect name
 * @property {boolean} global - lwf effect is global or target only
 * @property {string} animation - spine animation name
 * @property {number[]} actionPoints - spine animation points
 * @property {string} sound - sound effect
 * @property {[string]} modifiers - intrinsic modifiers of the skill
 * @property {string} animation - animation id
 * @property {string} voice - voice event name(default is 'attack')
 * @property {string} description - description
 * @property {[SkillSpecialValue]} specials - skill special values
 */

/**
 * @type Skill
 */
class Skill {
    /** @type Character */
    _owner;
    /** @type number */
    _level;
    /** @type Modifier[] */
    _modifiers = [];
    /** @type PlayerChar */
    static tempChar;

    static TARGET = {
        SELF: 0b1,
        ALLY: 0b10,
        AOE: 0b100,
        RANDOM: 0b1000,
        DEAD: 0b10000
    }




    /**
     * @param {string} iname
     * @param {Character} owner
     */
    constructor(iname, owner) {
        this._iname = iname;
        this._owner = owner;
        this._level = 1;
        this.OnCreate();
    }

    get iname() {return this._iname;}
    /** @returns {SkillJSON} */
    get data() {return $dataSkills[this._iname];}
    get name() {return this.data.name;}
    get icon() { return this.data.icon;}
    get level() {return this._level;}
    get maxLevel() {return this.data.manacost.length;}
    get owner() {return this._owner ? this._owner : Skill.tempChar;}
    get manacost() {
        return this.data.manacost[this.level - 1];
    }
    get cpcost() {
        if (this.data.cpcost.length >= this.level) {
            return this.data.cpcost[this.level - 1];
        } else {
            return this.data.cpcost[this.data.cpcost.length - 1];
        }
    }
    get ctcost() {
        if (this.data.ctcost.length >= this.level) {
            return this.data.ctcost[this.level - 1];
        } else {
            return this.data.ctcost[this.data.ctcost.length - 1];
        }
    }
    /** @returns {Modifier[]} */
    get intrinsicModifiers() {return this._modifiers;}
    get levelUpCost() {
        if (this.data.lucost.length > this.level) {
            return this.data.lucost[this.level];
        } else {
            return this.data.lucost[this.data.lucost.length];
        }
    }

    get animation() {return this.data.animation;}
    get actionPoints() {return this.data.actionPoints;}
    get sound() {return this.data.sound;}
    get lwf() {return this.data.lwf;}
    get desc() {return this.data.description;}

    IsEffectGlobal() {
        return this.data.global === true;
    }

    IsPassive() {
        return this.data.passive === true;
    }

    /**
     * @param {Character} chr
     */
    SetOwner(chr) {
        this._owner = chr;
        for (let mod of this.intrinsicModifiers) {
            mod._owner = chr;
        }
    }

    CanPayCost() {
        return this.owner.mana >= this.manacost && this.owner.cp >= this.cpcost;
    }

    MeetsCustomUseCondition() {
        return true;
    }

    CanUse() {
        return this.CanPayCost() && this.MeetsCustomUseCondition();
    }

    get targeting() {return 0;}
    get targetCount() {return 1;}
    IsForSelf() {
        return (this.targeting & Skill.TARGET.SELF) === Skill.TARGET.SELF;
    }
    IsForAlly() {
        return (this.targeting & Skill.TARGET.ALLY) === Skill.TARGET.ALLY;
    }
    IsForAll() {
        return (this.targeting & Skill.TARGET.AOE) === Skill.TARGET.AOE;
    }
    IsForDead() {
        return (this.targeting & Skill.TARGET.DEAD) === Skill.TARGET.DEAD;
    }
    IsRandom() {
        return (this.targeting & Skill.TARGET.RANDOM) === Skill.TARGET.RANDOM;
    }

    /**
     * Get the special value of this skill by name and level
     * @param {string} name - special value name
     * @param {number} level - skill level 
     */
    GetSpecialValue(name, level = this.level) {
        let sp = this.data.specials.find(obj => obj.name === name);
        if (sp) {
            if (sp.values.length >= level) {
                return sp.values[level - 1];
            } else {
                return sp.values[sp.values.length - 1];
            }
        } else {
            console.log(`special value '${name}' not found`);
            return 0;
        }
    }

    /**
     * Get the special value of this skill by name and level
     * @param {string} name - special value name
     * @param {number} level - skill level
     */
    GSV(name, level = this.level) {
        return this.GetSpecialValue(name, level)
    }

    GetDescription() {
        return '原始技能';
    }

    /** @param {number} val */
    SetLevel(val) {
        if (this._level !== val) {
            val = Math.min(Math.max(val, 1), this.maxLevel);
            this._level = val;
            this.owner.MarkParamChange();
        }
    }

    LevelUp() {
        this._level ++;
        this.owner.MarkParamChange();
    }


    OnCreate() {
        let cla, mod;
        if (this.data.modifiers && this.data.modifiers.length > 0) {
            for (let name of this.data.modifiers) {
                cla = eval(name);
                mod = new cla(this.owner, this);
                this._modifiers.push(mod);
            }
            if (this.owner) {
                this.owner.MarkParamChange();
            }

        }
    }
    /**
     * @param {Action} action
     */
    OnSkillStart(action) {
        if (this.data.voice) {
            AudioManager.PlayUnique(this.owner.voice, this.data.voice);
        } else if (this.iname !== 'SK_WAIT'){
            AudioManager.PlayAttack(this.owner.voice);
        }
    }

    _costedCp = 0;
    /**
     * record cp costed by all cp cost skills(100 cp skills)
     * @returns {number}
     */
    get costedCp() {return this._costedCp;}
    OnSkillCost() {
        this.owner.AddMana(-this.manacost);
        this.owner.AddCt(-this.ctcost);
        if (this.cpcost === 100) {
            this._costedCp = this.owner.cp;
            this.owner.AddCp(-this.owner.cp);
        } else {
            this.owner.AddCp(-this.cpcost);
        }
    }

    /**
     * @param {Action} action
     */
    OnSkillAnimation(action) {
    }
    /**
     * @param {Action} action
     */
    OnSkillEffect(action) {}
    OnSkillEnd() {
        this._effectPlayed = false;
    }

    _effectPlayed = false;
    SetEffectPlayed() {this._effectPlayed = true;}

    /** @type Character[]*/
    PlayLwf(targets) {
        if (this.IsEffectGlobal()) {
            LWFUtils.PlayLwf('lwf/battleLwf/', this.lwf, 300, 400);
        } else {
            for (const chr of targets) {
                LWFUtils.PlayLwf('lwf/battleLwf/', this.lwf, chr.battleSprite.x, chr.battleSprite.y - 50);
            }
        }
    }

    PlaySound() {
        AudioManager.PlaySe(this.sound);
    }
}

class Skill_Wait extends Skill {
    get targeting() {
        return Skill.TARGET.SELF;
    }

    GetDescription() {
        return '待机';
    }
}