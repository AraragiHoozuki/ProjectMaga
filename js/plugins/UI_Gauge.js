class Gauge extends PIXI.Container {
    static Presets = {
        config: {
            empty: 'img/ui/gauge/gauge_config_empty.png',
            fill: 'img/ui/gauge/gauge_config_fill.png'
        }
    }
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     * @param {Object} config
     * @param {string} config.empty 
     * @param {string} config.fill 
     * @param {string} config.back 
     */
    constructor(x, y, w, h, {empty, fill, back}) {
        super();
        this.x = x;
        this.y = y;
        this._width = w;
        this._height = h;
        this._emptyPath = empty;
        this._fillPath = fill;
        this._backPath = back;
        this.Init();

        this._current = this._max = 100;
    }

    HasBack() {return this._backPath!==undefined;}
    /**  @type Spreading*/  _empty;
    /**  @type Spreading*/  _back;
    /**  @type Spreading*/  _fill;
    _inited = false;
    Init() {
        let arr =[this._emptyPath, this._fillPath];
        if(this.HasBack()) {
            arr.push(this._backPath);
        }
        DataUtils.LoadMulti(arr).then(()=>{
            this._empty = this.addChild(new Spreading(PIXI.Texture.from(this._emptyPath), 0, 0, this._width, this._height, new Paddings(4,0,4,0),1));
            if (this.HasBack()) this._back = this.addChild(new Spreading(PIXI.Texture.from(this._backPath), 0, 0, this._width, this._height, new Paddings(4,0,4,0),1));
            this._fill = this.addChild(new Spreading(PIXI.Texture.from(this._fillPath), 0, 0, this._width, this._height, new Paddings(4,0,4,0),1));
            this._inited = true;
        });
    }

    /**
     * 
     * @param {number} curr 
     * @param {number} max 
     */
    SetValue(curr, max = this._max) {
        if(curr == this._current && max == this._max) return;
        this._current = curr;
        this._max = max;
    }

    UpdateFill() {
        this._fill.width = this._width * this._current / this._max;
    }

    UpdateBack() {
        if (!this.HasBack()) return;
        if (this._back.width > this._fill.width) {
            this._back.width -= 1;
        } else {
            this._back.width = this._fill.width;
        }
    }

    update() {
        if (this._inited) {
            this.UpdateFill();
            this.UpdateBack();
        }
    }

}

class HpGauge extends Gauge {
    /** @param {Character} chr*/
    SetCharacter(chr) {
        this._chr = chr;
    }
    get chr() {return this._chr;}

    update() {
        this.SetValue(this.chr.hp, this.chr.mhp);
        super.update();
    }
}

class SliderController extends Clickable {
    constructor(x, y, w, h, tex_path) {
        super(x, y, w, h);
        this._texPath = tex_path;
        this.buttonMode = true;
        this.Init();
    }

    Init() {
        DataUtils.Load(this._texPath).then(()=>{
            this._sprite = new PIXI.Sprite.from(this._texPath);
            this._sprite.anchor.set(0.5);
            this.addChild(this._sprite);
            this.SetHitArea(new Rectangle(-this._sprite.width/2, -this._sprite.height/2, this._sprite.width, this._sprite.height));
            this.Activate();
        });
    }

    OnLeave() {
        
    }

    _delta = 0;
    get delta() {return this._delta;}

    update() {
        super.update();
        if (this.IsPressed()) {
            this._delta = TouchInput.x - this._pressPoint.x;
            if (TouchInput.isReleased()) this.OnRelease();
        } else {
            this._delta = 0;
        }
    }
}

class Slider extends PIXI.Container {
    constructor(x, y, w, h, gauge_config, ctrl, max) {
        super();
        this.x = x;
        this.y = y;
        this._height = h;
        this._width = w;
        this._max = max;
        this.CreateParts(gauge_config, ctrl);
    }

    CreateParts(gauge_config, ctrl) {
        this._gauge = new Gauge(0, 0, this._width, this._height, gauge_config);
        this._ctrl = new SliderController(0, this._height/2, 0, 0, ctrl);
        this.addChild(this._gauge, this._ctrl);
        this._ctrl.SetHandler(this._ctrl.OnPress,this.OnControllerPress.bind(this));
    }

    _moveOrigin = 0;
    OnControllerPress() {
        this._moveOrigin = this._ctrl.x;
    }

    _realValue = 0;
    get value() {return Math.floor(this._realValue);}
    update() {
        this.UpdateValue();
        this._gauge.update();
        if (this._ctrl.delta !== 0) {
            this._ctrl.x = Math.min(Math.max(this._moveOrigin + this._ctrl.delta, 0), this._width);
        }
        this._ctrl.update();
    }

    UpdateValue() {
        this._realValue = Math.floor(this._ctrl.x/this._width * this._max);
        this._gauge.SetValue(this._realValue, this._max);
    }

}