class Modifier_ParamUp extends Modifier {
	GetDescription() {
		let str = '';
		const psp = this.GetPrimaryStatusPlus();
		const pss = this.GetPrimaryStatusScale();
		for(const key of Object.keys(ParamType)) {
			if (psp[ParamType[key]]) {
				str += Names.Params[key];
				if (psp[ParamType[key]] > 0) str += '+';
				str += psp[ParamType[key]];
				str += ', ';
			}
			if (pss[ParamType[key]]) {
				str += Names.Params[key];
				if (pss[ParamType[key]] > 0) str += '+';
				str += pss[ParamType[key]];
				str += '%, ';
			}
		}
		const ssp = this.GetSecondaryStatusPlus();
		for(const key of Object.keys(SecParamType)) {
			if (ssp[SecParamType[key]]) {
				str += Names.Params[key];
				if (ssp[SecParamType[key]] > 0) str += '+';
				str += ssp[SecParamType[key]];
				str += ', ';
			}
		}
		if (str.endsWith(', ')) {
			str = str.substring(0, str.length - 2);
		}
		return str;
	}

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
	_duration = -1;
	IsHidden() {
		return true;
	}
}