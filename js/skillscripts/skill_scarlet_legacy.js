class Skill_ScarletLegacy extends Skill {
	GetDescription() {
		return `◆火属性+${this.GetSpecialValue('SPLUS_ASSIST_PYRO')}%
◆水抗性+${this.GetSpecialValue('SPLUS_RESIST_HYDRO')}%
◆暴击伤害+${this.GetSpecialValue('SPLUS_CRITICAL_DAMAGE')}%
◆受到火属性伤害时，有${this.GetSpecialValue('pyro_absorb_prob')}%的概率回复伤害值200%的生命（幸运值会额外提高发动概率）
◆将受到致命伤害时，将伤害变为自身当前生命值-1，回复全部法力并获得智慧·速度+50%效果，此效果一次战斗中仅能发动一次`;
	}
}