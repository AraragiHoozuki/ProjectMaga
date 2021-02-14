/**
 * 污蔑的炎爪
 */
class Skill_DisdainClaw extends Skill {
	get targeting() { return Skill.TARGET.RANDOM + Skill.TARGET.AOE; }

	GetDescription() {
		return `受到伤害时，若伤害小于自身生命最大值的${this.GetSpecialValue('receive_damage_percent')}%，则对随机1名敌人发动反击造成\\${Colors.Red}${Math.floor(this.owner.GetParam(ParamType.STR) * this.GetSpecialValue('damage_scale')/100)}(${this.GetSpecialValue('damage_scale')}%力量)\\${Colors.White}的伤害。\n\n火属性 无类型 物理伤害`;
	}

	/**
	 * @param {Action} action
	 */
	OnSkillAnimation(action) {
		for (let chr of action._targets) {
			BattleFlow.PlayAnimation(18, chr);
		}
	}

	/**
	 * @param {Action} action
	 */
	OnSkillEffect(action) {
		let value = this.owner.GetParam(ParamType.STR) * this.GetSpecialValue('damage_scale')/100;
		for (let chr of action._targets) {
			BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.PYRO);
		}
	}
}