class Skill_MagicConversion extends Skill {
    GetDescription() {
        return `受到魔法伤害时，自身智慧和魔防提高伤害值的${this.GetSpecialValue('conv_rate')}%, 持续${this.GetSpecialValue('duration')}回合(不可叠加，旧效果失效后才可再次触发)`;
    }
}

class Modifier_MagicConversion extends Modifier {
    _duration  = -1;
    GetDescription() {
        return `受到魔法伤害时，自身智慧和魔防提高伤害值的${this.GetSpecialValue('conv_rate')}%, 持续${this.GetSpecialValue('duration')}回合(当前加成值为${this._bonusValue}, 剩余持续时间为${this._bonusTurn})`;
    }

    _bonusTurn = 0;
    _bonusValue = 0;
    OnTakeDamage(damage) {
        super.OnTakeDamage(damage);
        if (this._bonusTurn <= 0 && damage.IsMagical()) {
            this._bonusValue = damage.absValue * this.GetSpecialValue('conv_rate') / 100;
            this._bonusTurn = this.GetSpecialValue('duration');
            BattleFlow.PlayAnimation(58, this.owner)
            this.owner.MarkParamChange();
        }
    }

    GetPrimaryStatusPlus() {
        if (this._bonusTurn > 0) {
            let values = [];
            values[ParamType.INT] = this._bonusValue;
            values[ParamType.MND] = this._bonusValue;
            return values;
        }
        return [];
    }

    OnTurnStart() {
        super.OnTurnStart();
        if (this._bonusTurn > 0) {
            this._bonusTurn --;
            if (this._bonusTurn === 0) {
                this._bonusValue = 0;
                this.owner.MarkParamChange();
            }
        }
    }
}