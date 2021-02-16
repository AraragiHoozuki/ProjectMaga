class Skill_ManaVoidShield extends Skill {
    get targeting() {
        return Skill.TARGET.SELF
    }

    GetDescription() {
        return `使自身获得一个持续${this.GetSpecialValue('duration')}回合的护盾：受到魔法伤害时，伤害根据攻击者的法力值获得伤害减免，每缺失1%的法力获得${this.GetSpecialValue('reduce_pct_per_mana_void')}%的伤害减免，并对攻击者造成伤害`;
    }

    OnSkillAnimation(action) {
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(53, chr);
        }
    }

    OnSkillEffect(action) {
        for (let chr of action._targets) {
            BattleFlow.ApplyModifier(this, chr, 'Modifier_ManaVoidShield', this.GetSpecialValue('duration'));
        }
    }
}

class Modifier_ManaVoidShield extends Modifier {
    _duration  = 3;
    GetDescription() {
        return `受到魔法伤害时，伤害根据攻击者的法力值获得伤害减免，每缺失1%的法力获得${this.GetSpecialValue('reduce_pct_per_mana_void')}%的伤害减免，并对攻击者造成伤害`;
    }

    OnBeforeTakeDamage(damage) {
        super.OnBeforeTakeDamage(damage);
        const mana_pct = 100 - (damage.source.mana + damage.skill.manacost) * 100 / damage.source.mma;
        const reduce_pct = mana_pct * this.GetSpecialValue('reduce_pct_per_mana_void');
        damage.RegisterControl(0, -reduce_pct);
    }

    OnTakeDamage(damage) {
        super.OnTakeDamage(damage);
        const mana_pct = 100 - (damage.source.mana + damage.skill.manacost) * 100 / damage.source.mma;
        const scale = this.GetSpecialValue('scale_per_mana_void') * mana_pct;
        BattleFlow.PlayAnimation(106, damage.source);
        BattleFlow.ApplyDamage(this.skill, damage.source, this.owner.GetParam(ParamType.STR) * scale/100, Damage.ELEMENT.NONE, Damage.ATTACK_TYPE.MAGIC, false);
    }
}