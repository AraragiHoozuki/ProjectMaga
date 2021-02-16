class Skill_SuperRegenerate extends Skill {

    get targeting() {
        return Skill.TARGET.ALLY + Skill.TARGET.SELF;
    }

    GetDescription() {
        return `◆回复目标${this.GetSpecialValue('heal_scale')}%智慧的生命，随目标生命值下降提高效果`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(41, chr);
        }
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        const base = this.owner.GetParam(ParamType.INT) * this.GetSpecialValue('heal_scale')/100;
        for (let chr of action._targets) {
            let value = base + base * this.GetSpecialValue('bonus_scale_per_hp_percent_lost') * (100 - chr.hprate) / 100;
            BattleFlow.ApplyDamage(this, chr, -value);
        }
    }
}