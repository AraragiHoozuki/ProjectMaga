Scene_Title.prototype.create = function() {
	Scene_Base.prototype.create.call(this);
	this.createBackground();
	this.createForeground();
	this.createText();
};

Scene_Title.prototype.createText = function() {
	this._text = new TitleText();
	this.addChild(this._text);
};

Scene_Title.prototype.processTouch = function() {
	if (TouchInput.isTriggered()) {
		if (DataManager.isAnySavefileExists()) {
			DataManager.loadGame(0);
			SoundManager.playLoad();
			this.fadeOutAll();
			SceneManager.goto(UpdateScene);
		} else {
			DataManager.setupNewGame();
			this.fadeOutAll();
			SceneManager.goto(UpdateScene);
		}
	}

}

Scene_Title.prototype.isBusy = function() {
	return Scene_Base.prototype.isBusy.call(this);
};

Scene_Title.prototype.update = function() {
	this.processTouch()
	Scene_Base.prototype.update.call(this);
};

Scene_Title.prototype.playTitleMusic = function() {
	AudioManager.playBgm({name: 'bgm_main_theme_piano', pitch: 100, volume: 100});
	AudioManager.stopBgs();
	AudioManager.stopMe();
};

class TitleText extends Sprite {
	constructor() {
		super();
		let padding = 20;
		let bottom = 120;
		this.bitmap = new Bitmap(Graphics.boxWidth - 2 * padding, bottom);
		this.x = padding;
		this.y = Graphics.height - bottom;
		this.alpha = 0;
		this.bitmap.fontSize = 28;
		this.bitmap.drawText('点击任意区域开始游戏', 0, 0, this.width, 30, 'center');
		this._fadding = true;
	}

	update() {
		super.update();
		this.fadding ? this.alpha -= 0.02 : this.alpha += 0.02;
		if (this.alpha <= 0) {
			this.fadding = false
		} else if (this.alpha >= 1) {
			this.fadding = true;
		}
	}

}