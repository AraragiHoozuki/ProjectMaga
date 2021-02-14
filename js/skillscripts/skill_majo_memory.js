class Skill_MajoMemory extends Skill {
	GetDescription() {
		return `◆每次受到带属性的魔法类型的攻击时，本次战斗中增加对该属性${this.GetSpecialValue('resist_per_damage')}%的抗性
◆回合开始时回复${this.GetSpecialValue('mana_recover_rate')}%的法力
◆随着回合数增加智慧和魔防（每回合增加${this.GetSpecialValue('int_mnd_per_turn')}%，最多${this.GetSpecialValue('max_stack')}次）`;
	}
}

class Modifier_MajoMemory extends Modifier {
	_duration = -1;
	GetDescription() {
		return `每次受到带属性的魔法类型的攻击时，本次战斗中增加对该属性${this.GetSpecialValue('resist_per_damage')}%的抗性; 回合开始时回复${this.GetSpecialValue('mana_recover_rate')}%的法力; 随着回合数增加智慧和魔防（每回合增加${this.GetSpecialValue('int_mnd_per_turn')}%, 当前为第${this.owner.turnCount}回合, 最多叠加${this.GetSpecialValue('max_stack')}次）`;
	}

	OnTakeDamage(damage) {
		super.OnTakeDamage(damage);
		if (damage.attack === Damage.ATTACK_TYPE.MAGIC && damage.element !== Damage.ELEMENT.NONE) {
			this._resistCount[Damage.GetElementResistIndex(damage.element)] += this.GetSpecialValue('resist_per_damage');
			this.owner.MarkParamChange();
		}
	}

	_memoryCount = 0;
	OnTurnStart() {
		super.OnTurnStart();
		if (this._memoryCount < this.GetSpecialValue('max_stack'))this._memoryCount++;
		BattleFlow.ApplyDamage(this.skill, this.owner, -this.owner.mma * this.GetSpecialValue('mana_recover_rate')/100, undefined, undefined, false, Damage.TYPE.MANA);
		this.owner.MarkParamChange();
	}

	GetPrimaryStatusPlus() {
		let values = [];
		values[ParamType.INT] = this.GetSpecialValue('int_mnd_per_turn') * this._memoryCount;
		values[ParamType.MND] = this.GetSpecialValue('int_mnd_per_turn') * this._memoryCount;
		return values;
	}

	_resistCount = Object.values(SecParamType).fill(0);
	GetSecondaryStatusPlus() {
		return this._resistCount;
	}

	OnBattleEnd() {
		super.OnBattleEnd();
		this._memoryCount = 0;
		this._resistCount = Object.values(SecParamType).fill(0);
	}
}