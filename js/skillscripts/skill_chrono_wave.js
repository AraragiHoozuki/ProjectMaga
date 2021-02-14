class Skill_ChronoWave extends Skill {
    get targeting() {
        return Skill.TARGET.ALLY + Skill.TARGET.SELF + Skill.TARGET.AOE;
    }

    GetDescription() {
        return `我方全体触发${this.GetSpecialValue('steps')}次回合开始时效果(会影响回合计数以及状态持续时间)`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(37, chr);
        }
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        const steps = this.GetSpecialValue('steps');
        for(let i = 0; i < steps; i++) {
            for (const chr of action._targets) {
                chr.OnTurnStart();
            }
        }
    }
}