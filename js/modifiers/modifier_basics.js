class Modifier_Bleeding extends Modifier {
    GetDescription() {
        return `每次行动结束时受到物理伤害`
    }

    OnActionEnd(action) {
        super.OnActionEnd(action);
        LWFUtils.PlayLwf('lwf/battleLwf/', '810000029', this.owner.battleSprite.x, this.owner.battleSprite.y);
        AudioManager.PlaySe('se_at_pain');
    }
}