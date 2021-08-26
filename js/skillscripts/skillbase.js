/** @type SkillJSON[] */
var $dataSkills;
/**
 * @typedef {Object} SkillSpecialValue
 * @property {string} name - special value key
 * @property {number} value - special value
 */

/**
 * @typedef {Object} SkillJSON
 * @property {string} name - skill name
 * @property {string} expr - skill basic description
 * @property {string} script - skill script class name
 * @property {boolean} passive - passive skill or not
 * @property {number} manacost - mana cost of the skill
 * @property {number} for_ally - 1 for ally, 0 for enemy
 * @property {number} target_type - 0 前排, 1 后排,  2 自己, 3 选择, 4 随机
 * @property {number} aoe - 0 单体, 1 aoe
 * @property {number} for_dead - 0 不能选择死亡目标, 1 能选择死亡目标, 2 只能选择死亡目标
 * @property {string} lwf - lwf effect name
 * @property {boolean} global - lwf effect is global or target only
 * @property {string} animation - spine animation name
 * @property {number[]} actionPoints - spine animation points
 * @property {string} sound - sound effect
 * @property {[string]} modifiers - intrinsic modifiers of the skill
 * @property {string} voice - voice event name(default is 'attack')
 * @property {[SkillSpecialValue]} specials - skill special values
 */

/**
 * @type Skill
 */
class Skill {
    /** @type Character */
    _owner;
    /** @type Modifier[] */
    _modifiers = [];
    /** @type PlayerChar */
    static tempChar;

    /**
     * 
     * @param {SkillJSON} sk 
     */
    static PreviewSkillDescription(sk) {
        return sk.expr.replace(/(\{)(.+?)(\})/g, (match,p1,p2,p3,offset,string)=>{
            return sk.specials.find(sp=>sp.name === p2)?.value??0;
        });
    }




    /**
     * @param {string} iname
     * @param {Character} owner
     */
    constructor(iname, owner) {
        this._iname = iname;
        this._owner = owner;
        this.OnCreate();
    }

    get iname() {return this._iname;}
    /** @returns {SkillJSON} */
    get data() {return $dataSkills[this._iname];}
    get name() {return this.data.name;}
    get expr() {return this.data.expr;}
    get owner() {return this._owner ? this._owner : Skill.tempChar;}

    get manacost() {
        return this.data.manacost;
    }
    /** @returns {Modifier[]} */
    get intrinsicModifiers() {return this._modifiers;}

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

    GSV(name = '') {
        const sp = this.data.specials.find(sp=>sp.name === name);
        return sp?.value??0;
    }

    
    GetDescription() {
        return this.data.expr.replace(/(\{)(.+?)(\})/g, (match,p1,p2,p3,offset,string)=>{
            return this.GSV(p2);
        });
    }


    /**
     * @param {Character} chr
     */
    SetOwner(chr) {
        this._owner = chr;
        for (const mod of this.intrinsicModifiers) {
            mod._owner = chr;
        }
    }

    CanPayCost() {
        return this.owner.mana >= this.manacost;
    }

    MeetsCustomUseCondition() {
        return true;
    }

    CanUse() {
        return this.CanPayCost() && this.MeetsCustomUseCondition();
    }

    /**
     * 目标选项
     * - 敌/我
     * - 锁定目标：前排 后排 自己 自由选择 随机
     * - 是否 AOE
     * - 是否可以选择死亡目标
     */
    IsForSelf() {
        return this.data.target_type === 2;
    }
    IsForAlly() {
        return this.data.for_ally === 1;
    }
    IsForAll() {
        return this.data.aoe === 1;
    }
    IsForDead() {
        return this.data.for_dead === 1;
    }
    IsRandom() {
        return (this.targeting & Skill.TARGET.RANDOM) === Skill.TARGET.RANDOM;
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

    OnSkillCost() {
        this.owner.AddMana(-this.manacost);
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

    /** @param {Character[]} targets*/
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

class Skill_Wait extends Skill {
    get targeting() {
        return Skill.TARGET.SELF;
    }

    GetDescription() {
        return '待机';
    }
}