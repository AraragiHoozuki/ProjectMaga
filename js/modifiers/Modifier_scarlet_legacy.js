class Modifier_ScarletLegacy extends Modifier_ParamUp {
	_duration = -1;
	GetDescription() {
		return `受到火属性伤害时，有${this.GetSpecialValue('pyro_absorb_prob')}%的概率回复伤害值200%的生命（幸运值会额外提高发动概率）;受到致命伤害时，根性(以1点生命值生存)，此效果一次战斗中仅能发动一次；每当发动根性时，回复全部法力并获得智慧·速度+50%效果。`;
	}

	_flags = Modifier.FLAG.IMMORTALITY;

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
		this._flags |= Modifier.FLAG.IMMORTALITY;
	}

	OnGuts(IsImmortalGuts) {
		if (IsImmortalGuts) {
			this._flags &= (~Modifier.FLAG.IMMORTALITY);
		}
		this.owner.AddMana(this.owner.mma);
		BattleFlow.ApplyModifier(this.skill, this.owner, 'Modifier_RoseliaRevive');
		BattleFlow.PlayAnimation(67, this.owner);
		BattleFlow.PlayAnimation(52, this.owner);
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