class Modifier_IntUp extends Modifier {
	GetDescription() {
		return `智力提高100点`;
	}

	/**
	 * @returns {number[]}
	 */
	GetPrimaryStatusPlus() {
		let values = [];
		values[ParamType.INT] = 100;
		return values;
	}
}