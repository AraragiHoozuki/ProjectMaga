class Skill_Suicide extends Skill {
    get targeting() {
        return Skill.TARGET.SELF;
    }

    GetDescription() {
        return `自杀`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(65, chr);
        }
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        let value = this.owner.GetParam(ParamType.MHP);
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.NONE, Damage.ATTACK_TYPE.NONE, false);
        }
    }
}