class Modifier_ThemisBalance extends Modifier {
    GetDescription() {
        return `造成伤害时，每1点伤害${Names.Params.ASSIST_HEAL}+${this.GSV('heal_assist_per_damage')}%（最高+${this.GSV('heal_assist_max')}%），持续2回合；造成回复时，每1点回复${Names.Params.ASSIST_MAGICAL}+${this.GSV('magical_assist_per_heal')}%（最高+${this.GSV('magical_assist_max')}%），持续2回合`;
    }

    OnDealHealing(damage) {
        super.OnDealHealing(damage);
        const mod = BattleFlow.ApplyModifier(this.skill, this.owner, 'Modifier_ThemisBalanceJudgement');
        if(mod) mod.ThemisBalanceSetValue(damage.absValue);
    }

    OnDealDamage(damage) {
        super.OnDealDamage(damage);
        const mod = BattleFlow.ApplyModifier(this.skill, this.owner, 'Modifier_ThemisBalanceCharity');
        if(mod) mod.ThemisBalanceSetValue(damage.absValue);
    }
}
class Modifier_ThemisBalanceJudgement extends Modifier {
    GetDescription() {
        return `断罪：魔法伤害提高${this.ThemisBalanceGetBonus()}%`;
    }
    duration = 2;
    _value = 0;
    ThemisBalanceSetValue(v) {
        this._value = v;
    }

    GetSecondaryStatusPlus() {
        let value = [];
        value[SecParamType.ASSIST_MAGICAL] = this.ThemisBalanceGetBonus();
        return value;
    }

    ThemisBalanceGetBonus() {
        return Math.min(this.GSV('magical_assist_per_heal') * this._value, this.GSV("magical_assist_max"));
    }
}
class Modifier_ThemisBalanceCharity extends Modifier {
    GetDescription() {
        return `慈悲：治疗量提高${this.ThemisBalanceGetBonus()}%`;
    }
    duration = 2;
    _value = 0;
    ThemisBalanceSetValue(v) {
        this._value = v;
    }

    GetSecondaryStatusPlus() {
        let value = [];
        value[SecParamType.ASSIST_HEAL] = this.ThemisBalanceGetBonus();
        return value;
    }

    ThemisBalanceGetBonus() {
        return Math.min(this.GSV('heal_assist_per_damage') * this._value, this.GSV("heal_assist_max"));
    }
}

class Modifier_PurgaNecrofire extends Modifier {
    GetDescription() {
        return `提高自身的${Names.Params.ASSIST_HEAL}和${Names.Params.ASSIST_MAGICAL}，当自身本次战斗中施加的回复和伤害相等时取得最大值，最大${this.GSV('max_bonus')}%（当前加成为${this.GetSecondaryStatusPlus()[SecParamType.ASSIST_MAGICAL]}%，回复量为${this._totalHeal}，伤害量为${this._totalDamage}）`;
    }

    _totalHeal = 0;
    _totalDamage = 0;

    OnBattleStart() {
        super.OnBattleStart();
        this._totalHeal = 0;
        this._totalDamage = 0;
    }

    OnDealDamage(damage) {
        super.OnDealDamage(damage);
        this._totalDamage += damage.absValue;
    }
    OnDealHealing(damage) {
        super.OnDealHealing(damage);
        this._totalHeal += damage.absValue;
    }

    OnBattleEnd() {
        super.OnBattleEnd();
        this._totalHeal = 0;
        this._totalDamage = 0;
    }

    GetSecondaryStatusPlus() {
        let value = [];
        let delta;
        const sum = this._totalHeal + this._totalDamage;
        if (sum === 0) {
            value[SecParamType.ASSIST_MAGICAL] = 0;
            value[SecParamType.ASSIST_HEAL] = 0;
        } else {
            delta = Math.abs(this._totalHeal - this._totalDamage);
            delta = this.GSV('max_bonus') * (sum - delta)/sum;
            value[SecParamType.ASSIST_MAGICAL] = delta;
            value[SecParamType.ASSIST_HEAL] = delta;
        }
        return value;
    }
}

class Skill_FireJudgement extends Skill {
    get targeting() {
        return Skill.TARGET.AOE;
    }

    GetDescription() {
        return `对全体敌人造成${this.GSV('damage_scale')}%的火属性·魔法攻击·魔法伤害；3回合${Names.Params.RESIST_PYRO}下降${-this.GSV('SPLUS_RESIST_PYRO')}%`
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        AudioManager.PlaySe(this.sound);
        const value = this.owner.GetParam(ParamType.INT) * this.GetSpecialValue('damage_scale')/100;
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.PYRO, Damage.ATTACK_TYPE.MAGIC, false);
            BattleFlow.ApplyModifier(this, chr, 'Modifier_FireJudgement', 3);
        }
    }
}
class Modifier_FireJudgement extends Modifier_ParamUp {
    GetDescription() {
        return `${Names.Params.RESIST_PYRO}下降${-this.GSV('SPLUS_RESIST_PYRO')}%`;
    }
}

class Skill_Bible extends Skill {
    get targeting() {
        return Skill.TARGET.AOE + Skill.TARGET.ALLY + Skill.TARGET.SELF;
    }

    GetDescription() {
        return `我方全体回复（治疗量${this.GSV('heal_scale')}%${Names.Params.INT}）；3回合异常状态免疫、${Names.Params.INT}提高${this.GSV('SCALE_INT')}%`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        AudioManager.PlaySe(this.sound);
        const value = this.owner.GetParam(ParamType.INT) * this.GetSpecialValue('heal_scale')/100;
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, -value, Damage.ELEMENT.NONE, Damage.ATTACK_TYPE.NONE, false);
            BattleFlow.ApplyModifier(this, chr, 'Modifier_BibleIntUp', 3);
        }
    }
}
class Modifier_BibleIntUp extends Modifier_ParamUp {
    GetDescription() {
        return `合异常状态免疫、${Names.Params.INT}提高${this.GSV('SCALE_INT')}%`;
    }

    _flags = Modifier.FLAG.IMMUNE;
}

class Skill_PurgatoryFire extends Skill {
    GetDescription() {
        return `对目标造成${this.GSV('damage_scale')}%的火属性·魔法攻击·魔法伤害；赋予5回合内每回合回复伤害值${this.GSV('heal_damage_rate')}%生命的效果`
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        AudioManager.PlaySe(this.sound);
        const value = this.owner.GetParam(ParamType.INT) * this.GetSpecialValue('damage_scale')/100;
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.PYRO, Damage.ATTACK_TYPE.MAGIC, false);
            let mod = BattleFlow.ApplyModifier(this, chr, 'Modifier_PurgatoryFire', 5);
            if (mod) mod.SetHealAmt(value * this.GSV('heal_damage_rate')/100);
        }
    }
}
class Modifier_PurgatoryFire extends Modifier {
    GetDescription() {
        return `每回合回复生命`;
    }
    _healAmt = 0;
    SetHealAmt(v = 0) {
        this._healAmt = v;
    }

    OnTurnStart() {
        super.OnTurnStart();
        BattleFlow.ApplyDamage(this.skill, this.owner, -this._healAmt, Damage.ELEMENT.NONE, Damage.ATTACK_TYPE.NONE, false);
    }
}

class Skill_BlackCodex extends Skill {
    GetDescription() {
        return `对目标造成${this.GSV('fire_damage_scale')}%的火属性·魔法攻击·魔法伤害、${this.GSV('necro_damage_scale')}%的死灵属性·魔法攻击·魔法伤害；3回合内${Names.Params.RESIST_MAGICAL}下降25%；对生命值25%以下的目标伤害提高${this.GSV('bonus_scale')}%`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
        this.PlayLwf(action._targets);
        AudioManager.PlaySe(this.sound);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        const value1 = this.owner.GetParam(ParamType.INT) * this.GetSpecialValue('fire_damage_scale')/100;
        const value2 = this.owner.GetParam(ParamType.INT) * this.GetSpecialValue('necro_damage_scale')/100;
        for (const chr of action._targets) {
            let bonus = chr.hprate <= 25? this.GSV('bonus_scale') : 0;
            bonus = (bonus + 100)/100;
            BattleFlow.ApplyDamage(this, chr, value1 * bonus, Damage.ELEMENT.PYRO, Damage.ATTACK_TYPE.MAGIC, false);
            BattleFlow.ApplyDamage(this, chr, value2 * bonus, Damage.ELEMENT.NECRO, Damage.ATTACK_TYPE.MAGIC, false);
            BattleFlow.ApplyModifier(this, chr, 'Modifier_ParamUp', 3);
        }
    }
}

class Skill_Regret extends Skill {
    get targeting() {
        return Skill.TARGET.ALLY + Skill.TARGET.SELF;
    }

    GetDescription() {
        return `目标回复（治疗量${this.GSV('heal_scale')}%${Names.Params.INT}）、目标生命值越低，治疗效果越高`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        AudioManager.PlaySe(this.sound);
        const value = this.owner.GetParam(ParamType.INT) * this.GetSpecialValue('heal_scale')/100;
        for (const chr of action._targets) {
            let bonus = this.GSV('bonus_scale_per_hurt') * (100 - chr.hprate);
            bonus = (bonus + 100)/100;
            BattleFlow.ApplyDamage(this, chr, -value * bonus, Damage.ELEMENT.NONE, Damage.ATTACK_TYPE.NONE, false);
        }
    }
}