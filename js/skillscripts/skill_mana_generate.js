class Skill_ManaGenerate extends Skill {
    get targeting() {
        return Skill.TARGET.SELF;
    }

    GetDescription() {
        return `消耗自身${this.GetSpecialValue('hp_cost_rate')}%的生命，回复消耗值${this.GetSpecialValue('mana_conversion_rate')}%的法力(生命值不够时无法使用)`;
    }

    MeetsCustomUseCondition() {
        return this.owner.hp > this.owner.mhp * this.GetSpecialValue('hp_cost_rate')/100;
    }

    OnSkillCost() {
        super.OnSkillCost();
        this.owner.AddHp(-this.owner.mhp * this.GetSpecialValue('hp_cost_rate')/100);
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(60, chr);
        }
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, -this.owner.mhp * this.GetSpecialValue('hp_cost_rate')/100 * this.GetSpecialValue('mana_conversion_rate')/100, undefined, undefined, false, Damage.TYPE.MANA);
        }
    }
}