class TabButton extends Button {
	_selected  = false;
	IsSelected() {
		return this._selected === true;
	}

	SetSignals() {
        super.SetSignals();
		this.OnSelect = new PIXI.Signal();
		this.OnDeselect = new PIXI.Signal();
    }

	ProcessClick() {
		if (this._selected === false) {
			this._selected = true;
			this.OnSelect.dispatch(this);
		}
		super.ProcessClick();
	}

	Deselect() {
		this._selected = false;
		this.OnDeselect.dispatch();
	}

	UpdatePressedSpr() {
		this._pressedSpr.visible = !this.IsSelected();
	}
}

class TabBtnLeftTop extends TabButton {
	constructor(x, y, w, h, text, style = TextStyles.Normal) {
		super(x, y, w, h, text, ...Button.Presets.TAB_LEFT_TOP, style = TextStyles.KaiVertical);
	}

	CreatePressedSpr() {
		this._pressedSpr = this.addChild(new Spreading(0, 0, this.width, this.height - 9, this._pressedSprConf, Spreading.Mode.Stretch));
	}
	CreateText() {
		super.CreateText();
		this._textSprite.y = this.height * 0.38;
	}
}
class TabBtnLeftMid extends TabButton {
	constructor(x, y, w, h, text, style = TextStyles.Normal) {
		super(x, y, w, h, text, ...Button.Presets.TAB_LEFT_MID, style = TextStyles.KaiVertical);
	}

	CreatePressedSpr() {
		this._pressedSpr = this.addChild(new Spreading(0, 9, this.width, this.height - 18, this._pressedSprConf, Spreading.Mode.Stretch));
	}
	CreateText() {
		super.CreateText();
		this._textSprite.y = this.height * 0.38;
	}
}
class TabBtnLeftBot extends TabButton {
	constructor(x, y, w, h, text, style = TextStyles.Normal) {
		super(x, y, w, h, text, ...Button.Presets.TAB_LEFT_BOTTOM, style = TextStyles.KaiVertical);
	}

	CreatePressedSpr() {
		this._pressedSpr = this.addChild(new Spreading(0, 9, this.width, this.height - 9, this._pressedSprConf, Spreading.Mode.Stretch));
	}
	CreateText() {
		super.CreateText();
		this._textSprite.y = this.height * 0.38;
	}
}

class TabView extends PIXI.Container {
	constructor(x, y, w, h) {
		super();
		this.x = x;
		this.y = y;
		this._width = w;
		this._height = h;
	}

	get width() {return this._width;}
    get height() {return this._height;}
	_btns = [];
	/**
	 * 
	 * @param {string[]} texts 
	 * @param {PIXI.DisplayObject[]} contents 
	 */
	Setup(texts, contents = []) {
		this._texts = texts;
		this._contents = contents;
		this.CreateViewArea();
		this.CreateTabBtns();
		this.OnSelect(this._btns[0]);
	}

	CreateTabBtns() {

	}

	CreateViewArea() {
		for(const c of this._contents) {
			this.addChild(c);
			c.visible = false;
		}
	}

	/**
	 * 
	 * @param {TabButton} btn 
	 */
	OnSelect(btn) {
		AudioManager.PlaySe(btn._clickSe)
		for (let i = 0; i < this._btns.length; i++) {
			if (this._btns[i] !== btn ) {
				if (this._btns[i].IsSelected()) this._btns[i].Deselect();
				if (this._contents[i]) this._contents[i].visible = false;
			} else {
				if (this._contents[i]) this._contents[i].visible = true;
			}
		}
	}

	update() {
		for (const c of this.children) {
			if (c.update) c.update();
		}
	}
}

class TabViewLR extends TabView {
	constructor(x, y, w, h, btn_width) {
		super(x, y, w, h);
		this._btnWidth = btn_width;
	}
	CreateTabBtns() {
		super.CreateTabBtns();
		const n = this._texts.length;
		/** 上下按钮高度, 中间按钮高度 */
		let btnh, btnmh;
		if (n < 2) {
			throw '不能创建小于2个选项的tab';
		} else if (n == 2) {
			btnh = this.height/2;
		} else {
			btnmh = this.height/(n - 2 + 128 * 2/ 138);
			btnh = btnmh * 128/138;
		}
		let y = 0;
		let btn;
		btn = this.addChild(new TabBtnLeftTop(0, y, this._btnWidth, btnh, this._texts[0]));
		btn.OnSelect.add((b)=> {this.OnSelect(b);});
		this._btns.push(btn);
		y += btnh;
		for (let i = 0; i< n-2; i++) {
			btn = this.addChild(new TabBtnLeftMid(0, y, this._btnWidth, btnmh, this._texts[i + 1]));
			btn.OnSelect.add((b)=> {this.OnSelect(b);});
			this._btns.push(btn);
			y += btnmh;
		}
		btn = this.addChild(new TabBtnLeftBot(0, y, this._btnWidth, btnh, this._texts[this._texts.length - 1]));
		btn.OnSelect.add((b)=> {this.OnSelect(b);});
		this._btns.push(btn);
	}

	CreateViewArea() {
		this.addChild(new Spreading(this._btnWidth - 4, 0, this.width - this._btnWidth + 4, this.height, Spreading.Presets.TAB_RIGHT_AREA, 1));
		super.CreateViewArea();
	}
}