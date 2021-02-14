class Modifier_ParamUp extends Modifier {
	GetPrimaryStatusPlus() {
		let values = [];
		for (let sp of this._skill.data.specials) {
			if (sp.name.substr(0,5)==='PLUS_' && ParamType[sp.name.substr(5)] >= 0) {
				values[ParamType[sp.name.substr(5)]] = this.GetSpecialValue(sp.name);
			}
		}
		return values;
	}

	GetPrimaryStatusScale() {
		let values = [];
		for (let sp of this._skill.data.specials) {
			if (sp.name.substr(0,6)==='SCALE_' && ParamType[sp.name.substr(6)] >= 0) {
				values[ParamType[sp.name.substr(6)]] = this.GetSpecialValue(sp.name);
			}
		}
		return values;
	}

	GetSecondaryStatusPlus() {
		let values = [];
		for (let sp of this._skill.data.specials) {
			if (sp.name.substr(0,6)==='SPLUS_' && SecParamType[sp.name.substr(6)] >= 0) {
				values[SecParamType[sp.name.substr(6)]] = this.GetSpecialValue(sp.name);
			}
		}
		return values;
	}
}

class Modifier_EquipParamUp extends Modifier_ParamUp {
	IsHidden() {
		return true;
	}
}