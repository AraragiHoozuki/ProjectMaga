class Skill_HpTo24 extends Skill {
    GetDescription() {
        return `对目标敌人造成使其生命值变为${this.GetSpecialValue('hp_rate')}%的无属性·无类型攻击·魔法伤害`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
        AudioManager.PlaySe(this.sound);


    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        LWFUtils.PlayLwf('lwf/battleLwf/', this.lwf, 1000, 400);
        for (let chr of action._targets) {
            let val = chr.hprate > 24? chr.hp - chr.mhp * 0.24:0;
            BattleFlow.ApplyDamage(this, chr, val, Damage.ELEMENT.NONE, Damage.ATTACK_TYPE.NONE, false);
        }
    }
}
