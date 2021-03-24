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
		this.CreateDialogMask();
		this.CreateToaster();
	}

	_dialogMask;
	CreateDialogMask() {
		this._dialogMask = new Sprite(new Bitmap(Graphics.width, Graphics.height));
		let bitmap = ImageManager.LoadUIBitmap(undefined, 'mask_dark');
		this._dialogMask.bitmap.DrawTexture(bitmap, -50, -50, Graphics.width + 100, Graphics.height + 100, 22, 22, 22, 22);
		this._dialogMask.visible = false;
		this.addChild(this._dialogMask);
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
	get backgroundImageName() {return 'scene_bg_pattern';}
	CreateBackground() {
		this._backgroundSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
		let x = 0, y = 0;
		const bitmap = ImageManager.LoadUIBitmap(undefined, this.backgroundImageName);
		while (x < Graphics.width) {
			while (y < Graphics.height) {
				this._backgroundSprite.bitmap.DrawBitmap(bitmap, 0, 0, x, y, bitmap.width, bitmap.height);
				y += bitmap.height;
			}
			x += bitmap.width;
			y = 0;
		}
		this.addChild(this._backgroundSprite);
	}

	/** @type CustomWindow[] */
	_dialogs = [];
	_activeChildrenLog = [];
	get dialogBtnWidth() {return 220;}

	HasNoOpenedDialog() {
		return this._dialogs.length < 1;
	}

	/**
	 * @param {CustomWindow} window
	 * @param {boolean} withConfirm
	 * @param {boolean} withCancel
	 * @param {Function} callback
	 * @param {boolean} closeOnReturn
	 */
	Dialog(window, withConfirm = false, withCancel= false, callback, closeOnReturn = true) {
		this._dialogMask.visible = true;
		let log = [];
		this._activeChildrenLog.push(log)
		this.children.forEach(child => {
			if (child.active) {
				log.push(child);
				child.Deactivate();
			}
		});
		this._dialogs.push(window);
		this.addChild(window);
		window.Activate();
		let cob, cab;
		if (withConfirm) {
			cob = new Button('确定', 'btn_pos', Graphics.width/2 + 50, Graphics.height - 94, this.dialogBtnWidth, 80, undefined, new Paddings(25), undefined, new Paddings(25));
			this.addChild(cob);
		}

		if (withCancel) {
			cab = new Button('取消', 'btn_neg', Graphics.width/2 - 50 - this.dialogBtnWidth, Graphics.height - 94, this.dialogBtnWidth, 80, undefined, new Paddings(25), undefined, new Paddings(25));
			cab.SetClickSe('se_cancel');
			this.addChild(cab);
			cab.SetHandler(cab.OnClick, (()=> {
				this.DialogReturn(false, callback, true);
				this.removeChild(cob);
				this.removeChild(cab);
			}));
		}
		if (withConfirm) {
			cob.SetHandler(cob.OnClick, (()=> {
				this.DialogReturn(true, callback, closeOnReturn);
				if (closeOnReturn) {
					this.removeChild(cob);
					this.removeChild(cab);
				}
			}));
		}

	}

	/**
	 * @param {boolean} confirm
	 * @param {Function} callback
	 * @param {boolean} closeOnReturn
	 */
	DialogReturn(confirm, callback, closeOnReturn = true) {
		let w = this._dialogs[this._dialogs.length - 1];
		if (closeOnReturn) {
			this._dialogs.pop();
			if (w) {
				w.Close();
				this.removeChild(w);
			}
			let log = this._activeChildrenLog.pop();
			log.forEach(child => child.Activate());
			if (this._dialogs.length <= 0) {
				this._dialogMask.visible = false;
			}
		}
		callback(confirm, w);
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
		this._backBtn = new Button('', 'btn_back', 0, 0, 108, 48);
		this._backBtn.SetClickSe('se_cancel');
		this.addChild(this._backBtn);
		this._closeBtn = new Button('', 'btn_close', Graphics.width - 108, 0, 108, 48);
		this.addChild(this._closeBtn);
		this._backBtn.SetHandler(this._backBtn.OnClick, SceneManager.pop.bind(SceneManager));
		this._closeBtn.SetHandler(this._closeBtn.OnClick,()=>{SceneManager.goto(MainScene);});
	}
}

class DebugScene extends MenuBaseScene {
	CreateCustomContents() {
		super.CreateCustomContents();
		this.CreateCharList();
		this.CreateButtons();
	}

	CreateCharList() {
		this._charListWindow = new CharacterListWindow(0, 0, Graphics.width, Graphics.height, '', 0);
		this.addChild(this._charListWindow);
		this._charListWindow.MakeList();
		this._charListWindow.Activate();
	}

	CreateButtons() {
		let btn = new Button('Test', 'btn_lc_cmn', 500, 200, 200, 60, 'btn_hover_azure', new Paddings(10), new Paddings(16), new Paddings(22));
		this.addChild(btn);
		btn.SetHandler(btn.OnClick, this.TestFunc.bind(this));

		btn = new Button('LWF测试', 'btn_pos', 300, 400, 200, 80, undefined, new Paddings(25), undefined, new Paddings(25));
		this.addChild(btn);
		btn.SetHandler(btn.OnClick, this.TestLwf.bind(this));

		btn = new Button('数字测试', 'btn_pos', 600, 400, 200, 80, undefined, new Paddings(25), undefined, new Paddings(25));
		this.addChild(btn);
		btn.SetHandler(btn.OnClick, this.TestNumber.bind(this));
		const n = new NumberSprite(1280, 0, 1000, 'number_azure', 'right');
		this.addChild(n);
		this._number = n;
	}

	TestFunc() {
		//BattleFlow.BeginBattle("ES_TEST");
		this.Toast('特朗普跟小三跑了！', '#dd004d');
	}

	TestLwf() {
		let name = prompt();
		if (name)
			LWFUtils.PlayLwf('lwf/battleLwf/', name, 500, 300);
	}

	TestNumber() {
		let name = prompt();
		this._number.SetNumber(parseInt(name));
	}
}

Scene_Title.prototype.commandNewGame = function() {
	DataManager.setupNewGame();
	this._commandWindow.close();
	this.fadeOutAll();
	SceneManager.goto(MainScene);
};