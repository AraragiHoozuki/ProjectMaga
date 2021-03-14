class Skill_NormalModifier extends Skill {
    GetDescription() {
        return this.intrinsicModifiers[0].GetDescription();
    }
}

class Modifier_NoneCriticalImmune extends Modifier {
    GetDescription() {
        return `受到的非暴击伤害下降${this.GSV('damage_reduce')}%`;
    }

    OnBeforeTakeDamage(damage) {
        super.OnBeforeTakeDamage(damage);
        if (!damage.IsCritical()) {
            damage.RegisterControl(0, -this.GSV('damage_reduce'));
        }
    }
}