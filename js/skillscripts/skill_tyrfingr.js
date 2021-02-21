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
        if (this.IsEffectGlobal()) {
            LWFUtils.PlayLwf('lwf/battleLwf/', this.lwf, 0, 0);
        } else {
            for (let chr of action._targets) {
                LWFUtils.PlayLwf('lwf/battleLwf/', this.lwf, chr.battleSprite.x, chr.battleSprite.y - 50);
            }
        }
        AudioManager.PlaySe(this.sound);
        let value = this.owner.GetParam(ParamType.STR) * this.GetSpecialValue('damage_scale')/100;
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.NECRO, Damage.ATTACK_TYPE.SLASH);
        }
    }
}