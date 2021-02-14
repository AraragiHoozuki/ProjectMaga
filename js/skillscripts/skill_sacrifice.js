class Skill_Sacrifice extends Skill {
    GetDescription() {
        return `◆治疗其他角色时，自身回复相当于治疗量${this.GetSpecialValue('self_heal_scale')}%的生命`;
    }
}

class Modifier_Sacrifice extends Modifier {
    _duration = -1;
    GetDescription() {
        return `◆治疗其他角色时，自身回复相当于治疗量${this.GetSpecialValue('self_heal_scale')}%的生命`;
    }

    OnDealHealing(damage) {
        super.OnDealHealing(damage);
        if (damage.victim !== this.owner) {
            BattleFlow.ApplyDamage(this.skill, this.owner, damage.value * this.GetSpecialValue('self_heal_scale')/100);
        }
    }
}