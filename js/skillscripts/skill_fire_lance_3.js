class Skill_FireLance3 extends Skill {
	get targeting() {
		return Skill.TARGET.RANDOM + Skill.TARGET.AOE;
	}

	get targetCount() {
		return 3;
	}

	GetDescription() {
		return `对随机敌人造成${this.GetSpecialValue('damage_scale')}%的火属性·魔法攻击·魔法伤害，重复3次`;
	}

	OnSkillAnimation(action) {
		for (let chr of action._targets) {
			BattleFlow.PlayAnimation(13, chr);
		}
	}

	OnSkillEffect(action) {
		let value = this.owner.GetParam(ParamType.INT) * this.GetSpecialValue('damage_scale')/100;
		for (let chr of action._targets) {
			BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.PYRO, Damage.ATTACK_TYPE.MAGIC, false);
		}
	}
}