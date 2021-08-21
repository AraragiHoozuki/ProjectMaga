class Scene_Title extends CustomScene {

	get bgiName() { return 'Castle.png';}


	CreateCustomContents() {
		this.CreateTitle();
		this.CreateStarter();
		this.CreateOthers();
		this.PlayTitleMusic();
	}

	CreateTitle() {
		this._title = this.addChild(new PIXI.Text(Names.System.Title, TextStyles.Title));
		this._title.anchor.set(0.5);
		this._title.x = Graphics.width/2;
		this._title.y = Graphics.height/2 - this._title.height - 80;
	}

	CreateStarter() {
		this._starter = this.addChild(new TitleText('点击此处开始游戏', TextStyles.KaiBtn));
		this._starter.anchor.set(0.5);
		this._starter.x = Graphics.width/2;
		this._starter.y = Graphics.height - this._starter.height - 80;
		this._starter.on('pointertap', this.StartGame.bind(this));
		this._starter.interactive = true;
		this._starter.buttonMode = true;
	}

	CreateOthers() {
		let btn = new Button(0, Graphics.height - 60, 200, 60, '设定', ...Button.Presets.ANADEN_HEX, TextStyles.KaiBtnBlack);
		this.addChild(btn);
		btn.OnClick.add(()=>this.Dialog(new GameSettingDialog(), undefined, true));

		btn = new Button(200, Graphics.height - 60, 200, 60, '测试', ...Button.Presets.ANADEN_HEX, TextStyles.KaiBtnBlack);
		this.addChild(btn);
		btn.OnClick.add(SceneManager.goto.bind(SceneManager, DebugScene));
	}

	PlayTitleMusic() {
		AudioManager.PlayBgm('bgm_main_theme_piano');
		AudioManager.stopBgs();
		AudioManager.stopMe();
	}

	StartGame() {
		if (DataManager.isAnySavefileExists()) {
			DataManager.loadGame(0);
			SoundManager.playLoad();
			this.fadeOutAll();
			SceneManager.goto($dataVersion.time > 0? UpdateScene:MainScene);
		} else {
			DataManager.setupNewGame();
			this.fadeOutAll();
			SceneManager.goto($dataVersion.time > 0? UpdateScene:MainScene);
		}
	}
}


class TitleText extends PIXI.Text {
	fadding = true;
	update() {
		this.fadding ? this.alpha -= 0.02 : this.alpha += 0.02;
		if (this.alpha <= 0) {
			this.fadding = false
		} else if (this.alpha >= 1) {
			this.fadding = true;
		}
	}

}