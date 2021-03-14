class Modifier_SpeculumAqua extends Modifier {
    GetDescription() {
        return `暴击时，每点${Names.Params.CRITICAL_CHANCE}额外增加${this.GSV('scale_per_chance')}%伤害，并增加自身${this.GSV('ct_on_critical')}点行动值`;
    }

    OnBeforeDealDamage(damage) {
        super.OnBeforeDealDamage(damage);
        if(damage.IsCritical()) {
            damage.RegisterControl(0, this.owner.GetParam(SecParamType.CRITICAL_CHANCE, true) * this.GSV('scale_per_chance'));
        }
    }

    OnDealDamage(damage) {
        super.OnDealDamage(damage);
        if (damage.IsCritical()) {
            this.owner.AddCt(this.GSV('ct_on_critical'));
        }
    }

    _duration = -1;
}

class Modifier_FatalStrike extends Modifier {
    GetDescription() {
        return `造成伤害时，若没有暴击，叠加1层本状态。每层使${Names.Params.CRITICAL_DAMAGE}+${this.GSV('cri_dmg_per_stack')}，并使暴击时伤害无视目标${this.GSV('ignore_def_rate')}%的防御。暴击后层数重置为1`;
    }

    OnDefPiercing(damage) {
        super.OnDefPiercing(damage);
        if (damage.IsCritical()) {
            damage.AddDefPiercing(this.GSV('ignore_def_rate'));
        }
    }

    OnDealDamage(damage) {
        super.OnDealDamage(damage);
        if (damage.IsCritical()) {
            this.Stack(1 - this.stack);
        } else {
            this.Stack();
        }
    }

    GetSecondaryStatusPlus() {
        let values = [];
        values[SecParamType.CRITICAL_DAMAGE] = this.stack * this.GSV('cri_dmg_per_stack');
        return values;
    }

    _duration = -1;
    _stackMax = 99;
}

class Skill_IskaSideChange extends Skill {
    GetDescription() {
        return `在【苍】、【凛】两种形态间切换。（苍：${Names.Params.CRITICAL_CHANCE}提高，${Names.Params.CRITICAL_DAMAGE}降低；；凛：${Names.Params.CRITICAL_CHANCE}降低，${Names.Params.CRITICAL_DAMAGE}提高），初次使用时效果为进入【凛】形态`;
    }

    get targeting() {
        return Skill.TARGET.SELF;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        this.PlaySound();
        for (const chr of action._targets) {
            let mod = chr.GetAcquiredModifier('Modifier_IskaRinStance');
            if (mod) {
                mod.Remove();
                BattleFlow.ApplyModifier(this, chr, 'Modifier_IskaAoiStance');
            } else {
                mod = chr.GetAcquiredModifier('Modifier_IskaAoiStance');
                if (mod) mod.Remove();
                BattleFlow.ApplyModifier(this, chr, 'Modifier_IskaRinStance');
            }
        }
    }
}
class Modifier_IskaAoiStance extends Modifier {
    GetDescription() {
        return `【苍】：${Names.Params.CRITICAL_CHANCE}+${this.GSV('aoi_chance_up')}，${Names.Params.CRITICAL_DAMAGE}-${this.GSV('aoi_dmg_down')}`;
    }

    GetSecondaryStatusPlus() {
        let values = [];
        values[SecParamType.CRITICAL_CHANCE] = this.GSV('aoi_chance_up');
        values[SecParamType.CRITICAL_DAMAGE] = -this.GSV('aoi_dmg_down');
        return values;
    }
    _duration = -1;
}
class Modifier_IskaRinStance extends Modifier {
    GetDescription() {
        return `【凛】：${Names.Params.CRITICAL_CHANCE}-${this.GSV('rin_chance_down')}，${Names.Params.CRITICAL_DAMAGE}+${this.GSV('rin_dmg_up')}`;
    }

    GetSecondaryStatusPlus() {
        let values = [];
        values[SecParamType.CRITICAL_CHANCE] = -this.GSV('rin_chance_down');
        values[SecParamType.CRITICAL_DAMAGE] = this.GSV('rin_dmg_up');
        return values;
    }
    _duration = -1;
}

class Skill_Issen extends Skill_KatanaSlash {
    GetDescription() {
        return `对目标造成${this.GSV('damage_scale')}%的无属性·斩攻击·物理伤害`;
    }
}

class Skill_Ukenagasu extends Skill {
    GetDescription() {
        return `解除【澄镜】状态，进入【受流】状态：${Names.Params.SPD}-${this.GSV('spd_down_pct')}%，受到物理伤害时反击，反击容易暴击，造成无属性·斩攻击·物理伤害，持续6回合`
    }

    get targeting() {
        return Skill.TARGET.SELF;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        for (const chr of action._targets) {
            this.PlayLwf(action._targets);
            this.PlaySound();
            const mod = chr.GetAcquiredModifier('Modifier_BladeMirror');
            if (mod) mod.Remove();
            BattleFlow.ApplyModifier(this, chr, 'Modifier_Ukenagasu', 6);
        }
    }
}
class Modifier_Ukenagasu extends Modifier {
    GetDescription() {
        return `受流`
    }
    OnTakeDamage(damage) {
        super.OnTakeDamage(damage);
        if (damage.IsPhysical()) {
            const skill = new Skill_UkenagasuCounter('SK_ISKA_UKENAGASU_COUNTER', this.owner);
            skill.SetLevel(this.skill.level);
            BattleFlow.Reaction(skill, damage.source);
        }
    }
    GetPrimaryStatusScale() {
        let values = [];
        values[ParamType.SPD] = -this.GSV('spd_down_pct');
        return values;
    }
    _duration = -1;
}
class Skill_UkenagasuCounter extends Skill {
    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        this.PlaySound();
        let value = this.owner.GetParam(ParamType.STR) * this.GetSpecialValue('damage_scale')/120 + this.owner.GetParam(ParamType.SPD) * this.GetSpecialValue('damage_scale')/40 ;
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.NONE, Damage.ATTACK_TYPE.SLASH, true, Damage.TYPE.HP, true, 35, 0);
        }
    }
}

class Skill_BladeMirror extends Skill {
    GetDescription() {
        return `解除【受流】状态，进入【澄镜】状态：${Names.Params.DEF}-${this.GSV('def_down_pct')}%，受到魔法伤害时反击，反击无视部分防御，造成无属性·斩攻击·物理伤害，持续6回合`
    }

    get targeting() {
        return Skill.TARGET.SELF;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        for (const chr of action._targets) {
            this.PlayLwf(action._targets);
            this.PlaySound();
            const mod = chr.GetAcquiredModifier('Modifier_Ukenagasu');
            if (mod) mod.Remove();
            BattleFlow.ApplyModifier(this, chr, 'Modifier_BladeMirror', 6);
        }
    }
}
class Modifier_BladeMirror extends Modifier {
    GetDescription() {
        return `澄镜`
    }
    OnTakeDamage(damage) {
        super.OnTakeDamage(damage);
        if (damage.IsPhysical()) {
            const skill = new Skill_BladeMirrorCounter('SK_ISKA_BLADEMIRROR_COUNTER', this.owner);
            skill.SetLevel(this.skill.level);
            BattleFlow.Reaction(skill, damage.source);
        }
    }
    GetPrimaryStatusScale() {
        let values = [];
        values[ParamType.DEF] = -this.GSV('def_down_pct');
        return values;
    }
    _duration = -1;
}
class Skill_BladeMirrorCounter extends Skill {
    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        this.PlaySound();
        let value = this.owner.GetParam(ParamType.STR) * this.GetSpecialValue('damage_scale')/120 + this.owner.GetParam(ParamType.SPD) * this.GetSpecialValue('damage_scale')/40 ;
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.NONE, Damage.ATTACK_TYPE.SLASH, true, Damage.TYPE.HP, true, 0, 50);
        }
    }
}

class Skill_CielBreakSlash extends Skill {
    GetDescription() {
        return `对全体敌人造成5次${this.GetSpecialValue('damage_scale')}%的无属性·斩攻击·物理伤害，无视80%防御`;
    }

    get targeting() {
        return Skill.TARGET.AOE;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        if (!this._effectPlayed) {
            this.PlayLwf(action._targets);
            this.PlaySound();
            this.SetEffectPlayed();
        }
        let value = this.owner.GetParam(ParamType.STR) * this.GetSpecialValue('damage_scale')/120 + this.owner.GetParam(ParamType.SPD) * this.GetSpecialValue('damage_scale')/40;
        if (this.costedCp >100) value += (0.2 * (this.costedCp - 100)/100 * value);
        for (const chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.NONE, Damage.ATTACK_TYPE.SLASH, true, undefined, true, 0, this.costedCp>=200?100:80);
        }
    }
}