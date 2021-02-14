class Skill_FireBall extends Skill {
    /**
     * @param {Action} action
     */
    OnSkillAnimation(action) {
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(3, chr);
        }
    }

    /**
     * @param {Action} action
     */
    OnSkillEffect(action) {
        let value = this.owner.GetParam(ParamType.INT) * 1.5;
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.PYRO, Damage.ATTACK_TYPE.MAGIC);
        }
    }
}