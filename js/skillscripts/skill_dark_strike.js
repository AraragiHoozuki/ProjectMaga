class Skill_DarkStrike extends Skill {

    GetDescription() {
        return `◆对目标敌人造成${this.GetSpecialValue('damage_scale')}%的死灵属性·魔法攻击·魔法伤害`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(101, chr);
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