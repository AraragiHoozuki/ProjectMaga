class Modifier {
	/**
	 * Enum for modifier flags
	 * @readonly
	 * @enum {number}
	 */
	static FLAG = {
		NONE: 0,
		IMMORTALITY: 0b1,
		GUTS: 0b10,
		IMMUNE: 0b100
	}
	/**
	 * @param {Character} owner
	 * @param {Skill} skill
	 */
	constructor(owner, skill) {
		this._owner = owner;
		this._skill = skill;
		this.OnCreate();
	}
	/** @type number */
	_duration = 3;
	get duration() { return this._duration;}
	get durationText() { return this.duration>0? this.duration : '∞'; }
	/** @type Skill */
	_skill;
	get skill() {return this._skill;}
	/** @type Character */
	_owner;
	get owner() {return this._owner;}
	get applier() {return this._skill.owner;}

	/** @type Modifier.FLAG */
	_flags = Modifier.FLAG.NONE;

	/**
	 * @param {Modifier.FLAG} flag
	 * @returns {boolean}
	 */
	HasFlag(flag) {
		return (this._flags&flag) === flag
	}


	/**
	 * whether the modifier will be shown in UI or not
	 * @returns {boolean}
	 */
	IsHidden() {
		return false;
	}

	IsValid() {
		return true;
	}

	IsPermanent() {
		return this._duration < 0;
	}

	_stack = 1;
	_stackMax = this._stack;
	get stack() {return this._stack;}
	get stackMax() {return this._stackMax;}
	CanStack() {
		return this.stackMax > 1;
	}
	Stack(value = 1) {
		this._stack += value;
		if (this._stack > this.stackMax) {
			this._stack = this.stackMax;
		} else if (this._stack < 1) {
			this.Remove();
		}
	}

	Proceed(value = 1) {
		if (!this.IsPermanent()) {
			this._duration -= value;
			if (this._duration < 1) this.Remove();
		}
	}

	Remove() {
		this.owner.RemoveModifier(this);
	}

	/**
	 * @returns {number[]}
	 */
	GetPrimaryStatusPlus() {
		let values = [];
		return values;
	}

	/**
	 * @returns {number[]}
	 */
	GetPrimaryStatusScale() {
		let values = [];
		return values;
	}

	/**
	 * @returns {number[]}
	 */
	GetSecondaryStatusPlus() {
		let values = [];
		return values;
	}

	/** @param {string} name */
	GetSpecialValue(name) {
		return this._skill.GetSpecialValue(name);
	}

	/** @param {string} name */
	GSV(name) {
		return this._skill.GetSpecialValue(name);
	}

	GetDescription() {
		return '原始Modifier';
	}

	OnCreate() {

	}

	OnRemove() {

	}

	OnBattleStart() {

	}

	OnBattleEnd() {

	}

	OnTurnStart() {
		this.Proceed();
	}

	OnSkillStart() {

	}

	OnSkillCost() {

	}

	OnSkillEnd() {

	}

	/**
	 * @param {Action} action
	 */
	OnActionEnd(action) {

	}

	/**
	 * @param {Damage} damage
	 */
	OnDealDamage(damage) {

	}

	/**
	 * @param {Damage} damage
	 */
	OnBeforeDealDamage(damage) {

	}


	/**
	 * @param {Damage} damage
	 */
	OnDealHealing(damage) {

	}

	/**
	 * @param {Damage} damage
	 */
	OnBeforeTakeDamage(damage) {

	}

	/**
	 * @param {Damage} damage
	 */
	OnTakeDamage(damage) {

	}

	/**
	 * @param {Damage} damage
	 */
	OnTakeHealing(damage) {

	}

	/**
	 * @param {Damage} damage
	 */
	OnDefPiercing(damage) {

	}

	/**
	 * @param {boolean} IsImmortalGuts
	 */
	OnGuts(IsImmortalGuts) {

	}

}