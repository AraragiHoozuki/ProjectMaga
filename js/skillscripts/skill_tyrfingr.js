class Skill_KenMotu extends Skill {
    get targeting() {
        return Skill.TARGET.SELF;
    }

    GetDescription() {
        return `自身${Names.Params.STR}+${this.GSV('SCALE_STR')}%、${Names.Params.SPD}+${this.GSV('SCALE_SPD')}%、 ${Names.Params.DEF}${this.GSV('SCALE_DEF')}%，并且可以使用技能【修罗剑】, 持续${this.GSV('duration')}回合`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.ChangeIdle('s.skill_start_loop');
        this.owner.controller.SetSkillAnimation(this.animation);
        if (this.IsEffectGlobal()) {
            LWFUtils.PlayLwf('lwf/battleLwf/', this.lwf, 0, 300);
        } else {
            for (let chr of action._targets) {
                LWFUtils.PlayLwf('lwf/battleLwf/', this.lwf, chr.battleSprite.x, chr.battleSprite.y - 50);
            }
        }
        AudioManager.PlaySe(this.sound);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.owner.LearnSkill('SK_TYRFINGR_SHURA_BLADE', this.level);
        for (let chr of action._targets) {
            BattleFlow.ApplyModifier(this, chr, 'Modifier_KenMotu', this.GSV('duration'));
        }
    }
}

class Modifier_KenMotu extends Modifier_ParamUp {
    GetDescription() {
        return `自身${Names.Params.STR}+${this.GSV('SCALE_STR')}%、${Names.Params.SPD}+${this.GSV('SCALE_SPD')}%、 ${Names.Params.DEF}${this.GSV('SCALE_DEF')}%，并且可以使用技能【修罗剑】`;
    }

    OnRemove() {
        this.owner.controller.ResetIdle();
        this.owner.ForgetSkill('SK_TYRFINGR_SHURA_BLADE');
    }
}

class Skill_ShuraBlade extends Skill {
    GetDescription() {
        return `对目标敌人造成${this.GetSpecialValue('damage_scale')}%的死灵属性·斩攻击·物理伤害`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        AudioManager.PlaySe(this.sound);
        let value = this.owner.GetParam(ParamType.STR) * this.GetSpecialValue('damage_scale')/100;
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.NECRO, Damage.ATTACK_TYPE.SLASH);
        }
    }
}

class Skill_InnerEdge extends Skill {
    get targeting() {
        return Skill.TARGET.SELF;
    }

    GetDescription() {
        return `自身${Names.Params.CRITICAL_CHANCE}+${this.GSV('SPLUS_CRITICAL_CHANCE')}%、 ${Names.Params.ASSIST_NECRO}+${this.GSV('SPLUS_ASSIST_NECRO')}%、 ${Names.Params.ASSIST_PHYSICAL}+${this.GSV('SPLUS_ASSIST_PHYSICAL')}%、 ${Names.Params.SPD}${this.GSV("SCALE_SPD")}%；持续${this.GSV('duration')}回合，受到伤害时延长1回合。`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        AudioManager.PlaySe(this.sound);
        for (let chr of action._targets) {
            BattleFlow.ApplyModifier(this, chr, 'Modifier_InnerEdge', this.GSV('duration'));
        }
    }
}

class Modifier_InnerEdge extends Modifier_ParamUp {
    GetDescription() {
        return `自身${Names.Params.CRITICAL_CHANCE}+${this.GSV('SPLUS_CRITICAL_CHANCE')}%、 ${Names.Params.ASSIST_NECRO}+${this.GSV('SPLUS_ASSIST_NECRO')}%、 ${Names.Params.ASSIST_PHYSICAL}+${this.GSV('SPLUS_ASSIST_PHYSICAL')}%、 ${Names.Params.SPD}${this.GSV("SCALE_SPD")}%；受到伤害时延长1回合。`;
    }

    OnTakeDamage(damage) {
        super.OnTakeDamage(damage);
        this._duration ++;
    }
}

class Skill_DarkLegacy extends Skill {
    get targeting() {
        return Skill.TARGET.SELF;
    }

    GetDescription() {
        return `每次造成或受到死灵属性伤害时，积累1层；回合开始时，若自身生命值<=25%,积累12层（一场战斗中限一次，最多12层）。每1层提高${this.GSV('critical_chance')}%的${Names.Params.CRITICAL_CHANCE}；行动开始时，若积累12层，消耗11层并使自己1回合内${Names.Params.CRITICAL_DAMAGE}+${this.GSV('SPLUS_CRITICAL_DAMAGE')}%、${Names.Params.ASSIST_PHYSICAL}+${this.GSV('SPLUS_ASSIST_PHYSICAL')}%、恢复法力${this.GSV('mana_recover')}点`
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        AudioManager.PlaySe(this.sound);
        for (let chr of action._targets) {
            BattleFlow.ApplyModifier(this, chr, 'Modifier_DarkLegacyReleased', 2);
            BattleFlow.ApplyDamage(this, chr, -this.GSV('mana_recover'), undefined, undefined, false, Damage.TYPE.MANA);
        }
    }
}
class Modifier_DarkLegacy extends Modifier {
    GetDescription() {
        return `每次造成或受到死灵属性伤害时，积累1层；回合开始时，若自身生命值<=25%,积累12层（一场战斗中限一次，最多12层）。每1层提高${this.GSV('critical_chance')}%的${Names.Params.CRITICAL_CHANCE}；回合开始时，若积累12层，消耗11层并使自己1回合内${Names.Params.CRITICAL_DAMAGE}+${this.GSV('SPLUS_CRITICAL_DAMAGE')}%、${Names.Params.ASSIST_PHYSICAL}+${this.GSV('SPLUS_ASSIST_PHYSICAL')}%、恢复法力${this.GSV('mana_recover')}点`;
    }
    _duration = -1;

    OnCreate() {
        super.OnCreate();
        this._stackMax = 12;
    }

    GetSecondaryStatusPlus() {
        let values = [];
        values[SecParamType.CRITICAL_CHANCE] = this.GSV('critical_chance') * this.stack;
        return values;
    }

    _used = false;
    OnBattleStart() {
        super.OnBattleStart();
        this._stack = 1;
        this._used = false;
    }

    OnTurnStart() {
        super.OnTurnStart();
        if(this.owner.hprate <= 25 && !this._used) {
            this.Stack(12);
            this._used = true;
        }
        if (this.stack >= 12) {
            this._stack = 1;
            BattleFlow.Reaction(this.owner.skills.find(sk=>sk.iname==='SK_TYRFINGR_DARK_LEGACY'), this.owner);
        }
    }

    OnTakeDamage(damage) {
        super.OnTakeDamage(damage);
        if (damage.element === Damage.ELEMENT.NECRO) {
            this.Stack();
        }
    }

    OnDealDamage(damage) {
        super.OnDealDamage(damage);
        if (damage.element === Damage.ELEMENT.NECRO) {
            this.Stack();
        }
    }
}
class Modifier_DarkLegacyReleased extends Modifier_ParamUp {
    GetDescription() {
        return `${Names.Params.CRITICAL_DAMAGE}+${this.GSV('SPLUS_CRITICAL_DAMAGE')}%、${Names.Params.ASSIST_PHYSICAL}+${this.GSV('SPLUS_ASSIST_PHYSICAL')}%`;
    }
}
class Skill_TerrorCharge extends Skill {

    GetDescription() {
        return `每次造成暴击时，积累1层恐惧充能(最多6层，最低1层)；每层提高${this.GSV('magical_resist_per_stack')}%的${Names.Params.RESIST_MAGICAL}；使用部分技能时，会消耗层数并加强效果。`
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }
}
class Modifier_TerrorCharge extends Modifier {
    GetDescription() {
        return `每次造成暴击时，积累1层恐惧充能(最多6层，最低1层)；每层提高${this.GSV('magical_resist_per_stack')}%的${Names.Params.RESIST_MAGICAL}；使用部分技能时，会消耗层数并加强效果。`
    }

    OnCreate() {
        super.OnCreate();
        this._stackMax = 6;
    }

    _lwfId = undefined;
    OnDealDamage(damage) {
        super.OnDealDamage(damage);
        if (damage.IsCritical()) {
            if (this.stack === 1) {
                this._lwfId = LWFUtils.StaticLwf('lwf/battleLwf/', this.skill.lwf, this.owner.battleSprite.x, this.owner.battleSprite.y);
            }
            this.Stack();
        }
    }

    Consume() {
        const amt = Math.min(this.stack - 1, 3);
        this.Stack(-amt);
        if (amt > 0 && this.stack === 1) {
            LWFUtils.RemoveLwf(this._lwfId);
            this._lwfId = undefined;
        }
        return amt;
    }

    OnBattleEnd() {
        super.OnBattleEnd();
        this._stack = 1;
        if (this._lwfId) {
            LWFUtils.RemoveLwf(this._lwfId);
            this._lwfId = undefined;
        }
    }

    GetSecondaryStatusPlus() {
        let values = [];
        values[SecParamType.RESIST_MAGICAL] = this.stack * this.GSV('magical_resist_per_stack');
        return values;
    }
}

class Skill_GranBaron extends Skill {
    GetDescription() {
        return `对目标敌人造成${this.GetSpecialValue('damage_scale')}%的死灵属性·斩攻击·物理伤害；消耗恐惧充能（直至留下1层，最多消耗3层），每层增加自身${this.GSV('ct_per_tc')}CT，并追加${this.GSV('damage_scale_per_tc')}%的火属性·斩攻击·物理伤害`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        AudioManager.PlaySe(this.sound);
        const value = this.owner.GetParam(ParamType.STR) * this.GSV('damage_scale')/100;
        const tc = this.owner.GetIntrinsicModifier('Modifier_TerrorCharge').Consume();
        for (const chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.NECRO, Damage.ATTACK_TYPE.SLASH);
            if (tc > 0) {
                BattleFlow.ApplyDamage(this, chr, tc * this.owner.GetParam(ParamType.STR) * this.GSV('damage_scale_per_tc')/100, Damage.ELEMENT.PYRO, Damage.ATTACK_TYPE.SLASH);
                LWFUtils.PlayLwf('lwf/battleLwf/', '811000158', chr.battleSprite.x, chr.battleSprite.y - 50);
            }
        }
        this.owner.AddCt(this.GSV('ct_per_tc') * tc);
    }
}

class Skill_GranBade extends Skill {
    GetDescription() {
        return `对目标敌人造成2次${this.GetSpecialValue('damage_scale')}%的无属性·突攻击·物理伤害；消耗恐惧充能（直至留下1层，最多消耗3层），每层增加自身${this.GSV('ct_per_tc')}CT，并追加目标3回合${Names.Params.RESIST_PHYSICAL}下降${this.GSV('phy_res_down_per_tc')}%`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        AudioManager.PlaySe(this.sound);
        const value = this.owner.GetParam(ParamType.STR) * this.GSV('damage_scale')/100;
        const tc = this.owner.GetIntrinsicModifier('Modifier_TerrorCharge').Consume();
        for (const chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.NONE, Damage.ATTACK_TYPE.PIERCE);
            if (tc > 0) {
                let mod = BattleFlow.ApplyModifier(this, chr, 'Modifier_GranBade', 3);
                if (mod) mod.SetTc(tc);
            }
        }
        this.owner.AddCt(this.GSV('ct_per_tc') * tc);
    }
}
class Modifier_GranBade extends Modifier {
    GetDescription() {
        return `${Names.Params.RESIST_PHYSICAL}${this.GSV('phy_res_down_per_tc') * this._tc}%`;
    }

    SetTc(v) {
        this._tc = v;
    }

    _tc = 1;
    GetSecondaryStatusPlus() {
        let values = [];
        values[SecParamType.RESIST_PHYSICAL] = -this._tc * this.GSV('phy_res_down_per_tc');
        return values;
    }
}

class Skill_GladiuCeleste extends Skill {
    GetDescription() {
        return `对目标敌人造成${this.GetSpecialValue('damage_scale')}%的死灵属性·斩攻击·物理伤害；消耗恐惧充能（直至留下1层，最多消耗3层），每层增加自身${this.GSV('ct_per_tc')}CT，并增加伤害倍率${this.GSV('bonus_scale_per_tc')}%`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        AudioManager.PlaySe(this.sound);
        let value = this.owner.GetParam(ParamType.STR) * this.GSV('damage_scale')/100;
        value += 0.5 * (this.costedCp - 100);
        const tc = this.owner.GetIntrinsicModifier('Modifier_TerrorCharge').Consume();
        for (const chr of action._targets) {
            if (tc > 0) {
                value += this.GSV('bonus_scale_per_tc') * tc;
            }
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.NECRO, Damage.ATTACK_TYPE.SLASH);

        }
        this.owner.AddCt(this.GSV('ct_per_tc') * tc);
    }
}