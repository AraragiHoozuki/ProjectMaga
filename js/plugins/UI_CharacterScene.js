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

	static TabNames = ['属性', '技能', '装备', '其他', '其他2'];

	CreateTabView() {
		this._tabView = new TabViewLR(Graphics.width - Graphics.width/1.6, this.headerHeight, Graphics.width/1.6, Graphics.height - this.headerHeight, 80);
		this.addChild(this._tabView);
		const x = 80;
		const w = this._tabView.width - 80;
		const h = this._tabView.height;
		const vp_stats = new VPStats(x, 0, w, h, new Paddings(10), {path: undefined, paddings: [0]}, 1); vp_stats.SetCharacter(CharacterDetailScene.character);
		this._tabView.Setup(CharacterDetailScene.TabNames, [
			vp_stats
		]);
	}
}

class VPStats extends ViewPortVertical {
	/**
	 * 
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