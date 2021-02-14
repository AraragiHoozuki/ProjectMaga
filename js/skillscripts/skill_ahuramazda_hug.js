class Skill_AhuramazdaHug extends Skill {
	get targeting() {
		return Skill.TARGET.AOE;
	}

	GetDescription() {
		return `对全体敌人造成${this.GetSpecialValue('damage_scale')}%的火属性·魔法攻击·魔法伤害，随敌人数量提高伤害倍率（每个${this.GetSpecialValue('quantity_bonus')}%）`;
	}

	OnSkillAnimation(action) {
		super.OnSkillAnimation(action);
		BattleFlow.PlayAnimation(70, action._targets[0]);
	}

	OnSkillEffect(action) {
		super.OnSkillEffect(action);
		for (let chr of action._targets) {
			let value = this.owner.GetParam(ParamType.INT) * (this.GetSpecialValue('damage_scale') + this.GetSpecialValue('quantity_bonus') * action._targets.length) / 100;
			BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.PYRO, Damage.ATTACK_TYPE.MAGIC, false);
		}
	}
}