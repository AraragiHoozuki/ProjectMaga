class InventoryScene extends MenuBaseScene {
	get headerText() {return '物品';}
	get typeBtnHeight() { return 64;}

	CreateContents() {
		super.CreateContents();
		this.CreateInfoWindow();
		this.CreateItemList();
		this.CreateTypeBtns();
	}

	/** @type InfoWindow */
	_infoWindow;
	CreateInfoWindow() {
		this._infoWindow = new InfoWindow(0, this.headerHeight, Graphics.width/2, Graphics.height - this.headerHeight, 0, '', 0, undefined, 'wd_back_dark');
		this.addChild(this._infoWindow);
		this._infoWindow.Activate();
	}

	/** @type ItemListWindow */
	_itemList;
	CreateItemList() {
		this._itemList = new ItemListWindow(Graphics.width/2, this.headerHeight, Graphics.width/2, Graphics.height - this.headerHeight - this.typeBtnHeight, '', 0, undefined, 'content_frame_cmn');
		this._itemList.MakeList();
		this.addChild(this._itemList);
		this._itemList.SetSelectHandler(this.OnItemSelect.bind(this));
		this._itemList.Activate();
	}

	OnItemSelect() {
		if (this._itemList.item) {
			this._infoWindow.SetItem(this._itemList.item);
		} else {
			this._infoWindow.Clear();
		}
	}

	CreateTypeBtns() {
		let x0 = Graphics.width/2;
		let w = Graphics.width/8;
		let h = this.typeBtnHeight;
		let y = Graphics.height - this.typeBtnHeight;

		let btn = new Button('剧情', 'btn_octagon', x0, y, w, h, undefined, new Paddings(20, 20, 17, 14), new Paddings(), new Paddings(20, 20, 17, 14));
		this.addChild(btn);
		btn.SetClickHandler(this.OnSetType.bind(this, Item.Type.KEY));
		x0 += w;

		btn = new Button('材料', 'btn_octagon', x0, y, w, h, undefined, new Paddings(20, 20, 17, 14), new Paddings(), new Paddings(20, 20, 17, 14));
		this.addChild(btn);
		btn.SetClickHandler(this.OnSetType.bind(this, Item.Type.MATERIAL));
		x0 += w;

		btn = new Button('票券', 'btn_octagon', x0, y, w, h, undefined, new Paddings(20, 20, 17, 14), new Paddings(), new Paddings(20, 20, 17, 14));
		this.addChild(btn);
		btn.SetClickHandler(this.OnSetType.bind(this, Item.Type.TICKET));
		x0 += w;

		btn = new Button('装备', 'btn_octagon', x0, y, w, h, undefined, new Paddings(20, 20, 17, 14), new Paddings(), new Paddings(20, 20, 17, 14));
		this.addChild(btn);
		btn.SetClickHandler(this.OnSetType.bind(this, Item.Type.EQUIP));
	}

	static MinNumToShowEquipFilter = 25;
	/** @param {number} type */
	OnSetType(type) {
		if (type === Item.Type.EQUIP && $gameParty.equips.length > InventoryScene.MinNumToShowEquipFilter) {
			let w = new EquipFilterWindow(200, 100, Graphics.width - 400, Graphics.height - 200, '', 0, undefined, 'wd_back_cmn');
			w.MakeList();
			this.Dialog(w, true, true, this.OnEquipTypeConfirm.bind(this));
		} else {
			this._itemList.SetFilter(type);
			this._itemList.MakeList();
		}
	}

	/**
	 * @param {boolean} confirm
	 * @param {number} item
	 * @param {number} index
	 * @constructor
	 */
	OnEquipTypeConfirm(confirm, {item, index}) {
		if (confirm) {
			if (index <=2 && index >= 0) {
				this._itemList.SetFilter(Item.Type.EQUIP, [index]);
			} else if (index > 2) {
				this._itemList.SetFilter(Item.Type.EQUIP, [0], [item]);
			}
			this._itemList.MakeList();
		}
	}
}

class EquipFilterWindow extends ScrollListWindow {
	get itemHeight() { return 54; }
	get maxCols() { return 2;}
	MakeList() {
		this._data = [
			Equip.Slot.WEAPON,
			Equip.Slot.ARMOR,
			Equip.Slot.ACCESSORY
		].concat(Object.values(Equip.WeaponType));
		super.MakeList();
	}

	/**
	 * @param {number} index
	 * @returns {string}
	 */
	GetTextByIndex(index) {
		if (index <= 2 && index >= 0) {
			return Names.EquipSlots[this._data[index]];
		} else if (this._data[index] !== undefined) {
			return Names.WeaponTypes[this._data[index]];
		}
		return '';
	}

	DrawItem(index) {
		let s = this.GetTextByIndex(index);
		if (s === '') return;
		let r = this.GetItemRect(index);
		this.DrawTexture('img/ui/', 'cell_cmn', r.x, r.y, r.width, r.height, new Paddings(10));
		this.DrawText(s, r.x, r.y + r.height/4, r.width - r.height, 'center');

		if (this.index === index) {
			this.DrawTexture('img/ui/', 'cell_select_cmn', r.x, r.y, r.width, r.height, new Paddings(9));
		}
	}
}