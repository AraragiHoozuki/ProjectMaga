class Skill_SupremusLux extends Skill {
    GetDescription() {
        return `◆对目标敌人造成${this.GetSpecialValue('damage_scale')}%的圣属性·魔法攻击·魔法伤害
◆随本次战斗中自身施加的总治疗量提高伤害（每点治疗量提高${this.GetSpecialValue('bonus_scale_per_heal')}%的倍率`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(100, chr);
        }
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        let bonus = this.intrinsicModifiers[0].GetTotalHeal() * this.GetSpecialValue('bonus_scale_per_heal');
        let dmg = this.owner.GetParam(ParamType.INT) * (this.GetSpecialValue('damage_scale') + bonus) / 100;
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, dmg, Damage.ELEMENT.DIVINE, Damage.ATTACK_TYPE.MAGIC, false);
        }
    }
}

class Modifier_SupremusLux_TotalHeal extends Modifier {
    GetDescription() {
        return `当前总治疗量为${this._totalHeal}`;
    }
    _duration = -1;
    _totalHeal = 0;

    GetTotalHeal() {
        return this._totalHeal;
    }
    OnBattleStart() {
        super.OnBattleStart();
        this._totalHeal = 0;
    }

    OnDealHealing(damage) {
        super.OnDealHealing(damage);
        this._totalHeal -= damage.value;
    }
}