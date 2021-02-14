class Skill_DragonBreath extends Skill {

	GetDescription() {
		return `◆对目标敌人造成${this.GetSpecialValue('damage_scale')}%的火属性·魔法攻击·魔法伤害
◆降低目标${-this.GetSpecialValue('SPLUS_RESIST_PYRO')}%的火抗性`;
	}

	OnSkillAnimation(action) {
		super.OnSkillAnimation(action);
		for (let chr of action._targets) {
			BattleFlow.PlayAnimation(32, chr);
		}
	}

	OnSkillEffect(action) {
		super.OnSkillEffect(action);
		let value = this.owner.GetParam(ParamType.INT) * this.GetSpecialValue('damage_scale')/100;
		for (let chr of action._targets) {
			BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.PYRO, Damage.ATTACK_TYPE.MAGIC, false);
			BattleFlow.ApplyModifier(this, chr, 'Modifier_DragonBreathPyroResistDown');
		}
	}
}

class Modifier_DragonBreathPyroResistDown extends Modifier_ParamUp {
	GetDescription() {
		return `火抗性降低${-this.GetSpecialValue('SPLUS_RESIST_PYRO')}%`;
	}
}