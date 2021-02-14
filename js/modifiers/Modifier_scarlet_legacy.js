class Modifier_ScarletLegacy extends Modifier_ParamUp {
	_duration = -1;
	GetDescription() {
		return `受到火属性伤害时，有${this.GetSpecialValue('pyro_absorb_prob')}%的概率回复伤害值200%的生命（幸运值会额外提高发动概率）;将受到致命伤害时，将伤害变为自身当前生命值-1，回复全部法力并获得智慧·速度+50%效果，此效果一次战斗中仅能发动一次`;
	}

	_revive_used = false;
	OnBeforeTakeDamage(damage) {
		super.OnBeforeTakeDamage(damage);
		if (damage.value >= this.owner.hp && !this._revive_used) {
			damage._value = this.owner.hp - 1;
			this._revive_used = true;
			this.owner.AddMana(this.owner.mma);
			BattleFlow.ApplyModifier(this.skill, this.owner, 'Modifier_RoseliaRevive');
			BattleFlow.PlayAnimation(67, this.owner);
			BattleFlow.PlayAnimation(52, this.owner);
		}
	}

	OnTakeDamage(damage) {
		super.OnTakeDamage(damage);
		if (damage.element === Damage.ELEMENT.PYRO &&
			Math.ProbCheck(this.GetSpecialValue('pyro_absorb_prob'), this.owner.GetParam(ParamType.LUK))) {
			BattleFlow.PlayAnimation(58, this.owner);
			BattleFlow.ApplyDamage(this.skill, this.owner, -damage.value * 2);
		}
	}

	OnBattleStart() {
		super.OnBattleStart();
		this._revive_used = false;
	}
}

class Modifier_RoseliaRevive extends Modifier {
	GetDescription() {
		return `智慧+50%、速度+50%`;
	}
	_duration = 5;

	/**
	 * @returns {number[]}
	 */
	GetPrimaryStatusScale() {
		let values = [];
		values[ParamType.INT] = 50;
		values[ParamType.SPD] = 50;
		return values;
	}
}