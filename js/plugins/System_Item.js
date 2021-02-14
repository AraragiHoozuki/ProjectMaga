/** @type ItemJSON[] */
var $dataItems;

/**
 * @typedef {Object} ItemJSON
 * @property {string} name - item name
 * @property {string} icon - item icon name
 * @property {string} description - item description
 * @property {number} slot - equip slot
 * @property {number} type - item type
 * @property {number} wept - weapon type
 * @property {[string]} skills - intrinsic skills
 */

class Item {
	static Type = {
		EQUIP: 0,
		MATERIAL: 1,
		TICKET: 2,
		KEY: 3
	}
	/**
	 * @param {string} iname
	 */
	constructor(iname) {
		this._iname = iname;
	}
	_iname = '';
	_amount = 0;
	get iname() {return this._iname;}
	/** @type ItemJSON */
	get data() { return $dataItems[this._iname];}
	get name() {return this.data.name;}
	get icon() {return this.data.icon;}
	get type() {return this.data.type;}
	get slot() {return this.data.slot;}
	get wept() {return this.data.wept;}
 	get description() { return this.data.description; }
	get amount() { return this._amount;}

	/**
	 * @param {number} num
	 */
	Add(num) {
		this._amount += num;
	}

	IsEquip() {
		return false;
	}

}

class Equip extends Item {
	static Slot = {
		WEAPON: 0,
		ARMOR: 1,
		ACCESSORY: 2
	}

	static WeaponType = {
		SWORD: 0,
		KATANA: 1,
		STAFF: 2,
		GRIMOIRE: 3,
		AXE: 4,
		LANCE: 5,
		BOW: 6,
		MACE: 7
	}
	/**
	 * @param {string} iname
	 */
	constructor(iname) {
		super(iname);
		if (this.data.skills) {
			for (let sk_i of this.data.skills) {
				let cla = eval($dataSkills[sk_i].script);
				this._skills.push(new cla(sk_i));
			}
		}
	}
	/** @type Skill[] */
	_skills = [];
	/** @type PlayerChar */
	_character = null;

	get skills() { return this._skills;}
	get equippingChr() {return this._character;}

	/**
	 * @param {PlayerChar} chr
	 */
	OnEquipped(chr) {
		this._character = chr;
		this._skills.forEach(sk => sk.SetOwner(chr));
	}


	OnRemoved() {
		this._character = null;
		this._skills.forEach(sk => sk.SetOwner(null));
	}

	/**
	 * @returns {boolean}
	 */
	IsEquipped() {
		return !!this._character;
	}

	IsEquip() {
		return true;
	}

	IsWeapon() {
		return this.slot === 0;
	}

}