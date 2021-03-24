/** @type SkillJSON[] */
var $dataSkills;
/**
 * @typedef {Object} SkillSpecialValue
 * @property {string} name - special value key
 * @property {string} tooltip - special value tooltip
 * @property {[number]} values - special level values
 */

/**
 * @typedef {Object} SkillJSON
 * @property {string} name - skill name
 * @property {string} expr - skill basic description
 * @property {string} script - skill script class name
 * @property {string} icon - skill icon name
 * @property {boolean} passive - passive skill or not
 * @property {number} ap - ap required to learn skill
 * @property {number} memory - memory cost of the skill
 * @property {[number]} sp - skill points required when learned by talent
 * @property {[number]} manacost - mana cost of the skill
 * @property {[number]} cpcost - cp cost of the skill
 * @property {[number]} max_sct - skill charge time (only for crafts)
 * @property {[number]} max_stack - max stack times (only for crafts)
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
     *
     * @param {SkillJSON} data
     * @param {number} level
     * @param {number} next_level
     */
    static GetDescription(data, level, next_level= -1) {
        let str = '';
        str += data.name + (level>0?`【等级${level}】\n`:'【尚未习得】\n');
        next_level = Math.min(data.manacost.length, next_level);
        if (next_level > level) {
            str += `升级 \\${Colors.Blue}${level}\\${Colors.White} → \\${Colors.Pink}${next_level}\\${Colors.White}\n`
        }
        str += '\n';
        str += `记忆: ${data.memory}\n`;
        str += `AP: ${data.ap}\n`;
        str += '法力消耗: ';
        for (let i = 0; i < data.manacost.length; i++) {
            const value = data.manacost[i];
            if (i === level - 1) {
                str += `\\${Colors.Blue}`;
            } else if (i === next_level - 1) {
                str += `\\${Colors.Pink}`;
            }
            str += value;
            str += ' ';
            if (i === level - 1||i === next_level - 1) str += `\\${Colors.White}`;
        }
        str += '\n';
        str += 'CT消耗: ';
        for (let i = 0; i < data.manacost.length; i++) {
            const value = data.ctcost.length > i?data.ctcost[i]:data.ctcost[data.ctcost.length-1];
            if (i === level - 1) {
                str += `\\${Colors.Blue}`;
            } else if (i === next_level - 1) {
                str += `\\${Colors.Pink}`;
            }
            str += value;
            str += ' ';
            if (i === level - 1||i === next_level - 1) str += `\\${Colors.White}`;
        }
        str += '\n';
        if (data.max_sct) {
            str += '充能时间: ';
            for (let i = 0; i < data.manacost.length; i++) {
                const value = data.max_sct.length > i?data.max_sct[i]:data.max_sct[data.max_sct.length-1];
                if (i === level - 1) {
                    str += `\\${Colors.Blue}`;
                } else if (i === next_level - 1) {
                    str += `\\${Colors.Pink}`;
                }
                str += value;
                str += ' ';
                if (i === level - 1||i === next_level - 1) str += `\\${Colors.White}`;
            }
            str += '\n';
            str += '最大储存: ';
            for (let i = 0; i < data.manacost.length; i++) {
                const value = data.max_stack.length > i?data.max_stack[i]:data.max_stack[data.max_stack.length-1];
                if (i === level - 1) {
                    str += `\\${Colors.Blue}`;
                } else if (i === next_level - 1) {
                    str += `\\${Colors.Pink}`;
                }
                str += value;
                str += ' ';
                if (i === level - 1||i === next_level - 1) str += `\\${Colors.White}`;
            }
            str += '\n';
        }

        str += '\n';
        str += data.expr + '\n';
        for (const sp of data.specials) {
            str += sp.tooltip + ': ';
            for (let i = 0; i < data.manacost.length; i++) {
                const value = sp.values.length > i?sp.values[i]:sp.values[sp.values.length-1];
                if (i === level - 1) {
                    str += `\\${Colors.Blue}`;
                } else if (i === next_level - 1) {
                    str += `\\${Colors.Pink}`;
                }
                str += value;
                str += ' ';
                if (i === level - 1||i === next_level - 1) str += `\\${Colors.White}`;
            }
            str += '\n';
        }
        return str;
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
    get expr() {return this.data.expr;}
    get icon() { return this.data.icon;}
    get level() {return this._level;}
    get maxLevel() {return this.data.manacost.length;}
    get owner() {return this._owner ? this._owner : Skill.tempChar;}
    get spNeeded() {
        if (this.level === this.maxLevel) {
            return 0;
        } else {
            if (this.data.sp.length > this.level) {
                return this.data.sp[this.level];
            } else {
                return this.data.sp[this.data.sp.length - 1];
            }
        }
    }
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

    IsEffectGlobal() {
        return this.data.global === true;
    }

    IsPassive() {
        return this.data.passive === true;
    }

    _isTalent = false;
    IsTalent() {
        return this._isTalent === true;
    }
    SetTalent() {
        this._isTalent = true;
    }
    get memory() { return this.IsTalent()?0:this.data.memory;}

    _equipped = false;
    Equip(bEorU = true) {
        this._equipped = bEorU;
    }
    IsEquipped() {return this._equipped;}

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
        return Skill.GetDescription(this.data, this.level);
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
        this.SetLevel(this.level + 1);
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
                LWFUtils.PlayLwf('lwf/battleLwf/', this.lwf, chr.battleSprite.x, chr.battleSprite.y);
            }
        }
    }

    PlaySound() {
        AudioManager.PlaySe(this.sound);
    }
}

class Craft extends Skill {
    get maxStack() {
        return this.data.max_stack;
    }

    _stack = 0;
    get stack() {
        return this._stack;
    }

    get maxSct() {
        return this.data.max_sct;
    }

    _sct = 0;
    get sct() {
        return this._sct;
    }

    /**
     * @param {number} val
     */
    Charge(val) {
        this._sct += val;
        if (this.sct >= this.maxSct) {
            if (this.stack < this.maxStack) {
                this._sct = 0;
                this._stack++;
            } else {
                this._sct = this.maxSct;
            }
        }
    }

    MeetsCustomUseCondition() {
        return this.stack > 0;
    }

    OnSkillStart(action) {
        super.OnSkillStart(action);
        this._stack --;
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