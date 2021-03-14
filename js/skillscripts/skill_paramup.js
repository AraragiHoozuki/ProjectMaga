class Skill_ParamUp extends Skill {
	GetDescription() {
		return this.intrinsicModifiers[0].GetDescription();
	}

	IsPassive() {
		return true;
	}
}