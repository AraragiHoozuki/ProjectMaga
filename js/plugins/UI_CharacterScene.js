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
		this._charListWindow.SetClickHandler(this.OnCharacterClick.bind(this));
	}

	OnCharacterClick() {
		CharacterDetailScene.character = this._charListWindow.item;
		SceneManager.push(CharacterDetailScene);
	}
}


class CharacterDetailScene extends MenuBaseScene {
	/** @type PlayerChar */
	static character;
	get headerText() {return '角色信息';}
	get tabHeight() {return 64;}

	CreateContents() {
		super.CreateContents();
		this.CreateTatie();
		this.CreateInfoWindow();
		this.CreateParamWindow();
		this.CreateSkillList();
		this.CreateEquipWindow();
		this.CreateProfileWindow();
		this.CreateTabButtons();
	}

	_tatie;
	CreateTatie() {
		let w = Graphics.width/2;
		let h = Graphics.height - this.headerHeight;
		this._tatie = new Sprite(new Bitmap(w, h));
		const img = ImageManager.loadBitmap('img/taties/', CharacterDetailScene.character.model);
		if (img.width > w) {
			h = img.height * w / img.width;
		} else {
			w = img.width;
			h = img.height;
		}
		this._tatie.bitmap.DrawBitmap(img, 0, 0, (Graphics.width/2 - w)/2, this.headerHeight, w, h);
		this._tatie.move(0, this.headerHeight);
		this.addChild(this._tatie);
	}
	/** @type InfoWindow */
	_infoWindow;
	CreateInfoWindow() {
		this._infoWindow = new InfoWindow(0, this.headerHeight, Graphics.width/2, Graphics.height - this.headerHeight, 0, '', 0, undefined, 'wd_back_dark');
		this.addChild(this._infoWindow);
		this._infoWindow.Close();
	}

	/** @type SkillListWindow */
	_skillList;
	/** @type Button */
	_skillLvupBtn;
	CreateSkillList() {
		this._skillList = new SkillListWindow(Graphics.width/2, this.headerHeight, Graphics.width/2, Graphics.height - this.headerHeight - this.tabHeight, '', 0, undefined, 'content_frame_cmn');
		this._skillList.MakeList(CharacterDetailScene.character);
		this.addChild(this._skillList);
		this._skillList.SetSelectHandler(this.OnSkillSelect.bind(this));
		this._skillList.Close();

		const bw = 220;
		this._skillLvupBtn = new Button('升级', 'btn_pos', Graphics.width/4 - bw/2, Graphics.height - 90, bw, 80, undefined, new Paddings(25), new Paddings(0), new Paddings(25));
		this.addChild(this._skillLvupBtn);
		this._skillLvupBtn.Hide();
		this._skillLvupBtn.SetClickHandler(this.OnSkillLevelUpClick.bind(this));
	}

	OnSkillSelect() {
		if (this._skillList.item) {
			this._infoWindow.SetSkill(this._skillList.item);
			this._infoWindow.Open();
			this._infoWindow.Activate();
			if (this._skillList.item.level < this._skillList.item.maxLevel) {
				this._skillLvupBtn.ShowAndActivate();
			} else {
				this._skillLvupBtn.Hide();
			}
		} else {
			this._infoWindow.Close();
			this._skillLvupBtn.Hide();
		}
	}

	OnSkillLevelUpClick() {
		const dx = 300;
		const dy = 100;
		const cost = this._skillList.item.levelUpCost;
		const iname = 'IT_KAKERA_'+CharacterDetailScene.character.iname;
		let w = new MaterialCostWindow(dx, dy, Graphics.width - 2 * dx, Graphics.height - 2 * dy, '', 0, 'wd_title_white', 'wd_back_cmn');
		w.SetList([{iname: iname, amount: cost}]);
		this.Dialog(w, $gameParty.ItemAmount(iname) >= cost, true, this.OnLevelUpConfirm.bind(this));
	}

	OnLevelUpConfirm(confirm) {
		if (confirm) {
			$gameParty.GetItem('IT_KAKERA_'+CharacterDetailScene.character.iname, - this._skillList.item.levelUpCost);
			this._skillList.item.LevelUp();
			this._skillList.RedrawItem(this._skillList.index);
			this._infoWindow.SetSkill(this._skillList.item);
		}
	}

	/** @type  InfoWindow */
	_paramWindow;
	CreateParamWindow() {
		this._paramWindow = new InfoWindow(Graphics.width/2, this.headerHeight, Graphics.width/2, Graphics.height - this.headerHeight - this.tabHeight, 0, '', 0, undefined, 'content_frame_cmn');
		this.addChild(this._paramWindow);
		this._paramWindow.Activate();
		this._paramWindow.SetCharacter(CharacterDetailScene.character)
	}

	/** @type EquipWindow */
	_equipWindow;
	CreateEquipWindow() {
		this._equipWindow = new EquipWindow(Graphics.width/2, this.headerHeight, Graphics.width/2, Graphics.height - this.headerHeight - this.tabHeight, '', 0, undefined, 'content_frame_cmn');
		this._equipWindow.MakeList(CharacterDetailScene.character);
		this.addChild(this._equipWindow);
		this._equipWindow.SetClickHandler(this.OnSlotClick.bind(this));
		this._equipWindow.Close();
	}
	_tempInfoWindow;
	OnSlotClick() {
		if (this._equipWindow.index > -1) {
			const dx = 200;
			const dy = 100;
			let w = new ItemListWindow(Graphics.width/2, dy, Graphics.width/2 - dx, Graphics.height - 2 * dy, '', 0, undefined, 'wd_back_cmn');
			let slots = (this._equipWindow.index === 2 || this._equipWindow.index === 3)? [2] : [this._equipWindow.index];
			w.SetFilter(Item.Type.EQUIP, slots);
			w.MakeList();
			this.Dialog(w, true, true, this.OnEquipDialogReturn.bind(this));
			this._tempInfoWindow = new InfoWindow(dx, dy, Graphics.width/2-dx, Graphics.height-2*dy, 0, '', 0, undefined, 'wd_back_dark');
			this.addChild(this._tempInfoWindow);
			this._tempInfoWindow.Open();
			this._tempInfoWindow.Activate();
			w.SetClickHandler((()=> {
				if (w.item instanceof Equip) {
					this._tempInfoWindow.SetEquip(w.item);
				} else {
					this._tempInfoWindow.Clear();
				}
			}).bind(this));
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

	/** @type InfoWindow */
	_profileWindow;
	CreateProfileWindow() {
		this._profileWindow = new InfoWindow(Graphics.width/2, this.headerHeight, Graphics.width/2, Graphics.height - this.headerHeight - this.tabHeight, 0, '', 0, undefined, 'content_frame_cmn');
		this.addChild(this._profileWindow);
		this._profileWindow.Close();
	}

	_statusBtn;
	_skillBtn;
	_equipBtn;
	_profileBtn;
	CreateTabButtons() {
		let x0 = Graphics.width/2;
		let w = Graphics.width/8;
		let y = Graphics.height - this.tabHeight;
		this._statusBtn = new Button('属性', 'btn_octagon', x0, y, w, this.tabHeight, undefined, new Paddings(20, 20, 17, 14), new Paddings(), new Paddings(20, 20, 17, 14));
		this.addChild(this._statusBtn);
		this._statusBtn.SetClickHandler(this.ChangeWindow.bind(this, this._paramWindow));

		this._skillBtn = new Button('技能', 'btn_octagon', x0 + w, y, w, this.tabHeight, undefined, new Paddings(20, 20, 17, 14), new Paddings(), new Paddings(20, 20, 17, 14));
		this.addChild(this._skillBtn);
		this._skillBtn.SetClickHandler(this.ChangeWindow.bind(this, this._skillList));

		this._equipBtn = new Button('装备', 'btn_octagon', x0 + 2 * w, y, w, this.tabHeight, undefined, new Paddings(20, 20, 17, 14), new Paddings(), new Paddings(20, 20, 17, 14));
		this.addChild(this._equipBtn);
		this._equipBtn.SetClickHandler(this.ChangeWindow.bind(this, this._equipWindow));

		this._profileBtn = new Button('介绍', 'btn_octagon', x0 + 3 * w, y, w, this.tabHeight, undefined, new Paddings(20, 20, 17, 14), new Paddings(), new Paddings(20, 20, 17, 14));
		this.addChild(this._profileBtn);
		this._profileBtn.SetClickHandler(this.ChangeWindow.bind(this, this._profileWindow));
	}

	/**
	 * @param {CustomWindow} w
	 */
	ChangeWindow(w) {
		this.CloseAllWindow();
		switch(w) {
			case this._paramWindow:
				this._paramWindow.SetCharacter(CharacterDetailScene.character);
				break;
			case this._skillList:
				this._skillList.MakeList(CharacterDetailScene.character);
				break;
			case this._equipWindow:
				this._equipWindow.MakeList(CharacterDetailScene.character);
				break;
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
		this._skillList.Close();
		this._equipWindow.Close();
		this._profileWindow.Close();
		this._infoWindow.Close();
		this._skillLvupBtn.Hide();
	}
}