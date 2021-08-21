class Dialog extends PIXI.Container {
	constructor(x, y, w, h) {
		super();
		this.x = x;
		this.y = y;
		this._width = w;
		this._height = h;
		this.Init();
	}

    get width() {return this._width;}
    get height() {return this._height;}

	Init() {

	}


	OnReturn = new PIXI.Signal();
	OnCancel = new PIXI.Signal();

	Return() {
		this.OnReturn.dispatch();
	}

	Cancel() {
		this.OnCancel.dispatch();
        $scene().removeChild(this);
	}

	update() {
		for(const c of this.children) {
			if (c.update) c.update();
		}
	}
}

class GameSettingDialog extends Dialog {
    constructor(x = 200, y = 60, w = Graphics.width - 2*x, h = Graphics.height - y - 40) {
        super(x, y, w, h);
    }
    Init() {
        const vp = this.addChild(new ViewPortVertical(0, 0, this.width, this.height, new Paddings(15), Spreading.Presets.ANADEN_BACK));
        vp.AddItem(new TextArea('音量设定', TextStyles.SmallBlack, new Paddings(4,0,4,0), 0, 0, this.width, 0, Spreading.Presets.TEAL_BACK, 1));
        vp.contentArea.currentH += 20;
        let item = vp.AddItem(new SliderWithName(25, 0, '背景音乐', TextStyles.SmallBlack, 100, new Slider(0,0, vp.contentWidth - 150, 10, Gauge.Presets.Config, 'img/ui/control/slider_ctrl.png', 200)));
        item.slider.OnChange.add((val) => ConfigManager.bgmVolume = val);
        item.slider.SetValue(ConfigManager.bgmVolume);

        vp.contentArea.currentH += 20;
        item = vp.AddItem(new SliderWithName(25, 0, '音效', TextStyles.SmallBlack, 100, new Slider(0,0, vp.contentWidth - 150, 10, Gauge.Presets.Config, 'img/ui/control/slider_ctrl.png', 200)));
        item.slider.OnChange.add((val) => ConfigManager.seVolume = val);
        item.slider.SetValue(ConfigManager.seVolume);

        vp.contentArea.currentH += 20;
        item = vp.AddItem(new SliderWithName(25, 0, '语音', TextStyles.SmallBlack, 100, new Slider(0,0, vp.contentWidth - 150, 10, Gauge.Presets.Config, 'img/ui/control/slider_ctrl.png', 200)));
        item.slider.OnChange.add((val) => ConfigManager.meVolume = val);
        item.slider.SetValue(ConfigManager.meVolume);
    }
}