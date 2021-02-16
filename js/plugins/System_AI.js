class AI {
	/**
	 *
	 * @param {EnemyChar} en
	 * @param {string} iname
	 * @param {Character} target
	 */
	static UseSkill(en, iname, target = undefined) {
		const skill = en.activeSkills.find(s => s.iname === iname);
		if (target === undefined) {
			if (skill.IsForSelf()) {
				target = en;
			} else if (skill.IsForAlly()) {
				target = $gameTroop.battleMembers.filter(c=>c.IsAlive()).randomChoice();
			} else {
				target = $gameParty.battleMembers.filter(c=>c.IsAlive()).randomChoice()
			}
		}
		BattleFlow.PushAction(skill, target);
	}
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

	static MechaSphere(en) {
		switch (true) {
			case (en.turnCount - 4)%5 === 0:
				BattleFlow.PushAction(en.activeSkills.find(s => s.iname === 'SK_MANA_VOID_SHIELD'), en);
				break;
			default:
				BattleFlow.PushAction(en.activeSkills.find(s => s.iname === 'SK_RUSH_STRIKE'), $gameParty.battleMembers.filter(c=>c.IsAlive()).randomChoice());
		}
	}

	static NazaretSaber(en) {
		if ($gameTroop.battleMembers.filter(en => en.IsAlive()).length === 1&&!en.aiFlags['sole']) {
			AI.UseSkill(en, 'SK_GOD_WITHIN');
			en.SetAiFlag('sole', 1);
		} else if (en.HasAcquiredModifier('Modifier_ParamUp', en.activeSkills.find(s => s.iname === 'SK_GOD_WITHIN'))) {
			AI.UseSkill(en, 'SK_SLASH');
		} else {
			switch(en.turnCount%7) {
				case 1:
					AI.UseSkill(en, 'SK_BRAVE');
					break;
				default:
					AI.UseSkill(en, 'SK_SLASH');
			}
		}
	}

	static NazaretHealer(en) {
		switch(en.turnCount%7) {
			case 3: case 5:
				AI.UseSkill(en, 'SK_SUPER_REGENERATE', $gameTroop.MinParamByName('hprate'));
				break;
			default:
				AI.UseSkill(en, 'SK_HEALING_RAIN');
		}
	}
}