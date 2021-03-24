/**
 * @typedef {Object} ArkLearn
 * @property {string} iname - learn skill iname
 * @property {number} ap - ap rate
 * @property {number} level - level required
 */

/**
 * @typedef {Object} ArkJSON
 * @property {string} name - ark name
 * @property {string} image - ark image
 * @property {string} flavour - ark flavour text
 * @property {string} skill - ark skill;
 * @property {string} item - item reward;
 * @property {[ArkLearn]} learnings - ark learning skills;
 */

/** @type ArkJSON[] */
var $dataArks;


class Ark {
    static MaxLevel = 10;
    static MaxExplore = 100;
    constructor(iname) {
        this._iname = iname;
        const cla = eval($dataSkills[this.data.skill].script);
        this._skill = new cla(this.data.skill);
    }
    _iname;
    _level = 1;
    /** @type Skill */
    _skill;
    _learnings = [];
    /** @type PlayerChar */
    _character;
    _explore = 0;

    get iname() {return this._iname;}
    get data() {return $dataArks[this._iname];}
    get image() {return this.data.image;}
    get flavour() {return this.data.flavour;}
    get level() {return this._level;}
    get allLearnings() {return this.data.learnings;}
    get currentLearnings() {return this.data.learnings.filter(ln => ln.level <= this.level);}
    get skill() {return this._skill;}

    get description() {
        return Skill.GetDescription(this._skill.data, this._skill.level);
    }
    get levelupDescription() {
        if (this.IsMaxLevel()) {
            return this.description;
        } else {
            return Skill.GetDescription(this._skill.data, this._skill.level, this._skill.level + 1);
        }
    }

    IsMaxLevel() {
        return this._level === Ark.MaxLevel;
    }

    LevelUp() {
        if (this._level < Ark.MaxLevel) {
            this._level ++;
            this._skill.SetLevel(this._level);
        }
    }

    AddExplore(val) {
        this._explore += val;
        this._explore = Math.min(this._explore, Ark.MaxExplore);
    }

    _exploreItemGot = false;
    IsExploreItemGot() {
        return this._exploreItemGot;
    }

    OnEquipped(chr) {
        this._character = chr;
        this._skill.SetOwner(chr);
    }

    OnRemoved() {
        this._character = undefined;
        this._skill.SetOwner(undefined);
    }
}