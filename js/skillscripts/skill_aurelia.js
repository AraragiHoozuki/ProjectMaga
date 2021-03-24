class Modifier_Persistance extends Modifier {
    GetDescription() {
        return `战斗开始时，赋予自身${this.GSV('ini_stack')}层【不屈】效果（不屈：根性，提高自身${Names.Params.RESIST_PHYSICAL}，发动根性时回复生命）`
    }

    OnBattleStart() {
        super.OnBattleStart();
        BattleFlow.StackModifier(this.skill, this.owner, 'Modifier_PersistanceStack', this.GSV('ini_stack'));
    }

    IsHidden() {
        return true;
    }

    _duration = -1;
}
class Modifier_PersistanceStack extends Modifier {
    GetDescription() {
        return `根性；每层使自身${Names.Params.RESIST_PHYSICAL}+${this.GSV('phy_res_up_per_stack')}；发动根性时消耗1层并回复${this.GSV('heal_rate')}%的生命`;
    }

    OnGuts(IsImmortalGuts) {
        super.OnGuts(IsImmortalGuts);
        BattleFlow.ApplyDamage(this.skill, this.owner, -this.owner.mhp * this.GSV('heal_rate')/100, undefined, undefined, false);
    }

    GetSecondaryStatusPlus() {
        let values = [];
        values[SecParamType.RESIST_PHYSICAL] = this.stack * this.GSV('phy_res_up_per_stack');
        return values;
    }

    OnCreate() {
        this._stackMax = this.GSV('ini_stack');
    }

    _flags = Modifier.FLAG.GUTS;
    _duration = -1;
}

class Modifier_Durandal extends Modifier {
    GetDescription() {
        return `将受到的超过自身最大生命${this.GSV('cap_hp_pct')}%的伤害变为等于生命的${this.GSV('cap_hp_pct')}%；回合开始时，回复相当于自身${Names.Params.DEF}${this.GSV('heal_def_pct')}%的生命`;
    }

    OnBeforeTakeDamage(damage) {
        super.OnBeforeTakeDamage(damage);
        damage.RegisterControl(0, 0, this.owner.mhp * this.GSV('cap_hp_pct')/100);
    }

    OnTurnStart() {
        super.OnTurnStart();
        BattleFlow.ApplyDamage(this.skill, this.owner, -this.owner.GetParam(ParamType.DEF) * this.GSV('heal_def_pct') / 100, undefined, undefined, false);
    }

    _duration = -1;
}

class Skill_DefendStance extends Skill {
    get targeting() {
        return Skill.TARGET.SELF;
    }

    GetDescription() {
        return `自身${Names.Params.DEF}+${this.GSV('SCALE_DEF')}%、${Names.Params.MND}+${this.GSV('SCALE_MND')}%、嘲讽，持续${this.GSV('duration')}回合`;
    }

    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action.targets);
        AudioManager.PlaySe(this.sound);
        for (const chr of action._targets) {
            BattleFlow.ApplyModifier(this, chr, 'Modifier_DefendStance', this.GSV('duration'));
        }
    }
}
class Modifier_DefendStance extends Modifier_ParamUp {
    GetDescription() {
        return '嘲讽；' + super.GetDescription();
    }
}

class Skill_HeavySlash extends Skill {
    GetDescription() {
        return `对目标造成无属性·斩攻击·物理伤害，附加流血效果`;
    }
}