class Button extends Clickable {
	static Presets = {
		ANADEN_PURPLE: [
			{path: 'img/ui/spreading/anaden_btn_purple.png', paddings: [0]},
			{path: 'img/ui/spreading/anaden_btn_purple_pressed.png', paddings: [0]}
		],
		ANADEN_HEX: [
			{path: 'img/ui/spreading/anaden_btn_hex.png', paddings: [14, 2, 14, 2]},
			{path: 'img/ui/spreading/anaden_btn_hex_pressed.png', paddings: [14, 2, 14, 2]}
		],
		ANADEN_OCT_A: [
			{path: 'img/ui/spreading/anaden_btn_octA.png', paddings: [30, 30, 26, 22]},
			{path: 'img/ui/spreading/anaden_btn_octA_pressed.png', paddings: [30, 30, 26, 22]}
		],
		ANADEN_BACK: [
			{path: 'img/ui/spreading/anaden_btn_back.png', paddings: [0]},
			{path: 'img/ui/spreading/anaden_btn_back_pressed.png', paddings: [0]}
		],
		ANADEN_CLOSE: [
			{path: 'img/ui/spreading/anaden_btn_close.png', paddings: [0]},
			{path: 'img/ui/spreading/anaden_btn_close_pressed.png', paddings: [0]}
		],

		TAB_LEFT_TOP: [
			{path: 'img/ui/spreading/tab_left_btn_top.png', paddings: [12,10,0,20]},
			{path: 'img/ui/spreading/tab_left_btn_fill.png', paddings: [12,10,2,10]}
		],
		TAB_LEFT_MID: [
			{path: 'img/ui/spreading/tab_left_btn_middle.png', paddings: [12,20,0,20]},
			{path: 'img/ui/spreading/tab_left_btn_fill.png', paddings: [12,10,2,10]}
		],
		TAB_LEFT_BOTTOM: [
			{path: 'img/ui/spreading/tab_left_btn_bottom.png', paddings: [12,20,0,10]},
			{path: 'img/ui/spreading/tab_left_btn_fill.png', paddings: [12,10,2,10]}
		]
	}
	
	/**
	 * 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {number} w 
	 * @param {number} h 
	 * @param {string} text 
	 * @param {SpreadingPreset} normal_spr_preset 
	 * @param {SpreadingPreset} pressed_spr_preset 
	 * @param {Object} style - text style
	 */
	constructor(x, y, w, h, text, normal_spr_preset, pressed_spr_preset = normal_spr_preset, style = TextStyles.Normal) {
		super(x, y, w, h);
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this._text = text;
		this._style = style;
		this._normalSprConf = normal_spr_preset;
		this._pressedSprConf = pressed_spr_preset;
		this.Init();
	}
	/** @type Paddings */
	_paddings;
	/** @type Paddings */
	_hoverPaddings;
	/** @type Paddings */
	_hoverTexturePaddings;

	get width() {return this._width;}
	get height() {return this._height;}
	set width(value) {this._width = value;}
	set height(value) {this._height = value;}

	Init() {
		this.CreateNormalSpr();
		this.CreatePressedSpr();
		this.CreateText();
		this.Activate();
	}

	CreateNormalSpr() {
		this._normalSpr = this.addChild(new Spreading(0, 0, this.width, this.height, this._normalSprConf, Spreading.Mode.Stretch));
	}

	CreatePressedSpr() {
		this._pressedSpr = this.addChild(new Spreading(0, 0, this.width, this.height, this._pressedSprConf, Spreading.Mode.Stretch));
	}

	CreateText() {
		this._textSprite = this.addChild(new PIXI.Text(this._text, this._style));
		this._textSprite.anchor.set(0.5);
		this._textSprite.x = this.width/2;
		this._textSprite.y = this.height/2;
	}

	/**
	 * @returns {boolean}
	 */
	get active() {return this._active;}
	Hide() {
		this.visible = false;
		this.Deactivate();
	}

	ShowAndActivate() {
		this.visible = true;
		this.Activate();
	}

	SetSignals() {
        super.SetSignals();
		this.OnClick.add(()=> {if(this.OnClick.handlers().length > 1) AudioManager.PlaySe(this._clickSe);});
    }

	_clickSe = '$btn_click';
	SetClickSe(name) {
		this._clickSe = name;
	}

	update() {
		super.update();
		this.UpdatePressedSpr();
	}

	UpdatePressedSpr() {
		this._pressedSpr.visible = this.IsPressed();
	}
}


