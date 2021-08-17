/**
 * @typedef {Object} Map
 * @property {string} iname
 * @property {string} bgm
 * @property {Landmark[]} Landmarks
 */

/**
 * @typedef {Object} Landmark
 * @property {string} iname
 * @property {number[]} Position
 */

/**
 * @typedef {Object} Stage
 * @property {string} iname
 * @property {string} name
 * @property {string} location
 * @property {string} unlock_location
 * @property {string[]} previous_stages
 * @property {boolean} onetime
 * @property {string[]} battles
 * @property {string[]} joins
 * @property {string} story
 */

/** @type Map[]*/
var $dataMaps;
/** @type Stage[]*/
var $dataStages;

class MainScene extends CustomScene {

	get backgroundImageName() {return 'scene_bg_pattern_black';}
	get mapData() {return $dataMaps["World"];}

	CreateCustomContents() {
		this.CreateMap();
		this.CreateLocations();
		this.CreateMainButtons();
	}

	start() {
		super.start();
		AudioManager.playBgm({name: this.mapData.bgm, pitch: 100, volume : 100});
	}

	//#region Map Locations
	_mapSprite;
	CreateMap() {
		let bitmap = ImageManager.loadBitmap('img/maps/', 'world');
		this._mapSprite = new Sprite(bitmap);
		this.addChild(this._mapSprite);
	}

	static LocBtnWidth = 240;
	AddLandmark(iname) {
		let l = this.mapData.Landmarks[iname];
		let x = l.Position[0] - MainScene.LocBtnWidth/2;
		let y = l.Position[1] + 48;
		let btn = new Button(Names.Landmarks[l.iname], 'btn_location', x, y, MainScene.LocBtnWidth, 56, undefined, new Paddings(25, 15, 25, 12), new Paddings(), new Paddings(25, 15, 25, 12));
		this._mapSprite.addChild(btn);
		btn.SetHandler(btn.OnClick, this.OnLocationClick.bind(this, iname));
	}

	CreateLocations() {
		let last = '';
		for (let iname of $gameParty.unlockedLocations) {
			if (this.mapData.Landmarks[iname]) {
				this.AddLandmark(iname);
				last = iname;
			}
			this.MapFocus(...this.mapData.Landmarks[last].Position);
		}
	}

	OnLocationClick(iname) {
		let dx = 300;
		let dy = 100;
		let stages = Object.values($dataStages).filter(stg => stg.location === iname && $gameParty.IsStageAccessible(stg.iname));
		let w = new StageListWindow(dx, dy, Graphics.width - 2 * dx, Graphics.height - 2 * dy, '', 0, 'wd_title_white', 'wd_back_cmn');
		w.SetList(stages);
		this.Dialog(w, w._data.length > 0, true, this.OnStageConfirm.bind(this), false);
		w.Select(0);
	}

	/**
	 * @param {boolean} confirm
	 * @param {Stage} item
	 */
	OnStageConfirm(confirm, {item}) {
		if (confirm) {
			let dx = 300;
			let dy = 100;
			let w = new InfoWindow(dx, dy, Graphics.width - 2 * dx, Graphics.height - 2 * dy, 0, '', 0, 'wd_title_white', 'wd_back_dark');
			w.SetStage(item);
			this.Dialog(w, true, true, this.OnStageStoryConfirm.bind(this));
		}
	}
	/**
	 * @param {boolean} confirm
	 * @param {Stage} _stage
	 */
	OnStageStoryConfirm(confirm, {_stage}) {
		if (confirm) {
			$gameParty.StartStage(_stage);
		}
	}
	//#endregion

	//#region Main Btn
	CreateMainButtons() {
		let [x, y] = [16, Graphics.height - 100];
		let btn = new Button('', 'btn_party', x, y, 96, 91, 'btn_main_hover');
		this.addChild(btn);
		btn.SetHandler(btn.OnClick, ()=>{SceneManager.push(CharacterListScene);});
		x += 88;

		btn = new Button('', 'btn_inventory', x, y, 96, 91, 'btn_main_hover');
		this.addChild(btn);
		btn.SetHandler(btn.OnClick, ()=>{SceneManager.push(InventoryScene);});
		x += 88;

		btn = new Button('', 'btn_ark', x, y, 96, 91, 'btn_main_hover');
		this.addChild(btn);
		btn.SetHandler(btn.OnClick,()=>{SceneManager.push(ArkListScene);});
		x += 88;

		btn = new Button('', 'btn_save', x, y, 96, 91, 'btn_main_hover');
		this.addChild(btn);
		btn.SetHandler(btn.OnClick,()=>{
			DataManager.saveGame(0);
			SoundManager.playSave();
			toast('保存游戏成功', Colors.Green);
		});
	}
	//#endregion


	update() {
		this.UpdateTouching();
		this.ProcessMove();
		this.UpdateBorderBouncing();
		this.UpdateMapMove();
		this.ProcessRelease();
		super.update();
	}

	//#region Map Move
	_moveOrigin = new Point(0, 0);
	_moving = new Point(0, 0);
	_displacement = new Point(0, 0);
	_touched = false;
	_touching = false;

	get displacement() {
		return [this._displacement.x + this._moving.x, this._displacement.y + this._moving.y];
	}

	/**
	 * returns [xmin, ymin, xmax, ymax]
	 * @returns {number[]}
	 */
	get displacementLimit() {
		return [Graphics.width - this._mapSprite.width,Graphics.height-this._mapSprite.height,0,0];
	}

	UpdateTouching() {
		if (this.HasNoOpenedDialog()) {
			if (TouchInput.isTriggered()) {
				this._touched = true;
				this._moveOrigin.set(TouchInput.x, TouchInput.y);
			}
			if (TouchInput.isPressed()) {
				if (!this._touching) {
					this._touching = true;
				}
			} else {
				this._touching = false;
			}
		} else {
			this._touching = false;
		}
	}

	ProcessMove() {
		if (this.HasNoOpenedDialog() && this._touching) {
			let [x, y] = [TouchInput.x, TouchInput.y];
			this._moving.set(x - this._moveOrigin.x, y - this._moveOrigin.y);
		}
	}

	ProcessRelease() {
		if (this.HasNoOpenedDialog()) {
			if (!this._touching && this._touched) {
				this._displacement.set(this._displacement.x + this._moving.x, this._displacement.y + this._moving.y);
				this._moving.set(0,0);
				this._touched = false;
			}
		} else {
			this._touching = false;
		}
	}

	UpdateMapMove() {
		this._mapSprite.move(...this.displacement);
	}

	UpdateBorderBouncing() {
		let [xmin, ymin, xmax, ymax] = this.displacementLimit;
		if (this._displacement.x > xmax) {
			this._displacement.set(this._displacement.x -  (this._displacement.x - xmax) / 3, this._displacement.y);
			if (this._displacement.x - xmax < 1) this._displacement.set(xmax, this._displacement.y);
		}

		if (this._displacement.x < xmin) {
			this._displacement.set(this._displacement.x -  (this._displacement.x - xmin) / 3, this._displacement.y);
			if (xmin - this._displacement.x < 1) this._displacement.set(xmin, this._displacement.y);
		}

		if (this._displacement.y > ymax) {
			this._displacement.set(this._displacement.x, this._displacement.y -  (this._displacement.y - ymax) / 3);
			if (this._displacement.y - ymax < 1) this._displacement.set(this._displacement.x, ymax);
		}

		if (this._displacement.y < ymin) {
			this._displacement.set(this._displacement.x, this._displacement.y -  (this._displacement.y - ymin) / 3);
			if (ymin - this._displacement.y < 1) this._displacement.set(this._displacement.x, ymin);
		}
	}

	MapFocus(x, y) {
		this._displacement.set(Graphics.width/2 - x, Graphics.height/2 - y);
	}
	//#endregion
}

class StageListWindow extends ScrollListWindow {
	/** @type Stage[] */
	_data;

	get itemHeight() { return 54; }
	CanSelectNull() {
		return false;
	}

	DrawItem(index) {
		if (!this._data[index]) return;
		let r = this.GetItemRect(index);
		this.DrawTexture('img/ui/', 'cell_cmn', r.x, r.y, r.width, r.height, new Paddings(10));
		if ($gameParty.IsStageCleared(this._data[index].iname)) this.DrawImage('img/ui/', 'mark_clear', 0, 0, r.x + r.width - 120, r.y + r.height/4);
		this.DrawText(this._data[index].name, r.x + 24, r.y + r.height/4, r.width);
		if (this.index === index) {
			this.DrawTexture('img/ui/', 'cell_select_cmn', r.x, r.y, r.width, r.height, new Paddings(9));
		}
	}
}