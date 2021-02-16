class Skill_DvasiaDarkSphere extends Skill {
    get targeting() {
        return Skill.TARGET.AOE;
    }

    GetDescription() {
        return `对全体敌人造成${this.GetSpecialValue('damage_scale')}%的暗属性·魔法攻击·魔法伤害`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(105, chr);
        }
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        let value = this.owner.GetParam(ParamType.INT) * this.GetSpecialValue('damage_scale')/100;
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.NECRO, Damage.ATTACK_TYPE.MAGIC, false);
        }
    }
}

class Skill_RushStrike extends Skill {
    GetDescription() {
        return `对目标敌人造成${this.GetSpecialValue('damage_scale')}%的无属性·打击攻击·物理伤害`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(2, chr);
        }
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        let value = this.owner.GetParam(ParamType.STR) * this.GetSpecialValue('damage_scale')/100;
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.NONE, Damage.ATTACK_TYPE.BLOW);
        }
    }
}

class Skill_Slash extends Skill {
    GetDescription() {
        return `对目标敌人造成${this.GetSpecialValue('damage_scale')}%的无属性·斩攻击·物理伤害`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(7, chr);
        }
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        let value = this.owner.GetParam(ParamType.STR) * this.GetSpecialValue('damage_scale')/100;
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.NONE, Damage.ATTACK_TYPE.SLASH);
        }
    }
}