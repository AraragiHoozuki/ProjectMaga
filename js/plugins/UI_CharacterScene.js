class CharacterListScene extends MenuBaseScene {
	get headerText() {return '角色列表';}

	CreateContents() {
		super.CreateContents();
		this.CreateCharList();
	}

	CreateCharList() {
		this._charListWindow = new CharacterListWindow(0, this.headerHeight, Graphics.width, Graphics.height - this.headerHeight, '', 0, undefined, 'wd_back_noframe');
		this.addChild(this._charListWindow);
		this._charListWindow.MakeList();
		this._charListWindow.Activate();
		this._charListWindow.SetHandler(this._charListWindow.OnClick, this.OnCharacterClick.bind(this));
	}

	OnCharacterClick() {
		CharacterDetailScene.character = this._charListWindow.item;
		SceneManager.push(CharacterDetailScene);
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
		this.CreateParamWindow();
		this.CreateCraftList();
		this.CreateLearnedSkillList();
		this.CreateLearningSkillList();
		this.CreateEquipWindow();
		this.CreateArkSlotWindow();
		this.CreateProfileWindow();
		this.CreateTabButtons();
		this.CreateInfoWindow();
	}

	_tatie;
	CreateTatie() {
		let w = Graphics.width - 500;
		let h;
		const img = ImageManager.loadBitmap('img/taties/', CharacterDetailScene.character.model);
		if (img.width > w) {
			h = img.height * w / img.width;
		} else {
			w = img.width;
			h = img.height;
		}
		this._tatie = new Sprite(new Bitmap(w, h));
		this._tatie.bitmap.DrawBitmap(img, 0, 0, 0, this.headerHeight, w, h);
		this._tatie.move((Graphics.width - w)/2, 0);
		this.addChild(this._tatie);

		this._charName = new PIXI.Text(CharacterDetailScene.character.name, TextStyles.CharTitle);
		this._charName.x = (Graphics.width - this._charName.width)/2;
		this._charName.y = this.headerHeight;
		this.addChild(this._charName);
	}

	/** @type InfoWindow */
	_infoWindow;
	CreateInfoWindow() {
		this._infoWindow = new InfoWindow(100, this.headerHeight, Graphics.width - 200, Graphics.height - this.headerHeight * 2, 0, '', 0, undefined, 'wd_back_dark');
		this.addChild(this._infoWindow);
		this._infoWindow.Close();
	}

	/** @type CraftListWindow */
	_craftList;
	CreateCraftList() {
		this._craftList = new CraftListWindow((Graphics.width - this.WW)/2, this.headerHeight, this.WW, Graphics.height - this.headerHeight - this.tabHeight, '', 0, undefined, 'wd_back_cmn');
		this._craftList.MakeList(CharacterDetailScene.character);
		this.addChild(this._craftList);
		this._craftList.Close();
		this._craftList.SetHandler(this._craftList.OnLongPress, ()=>{
			if (this._craftList.index >= 0) {
				if (this._craftList.item) {
					this._infoWindow.SetString(Skill.GetDescription(this._craftList.item.data, this._craftList.item.level));
				} else {
					this._infoWindow.SetString(Skill.GetDescription($dataSkills[CharacterDetailScene.character.data.crafts[this._craftList.index]], 0));
				}
				this._infoWindow.Open();
			}
		});
		this._craftList.SetHandler(this._craftList.OnLongPressRelease, ()=>{this._infoWindow.Close();});
	}

	/** @type SkillListWindow */
	_skillList;
	_scText;
	CreateLearnedSkillList() {
		this._skillList = new SkillListWindow((Graphics.width - this.WW)/2, this.headerHeight, this.WW, Graphics.height - this.headerHeight - this.tabHeight, '', 0, undefined, 'wd_back_cmn');
		this._skillList.MakeList(CharacterDetailScene.character);
		this.addChild(this._skillList);
		this._skillList.Close();

		this._skillList.SetHandler(this._skillList.OnClick, ()=> {
			if (this._skillList.index >= 0) {
				if (this._skillList.item.IsEquipped()) {
					CharacterDetailScene.character.UnequipSkill(this._skillList.item);
					this._skillList.RedrawCurrentItem();
					this._scText.text = `记忆：${CharacterDetailScene.character.GetCostMemory()}/${CharacterDetailScene.character.memory}`;
				} else if (CharacterDetailScene.character.MemoryEnoughQ(this._skillList.item)) {
					CharacterDetailScene.character.EquipSkill(this._skillList.item);
					this._skillList.RedrawCurrentItem();
					this._scText.text = `记忆：${CharacterDetailScene.character.GetCostMemory()}/${CharacterDetailScene.character.memory}`;
				} else {
					this.Toast('记忆不足', Colors.Red);
				}
			}
		});

		this._skillList.SetHandler(this._skillList.OnLongPress, ()=>{
			if (this._skillList.index >= 0) {
				this._infoWindow.SetString(Skill.GetDescription(this._skillList.item.data, this._skillList.item.level));
				this._infoWindow.Open();
			}
		});
		this._skillList.SetHandler(this._skillList.OnLongPressRelease, ()=>{this._infoWindow.Close();});

		this._scText = new PIXI.Text(`记忆：${CharacterDetailScene.character.GetCostMemory()}/${CharacterDetailScene.character.memory}`, TextStyles.KaiTitle);
		this._skillList.addChild(this._scText);
		this._scText.x = this._skillList.width + 10;
		this._scText.y = 10;
	}

	/** @type LearningSkillListWindow */
	_learningSkillList;
	CreateLearningSkillList() {
		this._learningSkillList = new LearningSkillListWindow((Graphics.width - this.WW)/2, this.headerHeight, this.WW, Graphics.height - this.headerHeight - this.tabHeight, '', 0, undefined, 'wd_back_cmn');
		this._learningSkillList.MakeList(CharacterDetailScene.character);
		this.addChild(this._learningSkillList);
		this._learningSkillList.Close();
		this._learningSkillList.SetHandler(this._learningSkillList.OnLongPress, ()=>{
			if (this._learningSkillList.index >= 0) {
				this._infoWindow.SetString(Skill.GetDescription($dataSkills[this._learningSkillList.item.iname], 0));
				this._infoWindow.Open();
			}
		});
		this._learningSkillList.SetHandler(this._learningSkillList.OnLongPressRelease, ()=>{this._infoWindow.Close();});
	}


	/** @type  InfoWindow */
	_paramWindow;
	CreateParamWindow() {
		this._paramWindow = new InfoWindow((Graphics.width - this.WW)/2, this.headerHeight, this.WW, Graphics.height - this.headerHeight * 2, 0, '', 0, undefined, 'wd_back_cmn');
		this.addChild(this._paramWindow);
		this._paramWindow.SetCharacter(CharacterDetailScene.character);
		this._paramWindow.Close();
	}

	/** @type EquipWindow */
	_equipWindow;
	CreateEquipWindow() {
		this._equipWindow = new EquipWindow((Graphics.width - this.WW)/2, this.headerHeight, this.WW, Graphics.height - this.headerHeight - this.tabHeight, '', 0, undefined, 'wd_back_cmn');
		this._equipWindow.MakeList(CharacterDetailScene.character);
		this.addChild(this._equipWindow);
		this._equipWindow.SetHandler(this._equipWindow.OnClick, this.OnSlotClick.bind(this));
		this._equipWindow.Close();
	}
	_tempInfoWindow;
	OnSlotClick() {
		if (this._equipWindow.index > -1) {
			const dx = 200;
			const dy = 100;
			let w = new ItemListWindow(Graphics.width/2, dy, Graphics.width/2 - dx, Graphics.height - 2 * dy, '', 0, undefined, 'wd_back_cmn');
			let slots = (this._equipWindow.index === 2 || this._equipWindow.index === 3)? [2] : [this._equipWindow.index];
			w.SetFilter(Item.Type.EQUIP, slots, slots[0]===0?[CharacterDetailScene.character.data.wept]:[]);
			w.MakeList();
			this.Dialog(w, true, true, this.OnEquipDialogReturn.bind(this));
			this._tempInfoWindow = new InfoWindow(dx, dy, Graphics.width/2-dx, Graphics.height-2*dy, 0, '', 0, undefined, 'wd_back_dark');
			this.addChild(this._tempInfoWindow);
			this._tempInfoWindow.Open();
			this._tempInfoWindow.Activate();
			w.SetHandler(w.OnClick, ()=> {
				if (w.item instanceof Equip) {
					this._tempInfoWindow.SetEquip(w.item);
				} else {
					this._tempInfoWindow.Clear();
				}
			});
		} else {

		}
	}

	/**
	 * @param {boolean} confirm
	 * @param {Equip} item
	 */
	OnEquipDialogReturn(confirm, {item}) {
		if (confirm) {
			if (item) {
				CharacterDetailScene.character.EquipItem(item, this._equipWindow.index);
				this._equipWindow.MakeList(CharacterDetailScene.character);
			} else {
				CharacterDetailScene.character.RemoveEquipBySlot(this._equipWindow.index);
			}
		} else {
		}
		this._equipWindow.Deselect();
		this._tempInfoWindow.Close();
		this.removeChild(this._tempInfoWindow);
	}
	/** @type ArkSlot */
	_arkSlot;
	CreateArkSlotWindow() {
		let w = 500;
		let h = 600;
		this._arkSlot = new ArkSlot((Graphics.width - w)/2, (Graphics.height - h)/2, w, h);
		this.addChild(this._arkSlot);
		this._arkSlot.visible = false;
		this._arkSlot.SetHandler(this._arkSlot._btn.OnClick, ()=>{
			const w = new ArkSelectWindow(100, 8, Graphics.width - 200, Graphics.height - 100, '', 0, undefined, 'wd_back_cmn');
			w.MakeList(CharacterDetailScene.character);
			this.Dialog(w, true, true, (confirm)=>{
				if (confirm) {
					if (w.index > 0) {
						CharacterDetailScene.character.EquipArk(w.item);
						this._arkSlot.SetArk(w.item);
					} else if (CharacterDetailScene.character.ark){
						CharacterDetailScene.character.RemoveArk();
						this._arkSlot.SetEmpty();
					}
				}
			});
		});
	}

	/** @type InfoWindow */
	_profileWindow;
	CreateProfileWindow() {
		this._profileWindow = new InfoWindow(Graphics.width/2, this.headerHeight, Graphics.width/2, Graphics.height - this.headerHeight - this.tabHeight, 0, '', 0, undefined, 'content_frame_cmn');
		this.addChild(this._profileWindow);
		this._profileWindow.Close();
	}

	_lastBtn;
	CreateTabButtons() {
		let x = -100;
		let y = 150;
		let w = 300;
		let h = 60;
		const status_btn = new CharDetailLeftTabBtn('属性', 'btn_chr_panel', x, y, w, h, undefined, new Paddings(20, 20, 20, 24), new Paddings(10), new Paddings(28));
		status_btn.SetHandler(status_btn.OnClick, ()=>{
			if (this._lastBtn !== status_btn) this._lastBtn?.Toggle();
			if (status_btn.IsToggled()) {
				this.CloseAllWindow();
				this._lastBtn = undefined;
			} else {
				this.ChangeWindow(this._paramWindow);
				this._lastBtn = status_btn;
			}
		});
		this.addChild(status_btn);

		y+=h;
		const crf_btn = new CharDetailLeftTabBtn('特技', 'btn_chr_panel', x, y, w, h, undefined, new Paddings(20, 20, 20, 24), new Paddings(10), new Paddings(28));
		crf_btn.SetHandler(crf_btn.OnClick, ()=>{
			if (this._lastBtn !== crf_btn) this._lastBtn?.Toggle();
			if (crf_btn.IsToggled()) {
				this.CloseAllWindow();
				this._lastBtn = undefined;
			} else {
				this.ChangeWindow(this._craftList);
				this._lastBtn = crf_btn;
			}
		});
		this.addChild(crf_btn);

		y+=h;
		const sk_btn = new CharDetailLeftTabBtn('技能', 'btn_chr_panel', x, y, w, h, undefined, new Paddings(20, 20, 20, 24), new Paddings(10), new Paddings(28));
		sk_btn.SetHandler(sk_btn.OnClick, ()=>{
			if (this._lastBtn !== sk_btn) this._lastBtn?.Toggle();
			if (sk_btn.IsToggled()) {
				this.CloseAllWindow();
				this._lastBtn = undefined;
			} else {
				this.ChangeWindow(this._skillList);
				this._lastBtn = sk_btn;
			}
		});
		this.addChild(sk_btn);

		y+=h;
		const ls_btn = new CharDetailLeftTabBtn('学习', 'btn_chr_panel', x, y, w, h, undefined, new Paddings(20, 20, 20, 24), new Paddings(10), new Paddings(28));
		ls_btn.SetHandler(ls_btn.OnClick, ()=>{
			if (this._lastBtn !== ls_btn) this._lastBtn?.Toggle();
			if (ls_btn.IsToggled()) {
				this.CloseAllWindow();
				this._lastBtn = undefined;
			} else {
				this.ChangeWindow(this._learningSkillList);
				this._lastBtn = ls_btn;
			}
		});
		this.addChild(ls_btn);

		y+=h;
		const eq_btn = new CharDetailLeftTabBtn('装备', 'btn_chr_panel', x, y, w, h, undefined, new Paddings(20, 20, 20, 24), new Paddings(10), new Paddings(28));
		eq_btn.SetHandler(eq_btn.OnClick, ()=>{
			if (this._lastBtn !== eq_btn) this._lastBtn?.Toggle();
			if (eq_btn.IsToggled()) {
				this.CloseAllWindow();
				this._lastBtn = undefined;
			} else {
				this.ChangeWindow(this._equipWindow);
				this._lastBtn = eq_btn;
			}
		});
		this.addChild(eq_btn);

		y+=h;
		const ark_slot = new CharDetailLeftTabBtn('圣物', 'btn_chr_panel', x, y, w, h, undefined, new Paddings(20, 20, 20, 24), new Paddings(10), new Paddings(28));
		ark_slot.SetHandler(ark_slot.OnClick, ()=>{
			if (this._lastBtn !== ark_slot) this._lastBtn?.Toggle();
			if (ark_slot.IsToggled()) {
				this.CloseAllWindow();
				this._lastBtn = undefined;
			} else {
				this.ChangeWindow(this._arkSlot);
				this._lastBtn = ark_slot;
			}
		});
		this.addChild(ark_slot);

		y+=h;
		const tlt_slot = new CharDetailLeftTabBtn('天赋', 'btn_chr_panel', x, y, w, h, undefined, new Paddings(20, 20, 20, 24), new Paddings(10), new Paddings(28));
		tlt_slot.SetHandler(tlt_slot.OnClick, ()=>{
			TalentScene.player = CharacterDetailScene.character;
			SceneManager.push(TalentScene);
		});
		this.addChild(tlt_slot);
	}

	/**
	 * @param w
	 */
	ChangeWindow(w) {
		this.CloseAllWindow();
		switch(w) {
			case this._paramWindow:
				this._paramWindow.SetCharacter(CharacterDetailScene.character);
				break;
			case this._craftList:
				this._craftList.MakeList(CharacterDetailScene.character);
				break;
			case this._skillList:
				this._skillList.MakeList(CharacterDetailScene.character);
				break;
			case this._learningSkillList:
				this._learningSkillList.MakeList(CharacterDetailScene.character);
				break;
			case this._equipWindow:
				this._equipWindow.MakeList(CharacterDetailScene.character);
				break;
			case this._arkSlot:
				this._arkSlot.Show();
				return;
			case this._profileWindow:
				this._profileWindow.SetProfile(CharacterDetailScene.character);
				break;
			default:
				break;
		}
		w.Open();
		w.Activate();
	}

	CloseAllWindow() {
		this._paramWindow.Close();
		this._craftList.Close();
		this._skillList.Close();
		this._learningSkillList.Close();
		this._equipWindow.Close();
		this._arkSlot.Hide();
		this._profileWindow.Close();
		this._infoWindow.Close();
	}
}

class CharDetailLeftTabBtn extends Button {
	_toggled = false;

	OnClick() {
		super.OnClick();
		this.Toggle();
	}

	Toggle() {
		if (!this._toggled) {
			this._toggled = true;
			this.x += 50;
		} else {
			this._toggled = false;
			this.x -= 50;
		}
	}

	IsToggled() {
		return this._toggled;
	}
}

class ArkSlot extends Clickable {
	constructor(x, y, w, h) {
		super(x, y, w, h);
		this._back = new Sprite(new Bitmap(w, h));
		this._backBitmap = this._back.bitmap;
		this._btn = new Button('', 'slot_ark', 0, 0, w, h, undefined, new Paddings(24), new Paddings(0), new Paddings(13));
		this.addChild(this._back);
		this.addChild(this._btn);
		this.x = x;
		this.y = y;
		this.SetEmpty();
	}

	SetEmpty() {
		this._backBitmap.clear();
		this._backBitmap.DrawImageInRect('img/ui/', 'slot_ark_back', 0, 0, new Rectangle(0, 0, this.w, this.h), new Paddings(8));
	}

	/**
	 * @param {Ark} ark
	 */
	SetArk(ark) {
		this._backBitmap.clear();
		this._backBitmap.DrawImageInRect('img/icons/ark/', ark.image, 0, 0, new Rectangle(0, 0, this.w, this.h), new Paddings(8));
	}

	Hide() {
		this.visible = false;
		this.Deactivate();
	}

	Show() {
		this.visible = true;
		this.Activate();
	}

	/**
	 * @param {Function} func
	 * @param {Function} handle_func
	 * @param args
	 */
	SetHandler(func, handle_func, ...args) {
		this._btn.SetHandler(func, handle_func, ...args)
	}
}