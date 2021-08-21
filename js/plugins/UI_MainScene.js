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

	get bgiName() {return 'scene_bgi_black.png';}
	get mapData() {return $dataMaps["World"];}

	CreateCustomContents() {
		this.CreateMap();
		this.CreateLocations();
		this.CreateMainButtons();
	}

	start() {
		super.start();
		AudioManager.PlayBgm(this.mapData.bgm);
	}

	//#region Map Locations
	_mapView;
	CreateMap() {
		this._mapView = new MapViewPort(0, 0, Graphics.width, Graphics.height, new Paddings(0), {path:undefined, paddings:[0]});
		let sprite = this._mapView.AddItem(new PIXI.Sprite(PIXI.Texture.EMPTY));
		DataUtils.Load('img/maps/world.png').then((res)=>sprite.texture = new PIXI.Texture(new PIXI.BaseTexture(res.data)));
		this.addChild(this._mapView);
		this._mapView.EnableXScroll(true);
		this._mapView.EnableYScroll(true);
	}

	static LocBtnWidth = 240;
	AddLandmark(iname) {
		const l = this.mapData.Landmarks[iname];
		const x = l.Position[0] - MainScene.LocBtnWidth/2;
		const y = l.Position[1] + 48;
		const btn = new Button(x, y, MainScene.LocBtnWidth, 56, Names.Landmarks[l.iname], {path: 'img/ui/spreading/anaden_btn_loc.png', paddings: [0]}, {path: 'img/ui/spreading/anaden_btn_loc.png', paddings: [0]}, TextStyles.KaiWhite);
		this._mapView.AddItem(btn);
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
		let [x, y] = [16, Graphics.height - 96];
		let btn = new Button(x, y, 96, 96, '', {path:'img/ui/spreading/anaden_btn_party.png', paddings:[0]}, {path: 'img/ui/spreading/anaden_btn_expl_pressed.png', paddings:[0]}, TextStyles.KaiBtnBlack);
		this.addChild(btn);
		btn.OnClick.add(()=>{SceneManager.push(CharacterListScene);});
	}
	//#endregion


	//#region Map Move
	MapFocus(x, y) {
		this._mapView.SetScroll(Graphics.width/2 - x, Graphics.height/2 - y);
	}
	//#endregion
}

class MapViewPort extends ViewPort {
	UpdateBorderBouncing() {
        if (this.IsPressed()) return;
        if (this._scrollEnabledY) {
            if (this._scroll > 0) {
                this._scroll -= (this._scroll) / 3;
                if (this._scroll < 1) this._scroll = 0;
            }
    
            const min = -this._contentArea.height + Graphics.height;
            if (this._scroll < min) {
                this._scroll -= (this._scroll -min) / 3;
                if (min - this._scroll < 1) this._scroll = min;
            }
        }
        

        if (this._scrollEnabledX) {
            if (this._scrollX > 0) {
                this._scrollX -= (this._scrollX) / 3;
                if (this._scrollX < 1) this._scrollX = 0;
            }
			const min = -this._contentArea.width + Graphics.width;
            if (this._scrollX < min) {
                this._scrollX -= (this._scrollX - min) / 3;
                if (min - this._scrollX < 1) this._scrollX = min;
            }
        }
    }
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