class Skill_Polymorph extends Skill {
    GetDescription() {
        return `受到伤害时（无属性伤害除外），若伤害属性于上次受到的伤害相同，回复${this.GetSpecialValue('heal_scale')}%智慧地生命并发动强力反击，造成${this.GetSpecialValue('damage_scale')}%的无属性·无类型·物理伤害。`;
    }

    OnSkillAnimation(action) {
        for (let chr of action._targets) {
            BattleFlow.PlayAnimation(107, chr);
        }
    }

    OnSkillEffect(action) {
        const value = this.owner.GetParam(ParamType.STR) * this.GetSpecialValue('damage_scale')/100;
        for (let chr of action._targets) {
            BattleFlow.ApplyDamage(this, chr, value, Damage.ELEMENT.NONE);
        }
    }
}

class Modifier_Polymorph extends Modifier {
    _duration  = -1;
    GetDescription() {
        return '能根据环境快速调整自身状态，在不变地环境中会如鱼得水';
    }

    /** @type Damage.ELEMENT */
    _lastElement = undefined;
    OnTakeDamage(damage) {
        super.OnTakeDamage(damage);
        if (damage.element !== Damage.ELEMENT.NONE && damage.element === this._lastElement) {
            BattleFlow.PlayAnimation(42, this.owner);
            BattleFlow.ApplyDamage(this.skill, this.owner, -this.owner.GetParam(ParamType.INT)*this.GetSpecialValue('heal_scale')/100);
            BattleFlow.Reaction(this.skill, damage.source);
        }
        this._lastElement = damage.element;
    }

    OnBattleStart() {
        super.OnBattleStart();
        this._lastElement = undefined;
    }
}