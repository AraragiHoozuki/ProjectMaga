const GraphicsInteractivityChange = {};
GraphicsInteractivityChange.Video_createElement= Video._createElement;
Video._createElement = function() {
    GraphicsInteractivityChange.Video_createElement.call(this);
    this._element.style.pointerEvents = "none";
};
GraphicsInteractivityChange.GraphicsFPSCounter_createElements = Graphics.FPSCounter.prototype._createElements;
Graphics.FPSCounter.prototype._createElements = function() {
    GraphicsInteractivityChange.GraphicsFPSCounter_createElements.call(this);
    this._boxDiv.style.pointerEvents = "none";
    this._labelDiv.style.pointerEvents = "none";
    this._numberDiv.style.pointerEvents = "none";
};
GraphicsInteractivityChange.Graphics_createErrorPrinter = Graphics._createErrorPrinter;
Graphics._createErrorPrinter = function() {
    GraphicsInteractivityChange.Graphics_createErrorPrinter.call(this);
    this._errorPrinter.style.pointerEvents = 'none';
};

/**
 * Enum for predefined colors
 * @readonly
 * @enum {string}
 */
const Colors = {
    White: '#ffffff',
    Black: '#000000',
    Red: '#f44336',
    Pink: '#e91e63',
    Purple: '#9c27b0',
    Blue: '#2196f3',
    Indigo: '#3f51b5',
    Cyan: '#00bcd4',
    Teal: '#009688',
    Green: '#4caf50',
    Lime: '#cddc39',
    Yellow: '#ffeb3b',
    Amber: '#ffc107',
    Orange: '#ff9800',
    Brown: '#795548',
    Gray: '#9e9e9e',
    BlueGray: '#607d8b'
}

class Paddings {
    /**
     * @param {number} left
     * @param {number} top
     * @param {number} right
     * @param {number} bottom
     */
    constructor(left = 0, top = left, right = left, bottom = top) {
        this._left = left;
        this._top = top;
        this._right = right;
        this._bottom = bottom;
    }
    _left = 0;
    _top = 0;
    _right = 0;
    _bottom = 0;
    /** @returns number */
    get left() { return this._left; }
    /** @returns number */
    get top() { return this._top; }
    /** @returns number */
    get right() { return this._top; }
    /** @returns number */
    get bottom() { return this._bottom; }
}

//#region font
let _Scene_Boot_prototype_loadGameFonts = Scene_Boot.prototype.loadGameFonts;
Scene_Boot.prototype.loadGameFonts = function() {
    _Scene_Boot_prototype_loadGameFonts.call(this);
    FontManager.load("kai", '魏碑字体.ttf');
    FontManager.load("xin", 'zhulangbaoren.otf');
};

const TextStyles = {
    Normal: {
        "dropShadowAlpha": 0.8,
        "dropShadowAngle": -16.2,
        "dropShadowBlur": 3,
        "dropShadowDistance": 4,
        "fill": "white",
        "fontFamily": "rmmz-mainfont",
        "fontSize": 36,
        "strokeThickness": 2
    },
    KaiTitle: {
        "dropShadow": true,
        "dropShadowAlpha": 0.8,
        "dropShadowAngle": -16,
        "dropShadowBlur": 3,
        "dropShadowDistance": 4,
        "fill": [
            "white",
            "#ededed"
        ],
        "fontFamily": "kai",
        "fontSize": 45,
        "strokeThickness": 2
    },
    CharTitle: {
        "align": "center",
        "dropShadow": true,
        "dropShadowAlpha": 0.8,
        "dropShadowAngle": -16,
        "dropShadowBlur": 3,
        "dropShadowDistance": 4,
        "fill": [
            "white",
            "#ededed"
        ],
        "fontFamily": "xin",
        "fontSize": 64,
        "strokeThickness": 2
    },
}
//#endregion

class Clickable extends PIXI.Container {
    constructor(x = 0, y = 0, w = 0, h = 0) {
        super();
        this.x = x;
        this.y = y;
        this._width = w;
        this._height = h;
        this.InitiateEvents();
        this.Deactivate();
    }

    get width() {return this._width;}
    get w() {return this._width;}
    get height() {return this._height;}
    get h() {return this._height;}

    /**
     * @returns {boolean}
     */
    get active() { return this._active;}
    Activate() { this._active = this.interactive = true;}
    Deactivate() { this._active = this.interactive = false;}

    Enable(bool = true) {
        if (bool) this.Activate();
        else this.Deactivate();
    }

    Disable() {
        this.Enable(false);
    }

    /**  @returns {boolean} */
    IsMouseOver() {
        const pos = this.worldTransform.applyInverse(new Point(TouchInput.x, TouchInput.y));
        return pos.x >= 0 && pos.x <= this.w && pos.y >= 0 && pos.y <= this.h;
    }
    /** @returns {boolean} */
    IsPressed() {
        return this._pressTimer !== false;
    }

    IsEnabled() {
        return this.visible && this._active;
    }

    _pressed = false;
    _longPressed = false;
    _pressPoint = new Point(0, 0);
    _releasePoint = new Point(0, 0);
    _pressTimer = false;
    _longPressThreshold = 30;

    InitiateEvents() {
        this.SetHitArea(new PIXI.Rectangle(0, 0, this.w, this.h));
        this.on('pointerdown', this.OnPress.bind(this));
        this.on('pointerout', this.OnLeave.bind(this));
        this.on('pointertap', this.OnClick.bind(this));
        this.on('pointerup', this.OnRelease.bind(this));
    }

    /**
     * @param {PIXI.Graphics} area 
     */
    SetHitArea(area) {
        this.hitArea = area;
    }
    
    update() {
        if (!this.IsEnabled()) return;
        if (this.IsPressed()) {
            this._pressTimer++;
            if (this._pressTimer >= this._longPressThreshold && !this._longPressed) this.OnLongPress();
        }
        for (const child of [...this.children].reverse()) {
            if (child.update) {
                child.update();
            }
        }
        // if (this._pressed) {
        //     if (this.IsMouseOver()) {
        //         if (!this._longPressed && TouchInput.isLongPressed()) {
        //             this._longPressed = true;
        //             this.OnLongPress();
        //         }
        //         if(TouchInput.isReleased()) {
        //             if(this._longPressed) {
        //                 this.OnLongPressRelease(true);
        //             } else if(TouchInput.isClicked()){
        //                 this.OnClick();
        //             }
        //             this._pressed = false;
        //             this._longPressed = false;
        //             this.OnRelease();
        //         }
        //     } else {
        //         if(this._longPressed) {
        //             this.OnLongPressRelease(false);
        //         }
        //         this._pressed = false;
        //         this._longPressed = false;
        //         this.OnRelease();
        //     }
        // } else if (TouchInput.isTriggered()&&this.IsMouseOver()) {
        //     this._pressed = true;
        //     this.OnPress();
        // }
    }

    OnPress() {
        this._pressPoint.set(TouchInput.x, TouchInput.y);
        console.log('press');
        this._pressTimer = 0;
        this.CallHandler(this.OnPress.name);
        
    }

    OnLeave() {
        if (this.IsPressed()) this.OnRelease();
    }

    OnRelease() {
        this._releasePoint.set(TouchInput.x, TouchInput.y);
        this._pressTimer = false;
        this._longPressed = false;
        const long = this._pressTimer >= this._longPressThreshold?true:false;
        if (long) {
            this.OnLongPressRelease();
        } else {
            console.log('release');
            this.CallHandler(this.OnRelease.name);
        }
    }

    OnClick() {
        console.log('click');
        this.CallHandler(this.OnClick.name);
    }

    OnLongPress() {
        console.log('long press start');
        this._longPressed = true;
        this.CallHandler(this.OnLongPress.name);
    }

    OnLongPressRelease() {
        console.log(`long press release`);
        this.CallHandler(this.OnLongPressRelease.name);
    }

    _handlers = {};

    /**
     * @param {Function} func
     * @param {Function} handle_func
     * @param args
     */
    SetHandler(func, handle_func, ...args) {
        if(!this[func.name]) {
            throw new Error(`No method named ${func.name} found!`);
        } else {
            this._handlers[func.name] = handle_func.bind(this, ...args);
        }
    }

    CallHandler(name) {
        if(this._handlers[name]) {
            this._handlers[name]();
        }
    }
}

/**
 * 平铺图像，在保障边缘不扭曲的情况下，可以画出任意大小的类矩形区域。
 */
class Spreading extends PIXI.Container {
    /**
     * 
     * @param {PIXI.Texture} tex 
     * @param {number} y 
     * @param {number} x 
     * @param {number} w 
     * @param {number} h 
     * @param {Paddings} p 
     * @param {number} mode - 0 for tiling, 1 for stretching
     */
    constructor(tex, x, y, w, h, p, mode = Spreading.Mode.Tile) {
        super();
        this.x = x;
        this.y = y;
        this._width = w;
        this._height = h;
        this._paddings = p;
        this._texture = tex;
        this._mode = mode;
        for (let i = 0; i < 9; i++) {
            this._sprites.push(this.addChild(new PIXI.Sprite()));
        }
        this.RefreshSprites();
    }

    static Mode = {
        Tile: 0,
        Stretch: 1
    }

/**
 * @typedef {Object} SpreadingConfig
 * @property {string} path
 * @property {[number]} paddings
 */
    static Configs = {
        ANADEN_CELL: {
            path: 'img/ui/spreading/cell_cmn.png',
            paddings: [15]
        }
    }

    _width;
    get width() {return this._width;}
    set width(val) {if (val !== this._width) this._width = val; this.RefreshSprites();}
    _height;
    get height() {return this._height;}
    set height(val) {if (val !== this._height) this._height = val; this.RefreshSprites();}

    _sprites = [];

    /**
     * 
     * @param {PIXI.Texture} tex 
     * @param {Paddings} p 
     */
    SetTexture(tex, p)  {
        this._texture = tex,
        this._paddings = p;
        this.RefreshSprites();
    }

    RefreshSprites() {
        const p = this._paddings;
        const tex = this._texture;
        let sp, ft;
        const list = [
            [0, 0, p.left, p.top], //左上角
            [tex.width - p.right, 0, p.right, p.top], //右上角
            [0, tex.height - p.bottom, p.left, p.bottom], //左下角
            [tex.width - p.right, tex.height - p.bottom, p.right, p.bottom], //右下角
            [p.left, 0, tex.width - p.left - p.right, p.top], //上
            [p.left, tex.height - p.bottom, tex.width - p.left - p.right, p.bottom], //下
            [0, p.top, p.left, tex.height - p.top - p.bottom], //左
            [tex.width - p.right, p.top, p.right, tex.height - p.top - p.bottom] //右
        ];
        for(let i = 0; i < 8; i++) {
            ft = new PIXI.Texture(tex, new Rectangle(...(list[i])));
            sp = this._sprites[i];
            sp.texture = ft;
            if ( i >= 4) {
                if (i <= 5) {sp.scale.x = (this.width - p.left - p.right)/list[i][2];}
                else {sp.scale.y = (this.height - p.top - p.bottom)/list[i][3];}
            }
        }

        ft = new PIXI.Texture(tex, new Rectangle(p.left, p.top, tex.width - p.left - p.right, tex.height - p.top - p.bottom));
        sp = this._sprites[8];
        if (this._mode === Spreading.Mode.Tile) {
            sp = this._sprites.pop();
            this.removeChild(sp);
            sp = new PIXI.TilingSprite(ft, this.width - p.left - p.right, this.height - p.top - p.bottom);
            this.addChild(sp);
            this._sprites.push(sp);
        } else {
            sp.texture = ft;
            sp.scale.x = (this.width - p.left - p.right)/(this._texture.width - p.left - p.right);
            sp.scale.y = (this.height - p.top - p.bottom)/(this._texture.height -  p.top - p.bottom);
        }
        
        [this._sprites[0].x, this._sprites[0].y] = [0, 0];
        [this._sprites[1].x, this._sprites[1].y] = [this.width - p.right, 0];
        [this._sprites[2].x, this._sprites[2].y] = [0, this.height - p.bottom];
        [this._sprites[3].x, this._sprites[3].y] = [this.width - p.right, this.height - p.bottom];
        [this._sprites[4].x, this._sprites[4].y] = [p.left, 0];
        [this._sprites[5].x, this._sprites[5].y] = [p.left, this.height - p.bottom];
        [this._sprites[6].x, this._sprites[6].y] = [0, p.top];
        [this._sprites[7].x, this._sprites[7].y] = [this.width - p.right, p.top];
        [this._sprites[8].x, this._sprites[8].y] = [p.left, p.top];
    }
}



/**
 * @param {Bitmap} bitmap 
 * @param {number} dx 
 * @param {number} dy 
 * @param {number} dw 
 * @param {number} dh 
 * @param {number} lx 
 * @param {number} rx 
 * @param {number} uy 
 * @param {number} by 
 */
Bitmap.prototype.DrawTexture = function(bitmap, dx, dy, dw, dh, lx, rx = lx, uy, by = uy) {
    let w = bitmap.width - lx - rx;
    let h = bitmap.height - uy - by;

    //left top
    this.blt(bitmap, 0, 0, lx, uy, dx, dy, lx, uy);
    //top
    this.blt(bitmap, lx, 0, w, uy, dx + lx, dy, dw - lx - rx, uy);
    //right top
    this.blt(bitmap, lx + w, 0, rx, uy, dx + dw - rx, dy, rx, uy);
    //left bottom
    this.blt(bitmap, 0, uy + h, lx, by, dx, dy + dh - by, lx, by);
    //bottom
    this.blt(bitmap, lx, uy + h, w, by, dx + lx, dy + dh - by, dw - lx -rx, by);
    //right bottom
    this.blt(bitmap, lx + w, uy + h, rx, by, dx + dw - rx, dy + dh - by, rx, by);
    //left
    this.blt(bitmap, 0, uy, lx, h, dx, dy + uy, lx, dh - uy - by);
    //right
    this.blt(bitmap, lx + w, uy, rx, h, dx + dw - rx, dy + uy, rx, dh - uy - by);

    //center
    this.blt(bitmap, lx, uy, w, h, dx + lx, dy + uy, dw - lx - rx, dh - uy - by);
};

/**
 *
 * @param folder {string}
 * @param filename {string}
 * @param pw {number}
 * @param ph {number}
 * @param dx {number}
 * @param dy {number}
 * @param dw {number}
 * @param dh {number}
 * @param pd {Paddings}
 */
Bitmap.prototype.DrawImage = function(folder, filename, pw, ph, dx, dy, dw = pw, dh = ph, pd = new Paddings()) {
    let bitmap = ImageManager.loadBitmap(folder, filename);
    pw = pw || bitmap.width;
    ph = ph || bitmap.height;
    this.blt(bitmap, 0, 0, pw, ph, dx + pd.left, dy + pd.top, dw - pd.left - pd.right, dh - pd.top - pd.bottom);
};

/**
 *
 * @param folder {string}
 * @param filename {string}
 * @param pw {number} - 0 for original
 * @param ph {number} - 0 for original
 * @param rect {Rectangle}
 * @param pd {Paddings}
 */
Bitmap.prototype.DrawImageInRect = function(folder, filename, pw, ph, rect, pd= new Paddings()) {
    this.DrawImage(folder, filename, pw, ph, rect.x, rect.y, rect.width, rect.height, pd);
}

/**
 * @param bitmap {Bitmap}
 * @param pw {number}
 * @param ph {number}
 * @param dx {number}
 * @param dy {number}
 * @param dw {number}
 * @param dh {number}
 * @param pd {Paddings}
 */
Bitmap.prototype.DrawBitmap = function(bitmap, pw, ph, dx, dy, dw = pw, dh = ph, pd = new Paddings()) {
    pw = pw || bitmap.width;
    ph = ph || bitmap.height;
    this.blt(bitmap, 0, 0, pw, ph, dx + pd.left, dy + pd.top, dw - pd.left - pd.right, dh - pd.top - pd.bottom);
};


/**
 *
 * @param {string} name
 * @param {number} edge
 * @param {number} x
 * @param {number} y
 * @param {number} length - bar length
 * @param {number} value - current value
 * @param {number} max - max value
 */
Bitmap.prototype.DrawProgressBar = function(name, edge = 0, x, y, length, value, max) {
    let bar = ImageManager.loadBitmap('img/ui/', 'ProgressBar' + name + '_Empty', 0, true);
    let filling = ImageManager.loadBitmap('img/ui/', 'ProgressBar' + name + '_Filling', 0, true);

    this.blt(bar, 0, 0, edge, bar.height, x, y, edge, bar.height);
    this.blt(bar, edge, 0, bar.width - 2 * edge, bar.height, x + edge, y, length - 2 * edge, bar.height);
    this.blt(bar, bar.width - edge, 0, edge, bar.height, x + length - edge, y, edge, bar.height);

    let filling_l = Math.min(length * value / max, length);
    if (filling_l <= edge) {
        this.blt(filling, 0, 0, filling_l, filling.height, x, y, filling_l, filling.height);
    } else {
        this.blt(filling, 0, 0, edge, filling.height, x, y, edge, filling.height);
        this.blt(filling, edge, 0, filling.width - 2 * edge, filling.height, x + edge, y, filling_l - 2 * edge, filling.height);
        this.blt(filling, filling.width - edge, 0, edge, filling.height, x + filling_l - edge, y, edge, filling.height);
    }
    this.fontSize -= 4;
    this.drawText(value + '/' + max, x, y + this.fontSize/4, length, this.fontSize,'right');
    this.fontSize += 4;
};