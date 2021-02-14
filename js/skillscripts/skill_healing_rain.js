class Skill_HealingRain extends Skill {

    get targeting() {
        return Skill.TARGET.AOE + Skill.TARGET.ALLY + Skill.TARGET.SELF;
    }

    GetDescription() {
        return `◆回复我方全体${this.GetSpecialValue('heal_scale')}%智慧的生命`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(43, chr);
        }
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        const base = this.owner.GetParam(ParamType.INT) * this.GetSpecialValue('heal_scale')/100;
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, -base);
        }
    }
}