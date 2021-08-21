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
        this.SetSignals();
        this.on('pointerdown', this.ProcessPress.bind(this));
        this.on('pointerout', this.ProcessLeave.bind(this));
        this.on('pointertap', this.ProcessClick.bind(this));
        this.on('pointerup', this.ProcessRelease.bind(this));
    }

    /**
	 * @param {number} x - target x coordinate
	 * @param {number} y - target y coordinate
	 */
	Move(x, y) {
		this.x = x;
		this.y = y;
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
            if (this._pressTimer >= this._longPressThreshold && !this._longPressed) this.ProcessLongPress();
        }
        for (const child of [...this.children].reverse()) {
            if (child.update) {
                child.update();
            }
        }
    }

    SetSignals() {
        this.OnClick = new PIXI.Signal();
        this.OnPress = new PIXI.Signal();
        this.OnLeave = new PIXI.Signal();
        this.OnRelease = new PIXI.Signal();
        this.OnLongPress = new PIXI.Signal();
        this.OnLongPressRelease = new PIXI.Signal();
    }

    ProcessPress() {
        this._pressPoint.set(TouchInput.x, TouchInput.y);
        this._pressTimer = 0;
        this.OnPress.dispatch();
    }

    ProcessLeave() {
        if (this.IsPressed()) this.ProcessRelease();
    }

    ProcessRelease() {
        this._releasePoint.set(TouchInput.x, TouchInput.y);
        this._pressTimer = false;
        this._longPressed = false;
        const long = this._pressTimer >= this._longPressThreshold?true:false;
        if (long) {
            this.ProcessLongPressRelease();
        } else {
            this.OnRelease.dispatch();
        }
    }

    ProcessClick() {
        this.OnClick.dispatch();
    }

    ProcessLongPress() {
        this._longPressed = true;
        this.OnLongPress.dispatch();
    }

    ProcessLongPressRelease() {
        this.OnLongPressRelease.dispatch();
    }

    
}

class Draggable extends Clickable {
    _isDragging = false;
    _dragOrigin = new Point(0, 0);

    SetSignals() {
        super.SetSignals();
        this.OnDragEnd = new PIXI.Signal();
    }

    ProcessLongPress() {
        super.ProcessLongPress();
        this._isDragging = true;
        this._dragOrigin.set(this.x, this.y);
    }

    ProcessRelease() {
        super.ProcessRelease();
        if (this._isDragging) {
            this._isDragging = false;
            this.position.set(this._dragOrigin.x, this._dragOrigin.y);
            this.OnDragEnd.dispatch();
        }
    }

    update() {
        super.update();
        if (this._isDragging) {
            this.x = this._dragOrigin.x + TouchInput.x - this._pressPoint.x; 
            this.y = this._dragOrigin.y + TouchInput.y - this._pressPoint.y; 
        }
    }
}

/**
 * 平铺图像，在保障边缘不扭曲的情况下，可以画出任意大小的类矩形区域。
 */
class Spreading extends PIXI.Container {
    /**
 * @typedef {Object} SpreadingPreset
 * @property {string} path
 * @property {[number]} paddings
 */

     static Presets = {
        ANADEN_CELL: { path: 'img/ui/spreading/anaden_cell_cmn.png', paddings: [15]},
        ANADEN_BACK: { path: 'img/ui/spreading/anaden_back.png', paddings: [15]},
        ANADEN_BTN_PURPLE: {path: 'img/ui/spreading/anaden_btn_purple.png', paddings: [0]},
        ANADEN_BTN_PRESSED: {path: 'img/ui/spreading/anaden_btn_pressed.png', paddings: [0]},

        ANADEN_CHAR_INFO_AREA: {path: 'img/ui/spreading/anaden_char_slot_infoarea.png', paddings: [8,42,8,8]},
        ANADEN_CHR_SLOT_FRAME: {path: 'img/ui/spreading/anaden_char_slot.png', paddings: [18]},
        ANADEN_CHR_SLOT_FRAME_PRESSED: {path: 'img/ui/spreading/anaden_char_slot_pressed.png', paddings: [14]},

        PARTY_SLOT_EMPTY: {path: 'img/ui/spreading/party_slot_empty.png', paddings: [10]},
        TEAL_BACK : {path: 'img/ui/spreading/back_teal.png', paddings: [2]}
    }

    static Mode = {
        Tile: 0,
        Stretch: 1
    }

    /**
     * 
     * @param {PIXI.Texture} tex 
     * @param {number} y 
     * @param {number} x 
     * @param {number} w 
     * @param {number} h 
     * @param {Object} preset
     * @param {string} preset.path 
     * @param {number[]} preset.paddings 
     * @param {number} mode - 0 for tiling, 1 for stretching
     */
    constructor(x, y, w, h, {path, paddings}, mode = Spreading.Mode.Tile) {
        super();
        this.x = x;
        this.y = y;
        this._width = w;
        this._height = h;
        this._paddings = new Paddings(...paddings);
        this._texPath = path;
        this._mode = mode;
        for (let i = 0; i < 9; i++) {
            this._sprites.push(this.addChild(new PIXI.Sprite()));
        }
        this.Init();
    }

    _inited = false;
    Init() {
        
        if (this._texPath === undefined) {
            this._texture = PIXI.Texture.EMPTY;
            this._inited = true;
            this.RefreshSprites();
        } else {
            DataUtils.Load(this._texPath).then((res) => {
                this._texture = new PIXI.Texture(new PIXI.BaseTexture(res.data));
                this._inited = true;
                this.RefreshSprites();
            });
        }
    }



    _width;
    get width() {return this._width;}
    set width(val) {if (val !== this._width) this._width = val; this.RefreshSprites();}
    _height;
    get height() {return this._height;}
    set height(val) {if (val !== this._height) this._height = val; this.RefreshSprites();}

    get paddings() { return this._paddings;}

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
        if (!this._inited) return;
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

class VPContentArea extends PIXI.Container {
    update() {
        for (const child of this.children) {
            if (child.update) {
                child.update();
            }
        }
    }
}

class VerticalLayoutContentArea extends VPContentArea {
    _currentH = 0;
    addChild(c) {
        c.y = this._currentH;
        this._currentH += c.height;
        super.addChild(c);
    }

    get currentH() {return this._currentH;}
    set currentH(val) { this._currentH = val;}
}

class HorizontalLayoutContentArea extends VPContentArea {
    _currentW = 0;
    addChild(c) {
        c.x = this._currentW;
        this._currentW += c.width;
        super.addChild(c);
    }

    get currentW() {return this._currentW;}
    set currentW(val) { this._currentW = val;}
}

class TilingLayoutContentArea extends VPContentArea {
    /**
     * 
     * @param {number} w 
     * @param {number} h 
     * @param {number} horizontalMain - 如果为 true, 则横排，超过宽度后换行， 否则竖排，超过高度后换列 
     */
    constructor(w, h, horizontal = true) {
        this._maxW = w;
        this._maxH = h;
        this._horizontal = horizontal;
    }
    _startPoint = new Point(0,0);
    _maxPoint = new Point(0, 0);
    addChild(c) {
        if (this._horizontal) {
            if (c.width + this._startPoint.x > this._maxW) {
                c.x = this._startPoint.x = 0;
                c.y = this._maxPoint.y;
                this._maxPoint.y += c.height;
            } else {
                c.x = this._startPoint.x;
                c.y = this._startPoint.y;
                this._startPoint.x += c.width;
                this._maxPoint.y = Math.max(this._maxPoint.y, this._startPoint.y + c.height);
            }
        }
        super.addChild(c);
    }
}

class ViewPort extends Clickable {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     * @param {Paddings} p 
     * @param {SpreadingPreset} spr_conf
     * @param {number} mode
     */
    constructor(x, y, w, h, p, spr_conf, mode = 1) {
        super(x, y, w, h);
        this._paddings = p;
        this._sprConf = spr_conf;
        this._sprMode = mode;
        this.Init();
    }

    get contentWidth() {
        return this.width - this._bg._paddings.left - this._bg._paddings.right;
    }

    get contentArea() {return this._contentArea;}

    Init() {
        this._bg = this.addChild(new Spreading(0, 0, this._width, this._height, this._sprConf, this._sprMode));
        this.CreateContentArea();
        this.CreateScroller();
        this.ConfigContentArea();
        this.Activate();
    }


    CreateContentArea() {
        this._contentArea = new VPContentArea();
        this.addChild(this._contentArea);
    }

    CreateScroller() {
        this._scroller = this.addChild(new Spreading(this._width - 4 - this._paddings.left, 0, 4, 5, {path: undefined, paddings: [0,2,0,2]}, 1));
    }

    ConfigContentArea() {
        this._contentArea.x = this._paddings.left;
        this._contentArea.y = this._paddings.top;
        const mask = new PIXI.Graphics()
            .beginFill(0xFFFFFF)
            .drawRect(this._paddings.left, this._paddings.top, this._width - this._paddings.left - this._paddings.right, this._height - this._paddings.top - this._paddings.bottom)
            .endFill();
        this.addChild(mask);
        this._contentArea.mask = mask;
        this._scroller.mask = mask;
    }

    

    _items = [];
    get items() {return this._items;}
    AddItem(it) {
        this._contentArea.addChild(it);
        this._items.push(it);
        return it;
    }

    update() {
        super.update();
        this.UpdateInertia();
        this.UpdateScroll();
        this.UpdateBorderBouncing();
        this.UpdateContentScroll();
        this.UpdateScroller();
    }

    //#region Scroll
    _scrollEnabledX = false;
    _scrollEnabledY = false;
    EnableXScroll(bool) {this._scrollEnabledX = bool === true;}
    EnableYScroll(bool) {this._scrollEnabledY = bool === true;}

    SetScroll(x, y) {
        if (this._scrollEnabledX) this._scrollX = x;
        if (this._scrollEnabledY) this._scroll = y;
    }
    AddScroll(x, y) {
        if (this._scrollEnabledX) this._scrollX += x;
        if (this._scrollEnabledY) this._scroll += y;
    }

    static InertiaAttenuation  = 0.94;

    _scroll = 0;
    _scrolling = 0;
    _scrollX = 0;
    _scrollingX = 0;
    /*** @returns {number} */
    get scroll() { return this._scroll + this._scrolling; }
    /*** @returns {number} */
    get scrollX() { return this._scrollX + this._scrollingX; }
    /*** @returns {number} */
    get scrollPadding() { return 12; }

    _inertia = 0;
    _inertiaX = 0;
    UpdateInertia() {
        if (!this.IsPressed() && (this._inertia > 1 || this._inertia < -1)) {
            if (this._scrollEnabledY && (this._inertia > 1 || this._inertia < -1)) {
                this._scroll += this._inertia;
                this._inertia = this._inertia * ViewPort.InertiaAttenuation;
            }
            if (this._scrollEnabledX && (this._inertiaX > 1 || this._inertiaX < -1)) {
                this._scrollX += this._inertiaX;
                this._inertiaX = this._inertiaX * ViewPort.InertiaAttenuation;
            }
        }
    }

    _lastY = 0;
    _lastX = 0;
    UpdateScroll() {
        if (this.IsPressed()) {
            if (this._scrollEnabledY) {
                const y = TouchInput.y;
                this._scrolling = y - this._pressPoint.y;
                this._inertia = y - this._lastY;
                this._lastY = y;
            }
            if (this._scrollEnabledX) {
                const x = TouchInput.x;
                this._scrollingX = x - this._pressPoint.x;
                this._inertiaX = x - this._lastX;
                this._lastX = x;
            }
        }
    }

    ProcessRelease() {
        super.ProcessRelease();
        if (this._scrollEnabledY) {
            this._scroll += this._scrolling;
            this._scrolling = 0;
        }
        if (this._scrollEnabledX) {
            this._scrollX += this._scrollingX;
            this._scrollingX = 0;
        }
    }



    UpdateBorderBouncing() {
        if (this.IsPressed()) return;
        if (this._scrollEnabledY) {
            if (this._scroll > 0) {
                this._scroll -= (this._scroll) / 3;
                if (this._scroll < 1) this._scroll = 0;
            }
    
            const min = -this._contentArea.height + 100;
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
            const min = -this._contentArea.width + 100;
            if (this._scrollX < min) {
                this._scrollX -= (this._scrollX -min) / 3;
                if (min- this._scrollX < 1) this._scrollX = min;
            }
        }
    }

    UpdateContentScroll() {
        if (this._scrollEnabledY) this._contentArea.y = this.scroll + this._paddings.top;
        if (this._scrollEnabledX) this._contentArea.x = this.scrollX + this._paddings.left; 
    }

    UpdateScroller() {
        if (this._contentArea.height <= this.height - this._paddings.top - this._paddings.bottom) {
            this._scroller.visible = false;
        } else {
            this._scroller.visible = true;
            this._scroller.height = (this.height - this._paddings.top - this._paddings.bottom)*(this.height - this._paddings.top - this._paddings.bottom)/(this._contentArea.height + 100);
            this._scroller.y = (-this.scroll) / (this._contentArea.height - 100) * (this.height - this._paddings.top - this._paddings.bottom - this._scroller.height);
        }
    }
    //#endregion
}

class ViewPortVertical extends ViewPort {
    CreateContentArea() {
        this._contentArea = new VerticalLayoutContentArea();
        this.addChild(this._contentArea);
    }
}

class ViewPortHorizontal extends ViewPort {
    CreateContentArea() {
        this._contentArea = new HorizontalLayoutContentArea();
        this.addChild(this._contentArea);
    }
}



//# region bitmap
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
//#endregion