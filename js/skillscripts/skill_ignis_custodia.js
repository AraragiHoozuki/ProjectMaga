class Skill_AgnisCustodia extends Skill {
	get targeting() {
		return Skill.TARGET.ALLY + Skill.TARGET.SELF;
	}

	GetDescription() {
		return `我方目标6回合内获得以下效果：
◆火抗性+${this.GetSpecialValue('SPLUS_RESIST_PYRO')}%
◆水抗性+${this.GetSpecialValue('SPLUS_RESIST_HYDRO')}%
◆受到伤害时，对攻击者造成${this.GetSpecialValue('damage_scale')}%的火属性·魔法攻击·魔法伤害，并使本状态减少1回合`
	}

	OnSkillAnimation(action) {
		super.OnSkillAnimation(action);
		for (let chr of action._targets) {
			BattleFlow.PlayAnimation(51, chr);
		}
	}

	OnSkillEffect(action) {
		super.OnSkillEffect(action);
		for (let chr of action._targets) {
			BattleFlow.ApplyModifier(this, chr, 'Modifier_AgnisCustodia');
		}
	}
}

class Modifier_AgnisCustodia extends Modifier_ParamUp {
	OnTakeDamage(damage) {
		super.OnTakeDamage(damage);
		let value = this.applier.GetParam(ParamType.INT) * this.GetSpecialValue('damage_scale') / 100;
		BattleFlow.PlayAnimation(3, damage.source);
		BattleFlow.ApplyDamage(this.skill, damage.source, value, Damage.ELEMENT.PYRO, Damage.ATTACK_TYPE.MAGIC, false);
		this.Proceed();
	}
}