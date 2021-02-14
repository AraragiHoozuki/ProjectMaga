class Skill_Inori extends Skill {
    get targeting() {
        return Skill.TARGET.ALLY;
    }

    GetDescription() {
        return `回复目标${this.GetSpecialValue('mana_amount')}点法力。`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(117, chr);
        }
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        const base = -this.GetSpecialValue('mana_amount');
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, base, undefined, undefined, false, Damage.TYPE.MANA);
        }
    }
}