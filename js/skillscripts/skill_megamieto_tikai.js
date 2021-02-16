class Skill_MegamiEtoTikai extends Skill {
    get targeting() {
        return Skill.TARGET.ALLY+Skill.TARGET.SELF;
    }

    GetDescription() {
        return `我方目标获得${this.GetSpecialValue('guts_time')}次根性，并在根性消耗完之前力量+${this.GetSpecialValue('SCALE_STR')}%, 智慧+${this.GetSpecialValue('SCALE_INT')}%`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(118, chr);
        }
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        for (let chr of action._targets) {
            BattleFlow.ApplyModifier(this, chr, 'Modifier_MegamiEtoTikai');
        }
    }
}
class Modifier_MegamiEtoTikai extends Modifier_ParamUp {
    _duration = -1;
    _flags = Modifier.FLAG.GUTS;

    GetDescription() {
        return `根性; 力量+${this.GetSpecialValue('SCALE_STR')}%, 智慧+${this.GetSpecialValue('SCALE_INT')}%`;
    }

    OnCreate() {
        this._stack = this.GetSpecialValue('guts_time');
        this._stackMax = this._stack;
    }
}