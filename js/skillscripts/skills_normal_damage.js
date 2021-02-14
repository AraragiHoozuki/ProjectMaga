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