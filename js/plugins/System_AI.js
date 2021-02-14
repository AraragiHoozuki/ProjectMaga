class AI {
	/**
	 * @param {EnemyChar} en
	 */
	static Normal(en) {
		BattleFlow.PushAction(en.activeSkills.randomChoice(), $gameParty.battleMembers.filter(c=>c.IsAlive()).randomChoice());
	}

	static DvasiaBossEasy(en) {
		if (en.turnCount < 3 ) {
			BattleFlow.PushAction(en.activeSkills.find(s => s.iname === 'SK_DARK_STRIKE'), $gameParty.battleMembers.filter(c=>c.IsAlive()).randomChoice());
		} else if (en.turnCount > 4) {
			BattleFlow.PushAction(en.activeSkills.find(s => s.iname === 'SK_DVASIA_SHOCKED'), en);
		} else {
			BattleFlow.PushAction(en.activeSkills.find(s => s.iname === 'SK_DVASIA_DARK_SPHERE'), $gameParty.battleMembers.filter(c=>c.IsAlive()).randomChoice());
		}
	}
}