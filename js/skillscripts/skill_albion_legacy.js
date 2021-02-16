class Skill_AlbionLegacy extends Skill {
	GetDescription() {
		return `◆${Names.Params.ASSIST_HEAL}+${this.GetSpecialValue('SPLUS_ASSIST_HEAL')}%
◆${Names.Params.RESIST_NECRO}+${this.GetSpecialValue('SPLUS_RESIST_NECRO')}%
◆${Names.Params.CRITICAL_CHANCE}+${this.GetSpecialValue('SPLUS_CRITICAL_CHANCE')}%
◆回合开始时，治疗我方(不含自己)生命值最低的角色(倍率${this.GetSpecialValue('heal_scale')}%)`;
	}
}

class Modifier_AlbionLegacy extends Modifier_ParamUp {
	_duration = -1;
	GetDescription() {
		return `回合开始时，治疗我方(不含自己)生命值最低的角色(倍率${this.GetSpecialValue('heal_power')}%)`;
	}

	OnTurnStart() {
		super.OnTurnStart();
		const chr = this.owner.AllySet().MinParamByName('hprate', this.owner);
		if (chr) {
			BattleFlow.ApplyDamage(this.skill, chr, -this.skill.owner.GetParam(ParamType.INT) * this.GetSpecialValue('heal_scale')/100, undefined, undefined, false)
		}
	}
}