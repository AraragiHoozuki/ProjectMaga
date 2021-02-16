class Skill_Aura extends Skill {
    get targeting() {
        return Skill.TARGET.ALLY;
    }

    GetDescription() {
        return `我方单体智慧+${this.GetSpecialValue('SCALE_INT')}%, 持续${this.GetSpecialValue('duration')}回合；等级5以上时，对自身施加同样效果。`;
    }

    OnSkillStart(action) {
        super.OnSkillStart(action);
        if (this.level >= 5) action._targets.push(this.owner);
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(52, chr);
        }
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        for (let chr of action._targets) {
            BattleFlow.ApplyModifier(this, chr, 'Modifier_AuraIntUp', this.GetSpecialValue('duration'));
        }
    }
}
class Modifier_AuraIntUp extends Modifier_ParamUp {
    GetDescription() {
        return `智慧提高${this.GetSpecialValue('SCALE_INT')}%`;
    }
}

class Skill_Brave extends Skill {
    get targeting() {
        return Skill.TARGET.SELF;
    }

    GetDescription() {
        return `自身力量+${this.GetSpecialValue('SCALE_STR')}%, 持续${this.GetSpecialValue('duration')}回合；等级5以上时，再使自身暴击伤害提高50%`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(52, chr);
        }
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        for (let chr of action._targets) {
            BattleFlow.ApplyModifier(this, chr, 'Modifier_Brave');
        }
    }
}
class Modifier_Brave extends Modifier_ParamUp {
    GetDescription() {
        return `自身力量+${this.GetSpecialValue('SCALE_STR')}%，${this.skill.level>=5?'暴击伤害+50%':''}`;
    }

    GetSecondaryStatusPlus() {
        let values = [];
        if (this.skill.level >=5) values[SecParamType.CRITICAL_DAMAGE] = 50;
        return values;
    }
}

class Skill_GodWithin extends Skill {
    get targeting() {
        return Skill.TARGET.SELF;
    }

    GetDescription() {
        return `回复全部生命，自身力量+${this.GetSpecialValue('SCALE_STR')}%, 速度+${this.GetSpecialValue('SCALE_SPD')}%, 暴击率+${this.GetSpecialValue('SPLUS_CRITICAL_CHANCE')}%, 持续${this.GetSpecialValue('duration')}回合`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(51, chr);
            BattleFlow.PlayAnimation(52, chr);
            BattleFlow.PlayAnimation(76, chr);
        }
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, -chr.mhp, undefined,undefined, false)
            BattleFlow.ApplyModifier(this, chr, 'Modifier_ParamUp', this.GetSpecialValue('duration'));
        }
    }
}