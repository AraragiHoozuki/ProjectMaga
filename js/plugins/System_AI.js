class AI {
	/**
	 *
	 * @param {EnemyChar} en
	 * @param {string} iname
	 * @param {Character} target
	 */
	static UseSkill(en, iname, target = undefined) {
		const skill = en.activeSkills.find(s => s.iname === iname);
		if (!skill) throw new Error(`Skill ${iname} was not found in ${en.name}`);
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

	static StartTrainer(en) {
		if (en.turnCount === 10) {
			AI.UseSkill(en, 'SK_ENEMY_HP_TO_24');
		} else {
			AI.UseSkill(en, 'SK_SLASH');
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
		if ($gameTroop.battleMembers.filter(en => en.IsAlive()).length === 1) {
			AI.UseSkill(en, 'SK_SUICIDE');
		} else  {
			switch(en.turnCount%7) {
				case 3: case 5:
					AI.UseSkill(en, 'SK_SUPER_REGENERATE', $gameTroop.MinParamByName('hprate'));
					break;
				default:
					AI.UseSkill(en, 'SK_HEALING_RAIN');
			}
		}
	}
}