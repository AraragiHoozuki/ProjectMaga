class Skill_DvasiaShocked extends Skill {
    get targeting() {
        return Skill.TARGET.SELF;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(54, chr);
        }
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        for (let chr of action._targets) {
            BattleFlow.ApplyModifier(this, chr, 'Modifier_DvasiaShocked');
        }
    }
}
class Modifier_DvasiaShocked extends Modifier_ParamUp {
    _duration = -1;
    GetDescription() {
        return '智慧·魔防-90%';
    }
}
