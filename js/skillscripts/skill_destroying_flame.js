class Skill_DestroyingFlame extends Skill {
	get targeting() {return Skill.TARGET.SELF + Skill.TARGET.AOE;}

	GetDescription() {
		return `对所有敌人以及自己造成${Math.floor(this.owner.GetParam(ParamType.STR) * this.GetSpecialValue('damage_scale') / 100)}(${this.GetSpecialValue('damage_scale')}%物攻)的伤害。`;
	}
	/**
	 * @param {Action} action
	 */
	OnSkillAnimation(action) {
		BattleFlow.PlayAnimation(69, this.owner);
	}
	/**
	 * @param {Action} action
	 */
	OnSkillEffect(action) {
		let value = this.owner.GetParam(ParamType.STR) * this.GetSpecialValue('damage_scale') / 100;
		for (let chr of action._targets) {
			BattleFlow.ApplyDamage(this, chr, value);
		}
	}
}