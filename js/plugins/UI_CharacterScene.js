class CharacterListScene extends MenuBaseScene {
	get headerText() {return '编队';}

	CreateContents() {
		super.CreateContents();
		this.CreateCharList();
		this.CreatePartySlots();
	}

	CreatePartySlots() {
		this._slots = this.addChild(new PIXI.Container());
		let [x, y, w, h] = [200, this.headerHeight, 150, 260 - this.headerHeight];
		x = Graphics.width/2 - w * 3 /2;
		for (let i = 0; i < 3; i++) {
			const psl = new PartySlot(x, y, w, h, i);
			this._slots.addChild(psl);
			x += w;
		}
		this.ChangeSlotsVisible(false);
	}

	CreateCharList() {
		this._chrList = this.addChild(new VPPartyList(0, 260, Graphics.width, Graphics.height - 260, new Paddings(8), Spreading.Presets.TEAL_BACK));
		for (const chr of $gameParty.members) {
			const item = new VPItemCharacter(160, this._chrList.height - 16, chr)
			this._chrList.AddItem(item);
			item.OnLongPress.add(() => {
				this._chrList.EnableXScroll(false);
				for (const it of this._chrList.items) {if (it!==item) it.Deactivate();}
				AudioManager.PlaySe('$btn_heavy_click');
				this.ChangeSlotsVisible(true);
			});
			item.OnDragEnd.add(() => {
				this._chrList.EnableXScroll(true);
				this.DragToSlot(item);
				this.ChangeSlotsVisible(false);
				for (const it of this._chrList.items) {if (it!==item) it.Activate();}
			});
			item.OnClick.add(() => {
				CharacterDetailScene.character = item.chr;
				SceneManager.push(CharacterDetailScene);
			});
		}
		this._chrList.EnableXScroll(true);
	}

	ChangeSlotsVisible(visible) {
		if (visible === true) {
			for(const dp of this._slots.children) {
				dp.visible = true;
			}
		} else {
			for(const dp of this._slots.children) {
				if (dp.IsEmpty()) dp.visible = false;
			}
		}
	}

	/**
	 * 
	 * @param {VPItemCharacter} item 
	 */
	DragToSlot(item) {
		const slots = this._slots.children;
		for (const slot of slots) {
			const pos = slot.worldTransform.applyInverse(new Point(TouchInput.x, TouchInput.y));
			if (pos.x >= 0 && pos.x <= slot.width && pos.y >= 0 && pos.y <= slot.height) {
				$gameParty.SetBattleMember(item.chr, slot.index);
			}
		}
		for (const slot of slots) {
			slot.RefreshSpine();
		}
	}
}

class PartySlot extends PIXI.Container {
	constructor(x, y, w, h, index) {
		super();
		this.x = x;
		this.y = y;
		this._width = w;
		this._height = h;
		this._index = index;
		this.CreateFrame();
		this.RefreshSpine();
	}

	get width() {return this._width;}
    get height() {return this._height;}

	/**@type SpineCtrl */
	_spct;
	_index;

	get index() {return this._index;}

	CreateFrame() {
		this._frame = new Spreading(0, 0, this.width, this.height, Spreading.Presets.PARTY_SLOT_EMPTY, 1);
		this.addChild(this._frame);
	}

	RefreshSpine() {
		const chr = $gameParty.battleMembers[this._index];
		if (this._spct) {
			if (chr) {
				if (this._spct.chr === chr) {
					return;
				} else {
					this.removeChild(this._spct);
					this._spct = this.addChild(new SpineCtrl(chr));
					this._spct.x = this.width/2; this._spct.y = this.height - 15;
				}
			} else {
				this.removeChild(this._spct);
				this._spct = undefined;
			}
		} else if (chr) {
			this._spct = this.addChild(new SpineCtrl(chr));
			this._spct.x = this.width/2; this._spct.y = this.height - 15;
		}
	}

	IsEmpty() {
		return $gameParty.battleMembers[this._index] === undefined;
	}
}

class VPPartyList extends ViewPortHorizontal {
	ConfigContentArea() {
        this._contentArea.x = this._paddings.left;
        this._contentArea.y = this._paddings.top;
        // const mask = new PIXI.Graphics()
        //     .beginFill(0xFFFFFF)
        //     .drawRect(this._paddings.left, this._paddings.top, this._width - this._paddings.left - this._paddings.right, this._height - this._paddings.top - this._paddings.bottom)
        //     .endFill();
        // this.addChild(mask);
        // this._contentArea.mask = mask;
        // this._scroller.mask = mask;
    }
}

class VPItemCharacter extends Draggable {
	/**
	 * 
	 * @param {number} w 
	 * @param {number} h 
	 * @param {PlayerChar} chr 
	 */
	constructor(w, h, chr) {
		super(0, 0, w, h);
		this._chr = chr;
		this.CreateFace();
		this.CreateInfoArea();
		this.CreateFrame();
		this.Activate();
	}

	static FacePads = new Paddings(8);
	static InfoAreaY = 300;

	get chr() {return this._chr;}

	_faceSprite;
	_infoArea;
	_nameText;
	_frame;
	_pressedFrame;

	CreateFace() {
		this._faceSprite = this.addChild(new PIXI.Sprite(PIXI.Texture.EMPTY));
		this._faceSprite.x = VPItemCharacter.FacePads.left;
		this._faceSprite.y = 6;
		DataUtils.Load(`img/faces/${this._chr.model}.png`).then((res) => {
			this._faceSprite.texture = new PIXI.Texture(new PIXI.BaseTexture(res.data));
			this._faceSprite.texture.frame = new PIXI.Rectangle(0, 0, this._faceSprite.texture.width, this._faceSprite.texture.height - 82);
			this._faceSprite.scale.set((this.width - VPItemCharacter.FacePads.left - VPItemCharacter.FacePads.right)/res.texture.width);
		});
	}

	CreateInfoArea() {
		this._infoArea = this.addChild(new Spreading(VPItemCharacter.FacePads.left, 
			VPItemCharacter.InfoAreaY, this.width - VPItemCharacter.FacePads.left - VPItemCharacter.FacePads.right, 
			this.height - VPItemCharacter.FacePads.top - VPItemCharacter.FacePads.bottom - VPItemCharacter.InfoAreaY + 5,
			Spreading.Presets.ANADEN_CHAR_INFO_AREA, 1));
		this._nameText = this.addChild(new PIXI.Text(this._chr.name, TextStyles.KaiWhiteSmall));
		this._nameText.anchor.set(0.5);
		this._nameText.position.set(this.width/2, VPItemCharacter.InfoAreaY + 20);
	}

	CreateFrame() {
		this._frame = this.addChild(new Spreading(0, 0, this.width, this.height, Spreading.Presets.ANADEN_CHR_SLOT_FRAME, 1));
		this._pressedFrame = this.addChild(new Spreading(0, 0, this.width, this.height, Spreading.Presets.ANADEN_CHR_SLOT_FRAME_PRESSED, 1));
	}

	update() {
		super.update();
		if (this.IsPressed()) {
			this._pressedFrame.visible = true;
		} else {
			this._pressedFrame.visible = false;
		}
		if (TouchInput.isReleased()&&this._isDragging) {
			this.ProcessRelease();
		}
	}
}


class CharacterDetailScene extends MenuBaseScene {
	/** @type PlayerChar */
	static character;
	/**
	 * window width
	 * @type {number}
	 */
	get WW() {return 640;}
	get headerText() {return '角色信息';}
	get tabHeight() {return 64;}

	CreateContents() {
		super.CreateContents();
		this.CreateTatie();
		this.CreateTabView();
	}

	CreateTatie() {
		this._tatie = this.addChild(new PIXI.Sprite(PIXI.Texture.EMPTY));
		DataUtils.Load('img/taties/' + CharacterDetailScene.character.model + '.png').then((res)=>{
			this._tatie.texture = new PIXI.Texture(new PIXI.BaseTexture(res.data));
			this._tatie.scale.set(Graphics.width*0.6/this._tatie.texture.width);
		});
	}

	static TabNames = ['属性', '职业', '技能', '装备', '其他'];

	CreateTabView() {
		this._tabView = new TabViewLR(Graphics.width - Graphics.width/1.6, this.headerHeight, Graphics.width/1.6, Graphics.height - this.headerHeight, 80);
		this.addChild(this._tabView);
		const x = 80;
		const w = this._tabView.width - 80;
		const h = this._tabView.height;

		

		const vp_stats = new VPStats(x, 0, w, h, new Paddings(10), {path: undefined, paddings: [0]}, 1); vp_stats.SetCharacter(CharacterDetailScene.character); vp_stats.EnableYScroll(true);
		const vp_classes = this._vp_classes = new VPClasses(x, 0, w, h, new Paddings(10), {path: undefined, paddings: [0]}, 1); vp_classes.SetCharacter(CharacterDetailScene.character, this.RefreshClassInfo.bind(this)); vp_classes.EnableYScroll(true);
		this._tabView.Setup(CharacterDetailScene.TabNames, [
			vp_stats,
			vp_classes
		]);

		this._classInfo = new VPClassInfo(0, this.headerHeight, this._tabView.x, h, new Paddings(12), Spreading.Presets.ANADEN_BACK, 1);
		this.addChild(this._classInfo);
	}

	RefreshClassInfo(iname) {
		this._classInfo.SetClass(CharacterDetailScene.character, iname);
		this._classInfo.visible = true;
	}

	update() {
		super.update();
		if (!this._vp_classes.visible) this._classInfo.visible = false;
	}
}

class VPStats extends ViewPortVertical {
	/**
	 * @param {Character} chr 
	 */
	SetCharacter(chr) {
		this._chr = chr;
		this.CreatePrimaryStats();
	}

	CreatePrimaryStats() {
		this.AddItem(new TextArea('主要属性', TextStyles.Restyle(TextStyles.SmallBlack, {fontSize: 24}), new Paddings(4,0), 0, 0, this.width, 0, Spreading.Presets.TEAL_BACK, 1));
		for (let i = 0; i < Object.keys(ParamType).length; i++) {
			this.AddItem(new ParamEntry(this._chr, i, false));
		}
		this.AddItem(new TextArea('额外属性', TextStyles.Restyle(TextStyles.SmallBlack, {fontSize: 24}), new Paddings(4,0), 0, 0, this.width, 0, Spreading.Presets.PINK_BACK, 1));
		for (let i = 0; i < Object.keys(SecParamType).length; i++) {
			this.AddItem(new ParamEntry(this._chr, i, true));
		}
	}
}
class ParamEntry extends PIXI.Container {
	/**
	 * 
	 * @param {Character} chr 
	 * @param {number} index 
	 * @param {boolean} isSecondary
	 */
	constructor(chr, index, isSecondary = false) {
		super();
		this._chr = chr;
		this._index = index;
		this._isSecondary = isSecondary === true;
		this.CreateText();
	}

	get name() {
		if (!this._isSecondary) {
			return Names.Params[Object.keys(ParamType)[this._index]];
		} else {
			return Names.Params[Object.keys(SecParamType)[this._index]];
		}
	}

	get value() {
		return this._chr.GetParam(this._index, this._isSecondary);
	}

	CreateText() {
		this._nameText = this.addChild(new PIXI.Text(this.name, TextStyles.Restyle(TextStyles.SmallBlack, {fontSize: 24})));
		this._numberText = this.addChild(new PIXI.Text(0, TextStyles.Restyle(TextStyles.SmallBlack, {fontSize: 24})));
		this._numberText.x = 200;
	}

	update() {
		this._numberText.text = this.value;
	}
}

class VPClasses extends ViewPortVertical {
	/**
	 * @param {Character} chr 
	 * @param {Function} func 
	 */
	 SetCharacter(chr, func) {
		this._chr = chr;
		this.CreateClassEntries(func);
	}

	CreateClassEntries(func) {
		for(const iname of this._chr.data.classes) {
			const entry = new ClassEntry(0, 0, this.contentWidth, 100, this._chr, iname);
			entry._btn.OnClick.add(() => func(iname));
			this.AddItem(entry);
		}
	}
}

class ClassEntry extends PIXI.Container {
	constructor(x, y, w, h, chr, iname) {
		super();
		this.x = x;
		this.y = y;
		this._width = w;
		this._height = h;
		this._chr = chr;
		this._classIname = iname;
		this.CreateButton();
		this.CreateStars();
		this.CreateNameAndIcon();
		this.CreateEquipIndicator();
	}

	get width() {return this._width;}
    get height() {return this._height;}

	get btn() {return this._btn;}

	CreateButton() {
		this._btn = this.addChild(new Button(0, 0, this.width, this.height, '', ...Button.Presets.ANADEN_OCT_A));
		
	}

	CreateStars() {
		this._stars;
		const size = 36;
		const ct = new PIXI.Container();
		for (let i = 0; i < 5; i++) {
			const s = new PIXI.Sprite(PIXI.Texture.EMPTY);
			s.x = i * size;
			ct.addChild(s);
			DataUtils.Load(`img/ui/other/${i<this._chr.GetClassRank(this._classIname)?'star_on':'star_off'}.png`).then((res) => {
				const texture = new PIXI.Texture(new PIXI.BaseTexture(res.data));
				s.texture = texture;
				s.scale.set(size/texture.width, size/texture.height);
			});
		}
		this.addChild(ct);
		ct.x = this.width * 2/3 - size*5/2;
		ct.y = this.height * 1/3 - size/2;
	}

	CreateNameAndIcon() {
		const t = new PIXI.Text($dataClasses[this._classIname].name, TextStyles.KaiBtnBlack);
		this.addChild(t);
		t.anchor.set(0.5);
		t.x = this.width * 2/3;
		t.y = this.height * 2/3;

		this._icon = new PIXI.Sprite(PIXI.Texture.EMPTY);
		this.addChild(this._icon);
		this._icon.anchor.set(0.5);
		this._icon.x = this.width * 1/4; this._icon.y = this.height/2;
		DataUtils.Load(`img/icons/class/${$dataClasses[this._classIname].icon}.png`).then((res) => {
			const tex = new PIXI.Texture(new PIXI.BaseTexture(res.data));
			this._icon.texture = tex;
		});
	}

	CreateEquipIndicator() {
		this._eqpIdc = new PIXI.Sprite(PIXI.Texture.EMPTY);
		this._eqpIdc.anchor.set(0.5);
		this._eqpIdc.scale.set(0.8);
		this._eqpIdc.position.set(60, this.height/2);
		this.addChild(this._eqpIdc);

		DataUtils.Load('img/ui/other/checkbox_on.png').then(res => this._idcOnTex = new PIXI.Texture(new PIXI.BaseTexture(res.data)));
		DataUtils.Load('img/ui/other/checkbox_off.png').then(res => this._idcOffTex = new PIXI.Texture(new PIXI.BaseTexture(res.data)));
	}

	update() {
		this._btn.update();
		if (this._idcOnTex && this._classIname === this._chr.currentClass.iname) this._eqpIdc.texture = this._idcOnTex;
		else if (this._idcOffTex && this._classIname !== this._chr.currentClass.iname) this._eqpIdc.texture = this._idcOffTex;
	}
}

class VPClassInfo extends ViewPortVertical {
	/**
	 * 
	 * @param {Character} chr 
	 * @param {string} classIname 
	 */
	SetClass(chr, classIname) {
		this._chr = chr;
		this._class = $dataClasses[classIname];
		this.contentArea.Clear();
		this.CreateContents();
	}

	CreateContents() {
		this.CreateTitle();
		this.CreateReqParam();
		this.CreateBonusParam();
		this.CreateFixedSkills();
	}

	CreateTitle() {
		const sp = new PIXI.Sprite(PIXI.Texture.EMPTY);
		sp.anchor.set(0.5, 0);
		sp.x = this.width / 2;
		sp.height = 128;
		this.AddItem(sp);
		DataUtils.Load(`img/icons/class/${this._class.icon}.png`).then((res) => {
			const tex = new PIXI.Texture(new PIXI.BaseTexture(res.data));
			sp.texture = tex;
		});
		const t = new PIXI.Text(this._class.name, TextStyles.KaiBtnBlack);
		t.anchor.set(0.5, 0);
		t.x = this.width/2;
		this.AddItem(t);
	}

	CreateReqParam() {
		this.AddItem(new TextArea('需求属性', TextStyles.SmallBlack, new Paddings(4), 0, 0, this.contentWidth, 0, Spreading.Presets.TEAL_BACK, 1));
		let text = '';
		const names = Object.keys(ParamType);
		for (let i = 0; i< names.length; i++) {
			text += `${Names.Params[names[i]]}: ${this._class.req_params[i]}`.padEnd(10);
			if (i===3) text += '\n';
		}
		const sp = new PIXI.Text(text, TextStyles.SmallBlack);
		sp.x = 4;
		this.AddItem(sp);
	}

	CreateBonusParam() {
		this.AddItem(new TextArea('加成属性', TextStyles.SmallBlack, new Paddings(4), 0, 0, this.contentWidth, 0, Spreading.Presets.TEAL_BACK, 1));
		let text = '';
		const names = Object.keys(ParamType);
		for (let i = 0; i< names.length; i++) {
			text += `${Names.Params[names[i]]}: ${this._class.bonus_params[i]}%`.padEnd(10);
			if (i===3) text += '\n';
		}
		const sp = new PIXI.Text(text, TextStyles.SmallBlack);
		sp.x = 4;
		this.AddItem(sp);
	}

	CreateFixedSkills() {
		this.AddItem(new TextArea('固有技能', TextStyles.SmallBlack, new Paddings(4), 0, 0, this.contentWidth, 0, Spreading.Presets.TEAL_BACK, 1));
		for (let i = 0; i < this._class.fixed_skills.length; i++) {
			const data = $dataSkills[this._class.fixed_skills[i]];
			const text = `${data.name}`
			this.AddItem(
				new TextArea(Skill.PreviewSkillDescription(data), TextStyles.SmallBlack, new Paddings(4), 0, 0, this.contentWidth, 0, Spreading.Presets.TEAL_BACK, 1)
			);
		}
		
	}

}