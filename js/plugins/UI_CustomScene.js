const toast = function(msg, color) {
	if (SceneManager._scene instanceof CustomScene) {
		SceneManager._scene.Toast(msg, color);
	}
};

const $scene = () => SceneManager._scene;



class CustomScene extends Scene_Base {
	constructor() {
		super();
	}

	create() {
		this.CreateBackground();
		this.CreateCustomContents();
		this.CreateTopThings();
	}

	CreateCustomContents() {

	}


	CreateTopThings() {
		this.CreateToaster();
		this._dialogLayerTex = PIXI.Texture.EMPTY;
		DataUtils.Load('img/ui/spreading/dialog_layer.png').then((res)=>{
			this._dialogLayerTex = res.texture;
		});
	}

	/** @type Toaster */
	_toaster;
	CreateToaster() {
		this._toaster = new Toaster();
		this.addChild(this._toaster);
	}

	Toast(msg, color = '#ffffff') {
		this._toaster.CreateToast(msg, color);
	}

	/** @type {Sprite} */
	_backgroundSprite;
	get bgiName() {return 'anaden_scene_bgi.png';}
	async CreateBackground() {
		this._backgroundSprite = new PIXI.TilingSprite(PIXI.Texture.EMPTY, Graphics.width, Graphics.height);
		this.addChild(this._backgroundSprite);
		const tex = new PIXI.BaseTexture((await DataUtils.Load('img/bgi/' + this.bgiName)).data);
		this._backgroundSprite.texture = new PIXI.Texture(tex);
	}

	HasNoOpenedDialog() {
		return this._dialogs.length < 1;
	}

	/**
	 * @param {Dialog} dialog
	 * @param {Function} callback
	 */
	Dialog(dialog, callback, with_layer = true) {
		if (with_layer) {
			this.addChild(new DialogLayer(this._dialogLayerTex, dialog));
		} else {
			this.addChild(dialog);
		}
		if (callback) dialog.OnReturn.add((...args)=> callback(...args));
	}

	DialogAsync(dialog, with_layer = true) {

	}
}

class DialogLayer extends PIXI.Container {
	/**
	 * 
	 * @param {PIXI.Texture} texture 
	 * @param {Dialog} dialog 
	 */
	constructor(texture = PIXI.Texture.EMPTY, dialog) {
		super();
		this._sprite = this.addChild(new PIXI.Sprite(texture));
		this._sprite.scale.set(Graphics.width/texture.width, Graphics.height/texture.height);
		this._dialog = this.addChild(dialog);
		this._sprite.on('pointertap', ()=> {this._dialog.Cancel();});
		this._dialog.OnCancel.add(()=> {$scene().removeChild(this);})
		this._sprite.interactive = true;
	}

	update() {
		this._dialog.update();
	}
}

class Toaster extends PIXI.Container {
	/** @type Toast[] */
	_toasts = [];

	update() {
		let delta = 0;
		let dels = [];
		for (let t of this._toasts) {
			t.MinusY0(delta);
			t.update();
			if (t.IsEnd()) {
				this.removeChild(t);
				dels.push(t);
				delta += Toast.Height;
			}
		}
		for (let t of dels) {
			this._toasts.remove(t);
		}
	}

	CreateToast(msg = '测试用 Toast 信息', color = '#ffffff') {
		let y = Toast.Height * this._toasts.length;
		let t = new Toast(y, msg, color);
		this._toasts.push(t);
		this.addChild(t);
	}
}
class Toast extends Sprite {
	static Length = 450;
	static Height = 48;
	static SlideSpeed = 24;
	static RiseSpeed = 4;
	static StayMax = 150;

	static State = {
		Appearing: 0,
		Staying: 1,
		Dismissing: 2,
		End: 3
	}

	_state = Toast.State.Appearing;
	_y0 = 0;

	/**
	 * @param {number} y
	 * @param {string} msg
	 * @param {string} color
	 */
	constructor(y, msg, color = '#ffffff') {
		super(new Bitmap(Toast.Length, Toast.Height));
		this.x = - Toast.Length;
		this._y0 = y;
		this.y = this._y0;
		this.bitmap.fontFace = $gameSystem.mainFontFace();
		this.bitmap.fontSize = $gameSystem.mainFontSize();
		this.bitmap.textColor = color;
		this.bitmap.DrawImage('img/ui/', 'toast_cell', 0, 0, 0, 0, Toast.Length, Toast.Height);
		this.bitmap.drawText('  ' + msg, 0, 0, Toast.Length, Toast.Height, 'left');
	}

	update() {
		super.update();
		switch(this._state) {
			case Toast.State.Appearing:
				this.UpdateAppear();
				break;
			case Toast.State.Staying:
				this.UpdateStay();
				break;
			case Toast.State.Dismissing:
				this.UpdateDismiss();
				break;
			default:
				break;
		}
	}

	MinusY0(y0) {
		this._y0 -= y0;
		if (this.y > this._y0) {
			this._state = Toast.State.Appearing;
		}
	}

	UpdateAppear() {
		let [bx, by] = [false, false];
		if (this.x >= 0) {
			this.x = 0;
			bx = true;
		} else {
			this.x += Toast.SlideSpeed;
		}
		if (this.y <= this._y0) {
			this.y = this._y0;
			by = true;
		} else {
			this.y -= Toast.RiseSpeed;
		}
		if (bx && by) {
			this._state ++;
		}
	}

	_stay = 0;
	UpdateStay() {
		this._stay += 1;
		if (this._stay > Toast.StayMax) {
			this._state ++;
		}
	}

	UpdateDismiss() {
		this.y -= Toast.RiseSpeed;
		this.opacity -= 5;
		if (this.y < -Toast.Height) {
			this._state ++;
		}
	}

	IsEnd() {
		return this._state === Toast.State.End;
	}
}

class MenuBaseScene extends CustomScene {
	CreateCustomContents() {
		super.CreateCustomContents();
		this.CreateContents();
		this.CreateTitle();
		this.CreateBackBtn();
	}

	CreateContents() {

	}

	get headerHeight() {return 55;}
	get headerWidth() {return 300;}
	get headerText() {return '初始标题';}
	/** @type Sprite */
	_titleSprite;
	CreateTitle() {
		this._titleSprite = new Sprite(new Bitmap(Graphics.width, this.headerHeight));
		this._titleSprite.bitmap.DrawImage('img/ui/', 'header_left', 0, 0, 0, 0, Graphics.width/2);
		this._titleSprite.bitmap.DrawImage('img/ui/', 'header_right', 0, 0, Graphics.width/2, 0,Graphics.width/2);
		this._titleSprite.bitmap.DrawImage('img/ui/', 'header', 0, 0, (Graphics.width - this.headerWidth)/2, 0, this.headerWidth, this.headerHeight);
		this._titleSprite.bitmap.drawText(this.headerText, 0, 0, Graphics.width, this.headerHeight, 'center');
		this.addChild(this._titleSprite);
	}

	_backBtn;
	_closeBtn;
	CreateBackBtn() {
		this._backBtn = new Button(0, 0, 108, 48, '',...Button.Presets.ANADEN_BACK, 1);
		this._backBtn.SetClickSe('se_cancel');
		this.addChild(this._backBtn);
		this._closeBtn = new Button(Graphics.width - 108, 0, 108, 48, '', ...Button.Presets.ANADEN_CLOSE, 1);
		this.addChild(this._closeBtn);
		this._backBtn.OnClick.add( SceneManager.pop.bind(SceneManager));
		this._closeBtn.OnClick.add(()=>{SceneManager.goto(MainScene);});
	}
}
