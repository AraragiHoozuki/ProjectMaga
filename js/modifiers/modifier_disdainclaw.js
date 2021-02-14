class Modifier_DisdainClaw extends Modifier {
	OnCreate() {
		super.OnCreate();
		this._duration = -1;
	}

	GetDescription() {
		return `受到伤害时，若伤害小于自身生命最大值的${this.GetSpecialValue('receive_damage_percent')}%，则对随机1名敌人发动反击造成\\#cd2e2e${Math.floor(this.owner.GetParam(ParamType.STR) * 1.5)}(150%力量)\\#ffffff点伤害。`;
	}

	/**
	 * @param {Damage} damage
	 */
	OnTakeDamage(damage) {
		if (damage.value < this.owner.mhp * this.GetSpecialValue('receive_damage_percent') / 100) {
			BattleFlow.PlayAnimation(40, this.owner);
			BattleFlow.Reaction(this.skill, damage.source);
		}
	}
}