class Skill_TyrfingrAttack extends Skill {
    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        AudioManager.PlaySe(this.sound);
        let value = this.owner.GetParam(ParamType.STR) * this.GetSpecialValue('damage_scale')/100;
        for (const chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.NONE, Damage.ATTACK_TYPE.SLASH);
        }
    }
}

class Craft_TyrfingrDoubleSlash extends Craft {
    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        AudioManager.PlaySe(this.sound);
        let value = this.owner.GetParam(ParamType.STR) * this.GetSpecialValue('damage_scale')/100;
        for (const chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.NONE, Damage.ATTACK_TYPE.SLASH, true, Damage.TYPE.HP, true, this.GSV('extra_crit'));
        }
    }
}

class Craft_TyrfingrFlameSlash extends Craft {
    OnSkillAnimation(action) {
        super.OnSkillAnimation(action);
        this.owner.controller.SetSkillAnimation(this.animation);
    }

    OnSkillCost() {
        super.OnSkillCost();
        let hpcost = Math.min(this.owner.hp - 1, this.owner.mhp * this.GSV('hprate_cost')/100);
        this.owner.AddHp(-hpcost);
    }

    OnSkillEffect(action) {
        super.OnSkillEffect(action);
        this.PlayLwf(action._targets);
        this.PlaySound();
        let value = this.owner.GetParam(ParamType.STR) * this.GetSpecialValue('damage_scale')/100;
        for (const chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.NONE, Damage.ATTACK_TYPE.SLASH, true, Damage.TYPE.HP, true, this.GSV('extra_crit'));
        }
    }
}