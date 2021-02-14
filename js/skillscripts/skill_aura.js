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
            BattleFlow.ApplyModifier(this, chr, 'Modifier_AuraIntUp');
        }
    }
}

class Modifier_AuraIntUp extends Modifier_ParamUp {
    GetDescription() {
        return `智慧提高${this.GetSpecialValue('SCALE_INT')}%`;
    }

    OnCreate() {
        this._duration = this.GetSpecialValue('duration');
    }
}