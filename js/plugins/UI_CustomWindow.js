
class CustomWindow extends Clickable {
    _title = '';
    _titleHeight = 0;
    /** @type Bitmap */
    _titleTexture;
    /** @type Bitmap */
    _backTexture;
    _active = false;
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {string} title 
     * @param {string} titlebg 
     * @param {number} th - title height
     * @param {string} bg 
     */
    constructor(x, y, w, h, title, th, titlebg = 'wd_title_cmn', bg = 'wd_back_cmn') {
        super();
        this._title = title;
        this._titleHeight = th;
        this._contentPaddings = new Paddings(16);
        this.Create();
        this.titleTexture = ImageManager.LoadUIBitmap(undefined, titlebg);
        this.backTexture = ImageManager.LoadUIBitmap(undefined, bg);
        this.Move(x, y, w, h);
    }

    get backTexture() { return this._backTexture;}
    set backTexture(val) {
        if (this._backTexture !== val) {
            this._backTexture = val;
            this._backTexture.addLoadListener(this.OnBackTextureLoaded.bind(this));
        }
    }

    get titleTexture() { return this._titleTexture;}
    set titleTexture(val) {
        if (this._titleTexture !== val) {
            this._titleTexture = val;
            this._titleTexture.addLoadListener(this.OnTitleTextureLoaded.bind(this));
        }
    }

    /** @returns {Bitmap} */
    get content() { return this._contentSprite.bitmap; }

    /** @returns number */
    get contentAreaHeight() {return this.height - this._titleHeight;}
    /** @returns number */
    get contentHeight() { return this.contentAreaHeight - this.paddings.top - this.paddings.bottom; }
    /** @returns number */
    get contentWidth() { return this.width - this.paddings.left - this.paddings.right; }

    _contentPaddings;
    /**
     * content paddings
     * @returns {Paddings}
     */
    get paddings() { return this._contentPaddings; }
    //#region Options
    /**
     * [left, right, top, bottom]
     * @returns {Paddings}
     */
    get BackBorders() {
        return new Paddings(12);
    }
    /**
     * [left, right, top, bottom]
     * @returns {Paddings}
     */
    get TitleBorders() {
        return new Paddings(12, 12, 12, 0);
    }
    //#endregion

    //#region Basic Methods
    /**
     * @param {number} x - x coordinate
     * @param {number} y - y coordinate
     * @param {number} width
     * @param {number} height
     */
    Move(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        if (this._width !== width || this._height !== height) {
            this._width = width;
            this._height = height;
            this.RefreshAllParts();
        }
    }

    /**
     *
     * @param left {number}
     * @param top {number}
     * @param right {number}
     * @param bottom {number}
     */
    SetPaddings(left, top, right, bottom) {
        this._contentPaddings = new Paddings(left, top, right, bottom);
        this.RefreshContent();
    }

    Close() {
        this.Deactivate();
        this.visible = false;
    }

    Open() {
        this.visible = true;
    }

    Create() {
        this.CreateBackSprite();
        this.CreateContentSprite();
        this.CreateTitleSprite();
    }

    /** @type Sprite */
    _titleSprite;
    /** @type Sprite */
    _backSprite;
    /** @type Sprite */
    _contentSprite;
    CreateTitleSprite() {
        this._titleSprite = new Sprite();
        this.addChild(this._titleSprite);
    }

    CreateBackSprite() {
        this._backSprite = new Sprite();
        this.addChild(this._backSprite);
        this._backSprite.move(0, this._titleHeight);
    }

    CreateContentSprite() {
        this._contentSprite = new Sprite(new Bitmap(this.contentWidth, this.contentHeight));
        this.addChild(this._contentSprite);
        this._contentSprite.move(this.paddings.left, this._titleHeight + this.paddings.top);
    }

    OnTitleTextureLoaded() {
        if (this._titleHeight > 0) {
            let b = new Bitmap(this.width, this._titleHeight + 12);
            b.DrawTexture(this.titleTexture, 0, 0, this.width, this._titleHeight + 4, this.TitleBorders.left, this.TitleBorders.right, this.TitleBorders.top, this.TitleBorders.bottom);
            b.drawText(this._title, 0, 0, this.width, this._titleHeight + 4, 'center');
            this._titleSprite.bitmap = b;
        }
    }

    OnBackTextureLoaded() {
        let b = new Bitmap(this.width, this.height - this._titleHeight);
        b.DrawTexture(this.backTexture, 0, 0, this.width, this.height - this._titleHeight, this.BackBorders.left, this.BackBorders.right, this.BackBorders.top, this.BackBorders.bottom);
        this._backSprite.bitmap = b;
    }

    RefreshAllParts() {
        this.RefreshTexturePosition();
        this.RefreshContent();
    }

    RefreshTexturePosition() {
        this.OnTitleTextureLoaded();
        this.OnBackTextureLoaded();
    }

    RefreshContent() {
        this._contentSprite.bitmap = new Bitmap(this.contentWidth, this.contentHeight);
        this._contentSprite.move(this.paddings.left, this._titleHeight + this.paddings.top);
    }
    //#endregion

    //#region Draw Text
    get lineHeight() { return 24; }
    get lineSpace() { return 4; }
    ResetFontSettings() {
        this.content.fontFace = $gameSystem.mainFontFace();
        this.content.fontSize = $gameSystem.mainFontSize();
        this.content.textColor = '#ffffff';
    }

    /**
     * @param {string} color - color string as #ffffff
     */
    ChangeTextColor(color) {
        this.content.textColor = color;
    }

    /**
     * draw normal text, without color change nor linebreak
     * @param {string} text
     * @param {number} x
     * @param {number} y
     * @param {number} maxWidth
     * @param {string} align - left(default), center, right
     */
    DrawText(text, x, y, maxWidth, align= 'left') {
        this.content.drawText(text, x, y + 2, maxWidth, this.lineHeight, align);
    }

    /**
     * draw Ex text, with width, color, special codes and auto linebreak
     * @param {string} text
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @returns {{beginX: *, x: *, width: (*), index: number, y: *, text: string, height: number}}
     */
    DrawTextEx(text, x, y, width) {
        this.ResetFontSettings();
        let textState = {
            index: 0,
            text: this.ConvertEscapeCharacters(text),
            x: x,
            y: y + 2,
            beginX: x,
            width: width > 0? Math.min(width, this.contentWidth - x) : undefined,
            height: this.lineHeight
        };
        while (textState.index < textState.text.length) {
            this.ProcessCharacter(textState);
        }
        return textState;
    }

    /**
     * @param {string} text
     * @returns {string}
     */
    ConvertEscapeCharacters(text) {
        text = text.replace(/\\n/g, '\n');
        text = text.replace(/\\/g, '\x1b');
        text = text.replace(/\x1b\x1b/g, '\\');
        return text;
    }
    ProcessCharacter(textState) {
        switch (textState.text[textState.index]) {
            case '\n':
                textState.index++;
                this.ProcessNewLine(textState);
                break;
            case '\x1b':
                textState.index ++;
                this.ProcessEscapeCharacter(this.ObtainEscapeCode(textState), textState);
                break;
            default:
                this.ProcessNormalCharacter(textState);
                break;
        }
    }
    ProcessNewLine(textState) {
        textState.x = textState.beginX;
        textState.y += textState.height + this.lineSpace;
    }
    ObtainEscapeCode(textState) {
        const regExp = /^[#]|^[A-Z]+/i;
        const arr = regExp.exec(textState.text.slice(textState.index));
        if (arr) {
            textState.index += arr[0].length;
            return arr[0].toUpperCase();
        } else {
            return "";
        }
    }
    ProcessEscapeCharacter(code, textState) {
        switch (code) {
            case '#':
                this.ChangeTextColor(this.ObtainRGBCode(textState));
                break;
            case 'I':
                this.processDrawIcon(this.obtainEscapeParam(textState), textState);
                break;
        }
    }
    ObtainRGBCode(textState) {
        let arr = /^[0123456789abcdef]{6}/.exec(textState.text.slice(textState.index));
        if (arr) {
            textState.index += arr[0].length;
            return '#' + arr[0].slice(0);
        } else {
            return '';
        }
    }
    ProcessNormalCharacter(textState) {
        let c = textState.text[textState.index];
        let w = this.content.measureTextWidth(c);
        if (((!textState.width) && this.contentWidth - textState.x >= w) || (textState.width && textState.width + textState.beginX - textState.x >= w)) {
            this.content.drawText(c, textState.x, textState.y, w * 2, textState.height, 'left');
            textState.index++;
            textState.x += w;
        } else {
            this.ProcessNewLine(textState);
            //textState.index--;
            this.ProcessNormalCharacter(textState);
        }
    }
    //#endregion

    //#region Draw Image
    /**
     * @param folder {string}
     * @param filename {string}
     * @param pw {number} - 0 for original
     * @param ph {number} - 0 for original
     * @param dx {number}
     * @param dy {number}
     * @param dw {number}
     * @param dh {number}
     * @param pd {Paddings}
     */
     DrawImage(folder, filename, pw, ph, dx, dy, dw = pw, dh = ph, pd = new Paddings()) {
        let bitmap = ImageManager.loadBitmap(folder, filename);
        pw = pw || bitmap.width;
        ph = ph || bitmap.height;
        this.content.blt(bitmap, 0, 0, pw, ph, dx + pd.left, dy + pd.top, dw - pd.left - pd.right , dh - pd.top - pd.bottom);
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
    DrawImageInRect(folder, filename, pw, ph, rect, pd= new Paddings()) {
        this.DrawImage(folder, filename, pw, ph, rect.x, rect.y, rect.width, rect.height, pd);
    }

    /**
     * @param folder {string}
     * @param filename {string}
     * @param dx {number}
     * @param dy {number}
     */
    DrawIcon(folder, filename, dx, dy) {
        let bitmap = ImageManager.loadBitmap(folder, filename);
        let pw = bitmap.width;
        let ph = bitmap.height;
        let dw = this.lineHeight;
        let dh = this.lineHeight;
        let sx = 0;
        let sy = 0;
        this.content.blt(bitmap, sx, sy, pw, ph, dx, dy, dw , dh);
    }

    /**
     * @param folder {string}
     * @param filename {string}
     * @param x {number}
     * @param y {number}
     * @param w {number}
     * @param h {number}
     * @param pd {Paddings}
     */
    DrawTexture(folder, filename, x, y, w, h, pd= new Paddings()) {
        this.content.DrawTexture(ImageManager.loadBitmap(folder, filename), x, y, w, h, pd.left, pd.right, pd.top, pd.bottom);
    }

    DrawProgressBar(name, edge, x, y, length, value, max) {
        this.content.DrawProgressBar(name, edge, x, y, length, value, max);
    }
    //#endregion
}

class ScrollWindow extends CustomWindow {
    /**
     *
     * @param x {number}
     * @param y {number}
     * @param w {number}
     * @param h {number}
     * @param scroll_length {number}
     * @param title {string}
     * @param title_height {number}
     * @param title_bg {string}
     * @param bg {string}
     */
    constructor(x, y, w, h, scroll_length, title, title_height, title_bg = 'wd_title_cmn', bg = 'wd_back_cmn') {
        super(x, y, w, h, title, title_height, title_bg, bg);
        this._scrollMin = -scroll_length;
        this.RefreshContent();
        this.CreateScrollBar();
        this.CreateScroller();
    }

    static get inertiaAttenuation() { return 0.94; }

    _scroll = 0;
    _scrolling = 0;
    _scrollMax = 0;
    _scrollMin = 0;
    _inertia = 0;
    _lastY = 0;

    /**
     * Will clear all drawn contents
     * @param {number} l
     */
    SetContentLength(l) {
        if ( l > this.contentHeight) {
            this._scrollMin = this.contentHeight - l;
            this.RefreshContent();
            this.ResetScroller();
        } else {
            this.content.clear();
        }
    }

    RefreshContent() {
        this._contentSprite.bitmap = new Bitmap(this.contentWidth, this.contentHeight - this._scrollMin);
        this._contentSprite.move(this.paddings.left, this._titleHeight + this.paddings.top);
        this.UpdateContentScroll();
    }

    update() {
        super.update();
        this.UpdateInertia();
        this.UpdateScroll();
        this.UpdateBorderBouncing();
        this.UpdateContentScroll();
        this.UpdateScrollBar();
    }

    //#region Scroll
    /*** @returns {number} */
    get scroll() { return this._scroll + this._scrolling; }
    /*** @returns {number} */
    get scrollPadding() { return 12; }

    UpdateInertia() {
        if (!this.IsPressed() && (this._inertia > 1 || this._inertia < -1)) {
            this._scroll += this._inertia;
            this._inertia = this._inertia * ScrollWindow.inertiaAttenuation;
        }
    }

    UpdateScroll() {
        if (this.IsPressed()) {
            const y = TouchInput.y;
            this._scrolling = y - this._pressPoint.y;
            this._inertia = y - this._lastY;
            this._lastY = y;
        }
    }

    OnRelease() {
        super.OnRelease();
        this._scroll += this._scrolling;
        this._scrolling = 0;
    }



    UpdateBorderBouncing() {
        if (this._scroll > this._scrollMax) {
            this._scroll -= (this._scroll - this._scrollMax) / 3;
            if (this._scroll - this._scrollMax < 1) this._scroll = this._scrollMax;
        }

        if (this._scroll < this._scrollMin) {
            this._scroll -= (this._scroll - this._scrollMin) / 3;
            if (this._scrollMin - this._scroll < 1) this._scroll = this._scrollMin;
        }
    }

    UpdateContentScroll() {
        this._contentSprite.setFrame(0, -this.scroll, this.width, this.contentHeight);
    }
    //#endregion

    //#region ScrollBar
    _scrollBar;
    _scroller;
    _scrollerHeight = 0;
    get scrollBarOffset() {
        return this._titleHeight + 10;
    }
    get scrollBarWidth() {
        return 4;
    }
    /** @returns {number} */
    get scrollerHeight() {
        if (this._scrollerHeight === 0) {
            let l = this._scrollBar.height *  this.contentHeight / (this.contentHeight - this._scrollMin);
            this._scrollerHeight = Math.max(l, 30);
        }
        return this._scrollerHeight;
    }
    get scrollBarColor() {
        return '#665b6c';
    }
    get scrollerColor() {
        return '#000000'
    }

    CreateScrollBar() {
        let bg = new Sprite(new Bitmap(this.scrollBarWidth, this.height - this.scrollBarOffset - 10));
        bg.bitmap.fillRect(0, 0, this.scrollBarWidth, this.height - this.scrollBarOffset - 10, this.scrollBarColor);
        this._scrollBar = bg;
        this.addChild(bg);
        bg.move(this.width - this.scrollBarWidth - 8, this.scrollBarOffset);
    }

    CreateScroller() {
        let l = this.scrollerHeight;
        let item = new Sprite(new Bitmap(this.scrollBarWidth, l));
        item.bitmap.DrawTexture(ImageManager.LoadUIBitmap(undefined, 'scroller_cmn'), 0, 0, this.scrollBarWidth, l, 0, 0, 2, 2);
        this._scroller = item;
        this.addChild(item);
        item.move(this.width - this.scrollBarWidth - 4, this.scrollBarOffset);
    }

    ResetScroller() {
        this._scrollerHeight = 0;
        let l = this.scrollerHeight;
        this._scroller.bitmap = new Bitmap(this.scrollBarWidth, l);
        this._scroller.bitmap.DrawTexture(ImageManager.LoadUIBitmap(undefined, 'scroller_cmn'), 0, 0, this.scrollBarWidth, l, 0, 0, 2, 2);
        this._scroller.move(this.width - this.scrollBarWidth - 8, this.scrollBarOffset);
    }

    UpdateScrollBar() {
        if (!this._scrollBar) return;
        this._scrollBar.move(this.width - this.scrollBarWidth - 8, this.scrollBarOffset);
        if (this._scroller) {
            let y = this.scrollBarOffset + (this._scrollBar.height - this.scrollerHeight) * (this.scroll / (this._scrollMin === 0?1:this._scrollMin));
            this._scroller.move(this.width - this.scrollBarWidth - 8, y);
            if ( y + this.scrollerHeight > this.height - 10) {
                this._scroller.setFrame(0, 0, this.scrollBarWidth, this.height - this.scrollBarOffset - y);
            } else if ( y  < this.scrollBarOffset) {
                this._scroller.move(this.width - this.scrollBarWidth - 8, this.scrollBarOffset);
                this._scroller.setFrame(0, this.scrollBarOffset, this.scrollBarWidth, this.scrollerHeight - (this.scrollBarOffset - y));
            } else {
                this._scroller.setFrame(0, 0, this.scrollBarWidth, this.scrollerHeight);
            }
        }
    }
    //#endregion
}

class ScrollListWindow extends ScrollWindow {
    constructor(x, y, w, h, title, title_height, title_bg = 'wd_title_cmn', bg = 'wd_back_cmn') {
        super(x, y, w, h, 0, title, title_height, title_bg, bg);
    }

    /**
     * selected index
     * @type {number}
     */
    _index = -1;
    _lastIndex = -1;
    /*** @type {Array} */
    _data = [];
    /** @returns {number} */
    get index() { return this._index; }
    /** @returns {number} */
    get listLength() { return this._data.length; }

    get item() { return this._data[this.index]; }

    CanSelectNull() {
        return true;
    }

    /**
     * select item by index
     * @param index {number}
     */
    Select(index) {
        if (index < 0 && !this.CanSelectNull()) {
            index = 0;
        }
        this._lastIndex  = this.index;
        this._index = index;
        this.RedrawItem(this._index);
        this.RedrawItem(this._lastIndex);
        this.OnSelect();
    }

    Deselect() {
        this.Select(-1);
    }

    MakeList() {
        this._scrollMin = Math.min(this.contentHeight - this.GetListHeight(), 0);
        this.RefreshContent();
        this.ResetScroller();
        this.DrawAllItems();
    }

    /**
     * @param {Array} list
     */
    SetList(list) {
        this._data = list;
        this._scrollMin = Math.min(this.contentHeight - this.GetListHeight(), 0);
        this.RefreshContent();
        this.ResetScroller();
        this.DrawAllItems();
    }

    //#region Items Layout
    /**
     * horizontal spacing
     * @returns {number}
     */
    get spacingX() { return 4; }

    /**
     * vertical spacing
     * @returns {number}
     */
    get spacingY() { return this.spacingX; }
    get itemWidth() { return this.contentWidth / this.maxCols - this.spacingX; }
    get itemHeight() { return 100; }
    get maxCols() { return 1; }
    get maxRows() { return Math.max(Math.ceil(this.listLength / this.maxCols), 1) }

    /**
     * Calculate the full height of this list
     * @returns {number}
     */
    GetListHeight() {
        return this.maxRows * (this.itemHeight + this.spacingY);
    }

    /**
     * Create a rectangle indicating the indexed item
     * @param {number} index
     * @return {Rectangle}
     */
    GetItemRect(index) {
        let rect = new Rectangle();
        let maxCols = this.maxCols;
        rect.width = this.itemWidth;
        rect.height = this.itemHeight;
        rect.x = index % maxCols * (rect.width + this.spacingX);
        rect.y = Math.floor(index / maxCols) * (rect.height + this.spacingY);
        return rect;
    }
    //#endregion

    //#region Items Draw
    /**
     * @param index {number}
     */
    DrawItem(index) {

    }

    /**
     * @param {number} index
     */
    RedrawItem(index) {
        if (index >= 0) {
            this.ClearItem(index);
            this.DrawItem(index);
        }
    }

    RedrawCurrentItem() {
        this.RedrawItem(this.index);
    }

    /**
     * @param index {number}
     */
    ClearItem(index) {
        let rect = this.GetItemRect(index);
        this.content.clearRect(rect.x, rect.y, rect.width, rect.height);
    }

    DrawAllItems() {
        for (let i = 0; i < this.listLength; i++) {
            this.DrawItem(i);
        }
    }
    //#endregion

    //#region Items Select
    /**
     * calculate index by global x and y coordinates
     * @param x {number}
     * @param y {number}
     * @returns {number}
     */
    GetPointIndex(x, y) {
        const pt = this._contentSprite.worldTransform.applyInverse(new Point(x, y));
        x = pt.x;
        y = pt.y - (this.scroll > 0? 0: this.scroll);
        let col = Math.floor(x / (this.itemWidth + this.spacingX));
        let row = Math.floor(y / (this.itemHeight + this.spacingY));
        let index = col + row * this.maxCols;
        return (index >= 0 && index < this.listLength)? index : -1;
    }

    UpdateInertia() {
        super.UpdateInertia();
        this.UpdateSelecting();
    }

    UpdateSelecting() {
        if (this.IsPressed()) {
            let index = this.GetPointIndex(TouchInput.x, TouchInput.y);
            this.Select(index);
        }
    }

    OnClick() {
        if (this.index > -1) {
            if (this.IsItemEnabled()) {
                SoundManager.playOk();
                super.OnClick();
            } else {
                SoundManager.playBuzzer();
            }
        }
    }

    IsItemEnabled() {
        return true;
    }


    /** @type Function */
    _selectHandler = null;

    /**
     * @param {Function} method
     */
    SetSelectHandler(method) {
        this._selectHandler = method;
    }
    OnSelect() {
        if(this._selectHandler) {
            this._selectHandler();
        }
    }
    /** @type Function */
    _clickHandler = null;
    /**
     * @param {Function} method
     */
    SetClickHandler(method) {
        this._clickHandler = method;
    }

    OnConfirm() {
        if (this.IsItemEnabled()) {
            SoundManager.playOk();
            if(this._clickHandler) {
                this._clickHandler();
            }
        } else {
            SoundManager.playBuzzer();
        }
    }
    //#endregion
}

class CharacterListWindow extends ScrollListWindow {
    /** @type PlayerChar[] */
    _data;
    get maxCols() {return 8;}
    get itemHeight() {return this.itemWidth;}
    MakeList() {
        this._data = $gameParty.members;
        super.MakeList();
    }

    DrawItem(index) {
        let r = this.GetItemRect(index);
        this.DrawTexture('img/ui/', 'face_bg', r.x, r.y, r.width, r.height, new Paddings(4));
        this.DrawImageInRect('img/faces/', this._data[index].model,0, 0, r, new Paddings(4));
        if (this.index === index) {
            this.DrawTexture('img/ui/', 'cell_select_cmn', r.x, r.y, r.width, r.height);
        }
    }
}


class ItemListWindow extends ScrollListWindow {
    /** @type Item[] */
    _data;
    get maxCols() { return 1;}
    get itemHeight() { return 64; }
    /** @returns {Item} */
    get item() { return super.item;}

    _type = -1;
    _slots = [];
    _weapons = [];
    _inames = [];

    /**
     * @param {number} type
     * @param {number[]} slots
     * @param {number[]} weapons
     * @param {string[]} inames
     */
    SetFilter(type, slots=[], weapons = [],inames=[]) {
        this._type = type;
        this._slots = slots;
        this._weapons = weapons;
        this._inames = inames;
    }

    /**
     * @param {Item} it
     * @returns {boolean}
     */
    Includes(it) {
        return (this._type === -1 || it.type === this._type) &&
            (this._slots.length < 1 || this._slots.includes(it.slot)) &&
            (this._weapons.length < 1 || this._weapons.includes(it.wept)) &&
            (this._inames.length < 1 || this._inames.includes(it.iname));
    }

    MakeList() {
        this._data = $gameParty.items.filter(it => this.Includes(it));
        super.MakeList();
    }

    DrawItem(index) {
        if (!this._data[index]) return;
        let r = this.GetItemRect(index);
        let i_r = new Rectangle(r.x, r.y, r.height, r.height);
        this.DrawTexture('img/ui/', 'cell_cmn', r.x, r.y, r.width, r.height, new Paddings(10));
        let item = this._data[index];
        this.DrawImageInRect('img/icons/item/', item.icon,0, 0, i_r);
        this.DrawTextEx(item.name, r.x + i_r.width, r.y + r.height/3.5, r.width - r.height);
        if (item instanceof Equip) {
            if (item.IsEquipped()) {
                this.DrawImage('img/ui/', 'equipping', 0, 0, r.x + r.width - 90, r.y + r.height * 0.25, 80, 30);
            }
        } else {
            this.DrawItemAmount(item, r);
        }

        if (this.index === index) {
            this.DrawTexture('img/ui/', 'cell_select_cmn', r.x, r.y, r.width, r.height, new Paddings(9));
        }
    }

    /**
     * @param {Item} item
     * @param {Rectangle} r
     * @constructor
     */
    DrawItemAmount(item, r) {
        this.DrawText(`x${item.amount}`, r.x, r.y + r.height/3.5, r.width - 16, 'right');
    }
}

class MaterialCostWindow extends ItemListWindow {
    get TitleBorders() {
        return [20, 20, 20, 4];
    }

    DrawItem(index) {
        let r = this.GetItemRect(index);
        let i_r = new Rectangle(r.x, r.y, r.height, r.height);
        this.DrawTexture('img/ui/', 'cell_cmn', r.x, r.y, r.width, r.height, new Paddings(10));
        let item = this._data[index];
        this.DrawImageInRect('img/icons/item/', $dataItems[item.iname].icon,0, 0, i_r);
        this.DrawTextEx($dataItems[item.iname].name, r.x + i_r.width, r.y + r.height/3.5, r.width - r.height);
        this.DrawItemAmount(item, r);
    }

    DrawItemAmount(item, r) {
        if ($gameParty.ItemAmount(item.iname) < item.amount) {
            this.ChangeTextColor(Colors.Red);
        } else {
            this.ChangeTextColor(Colors.Green);
        }
        this.DrawText(`${$gameParty.ItemAmount(item.iname)}/${item.amount}`, r.x, r.y + r.height / 3.5, r.width - 16, 'right');
        this.ChangeTextColor(Colors.White);
    }
}

class CraftListWindow extends ScrollListWindow {
    /** @type Craft[] */
    _data;
    /** @type PlayerChar*/
    _chr;
    get maxCols() { return 1;}
    get itemHeight() { return 64; }
    /** @returns {Skill} */
    get item() { return super.item;}

    /**
     * @param {PlayerChar} chr
     */
    MakeList(chr) {
        this._chr = chr;
        this._data = chr.crafts;
        super.MakeList();
    }

    DrawItem(index) {
        let r = this.GetItemRect(index);
        let i_r = new Rectangle(r.x, r.y, r.height, r.height);
        this.DrawTexture('img/ui/', 'cell_cmn', r.x, r.y, r.width, r.height, new Paddings(10));
        this.DrawImageInRect('img/icons/skill/', this._data[index]?this._data[index].icon:$dataSkills[this._chr.data.crafts[index]].icon,0, 0, i_r, new Paddings(10));
        this.DrawTextEx(this._data[index]?this._data[index].name:($dataSkills[this._chr.data.crafts[index]].name+'(尚未习得)'), r.x + i_r.width, r.y + r.height/3.5, r.width - r.height);
        this.DrawText(`等级 ${this._data[index]?this._data[index].level:0}/${$dataSkills[this._chr.data.crafts[index]].manacost.length}`, r.x, r.y + r.height/3.5, r.width - 8, 'right');
        if (this.index === index) {
            this.DrawTexture('img/ui/', 'cell_select_cmn', r.x, r.y, r.width, r.height, new Paddings(9));
        }
    }
}

class SkillListWindow extends ScrollListWindow {
    /** @type Skill[] */
    _data;
    get maxCols() { return 1;}
    get itemHeight() { return 64; }
    /** @returns {Skill} */
    get item() { return super.item;}

    /**
     * @param {PlayerChar} chr
     */
    MakeList(chr) {
        this._data = chr.learnedSkills;
        super.MakeList();
    }

    DrawItem(index) {
        let r = this.GetItemRect(index);
        let i_r = new Rectangle(r.x, r.y, r.height, r.height);
        this.DrawTexture('img/ui/', 'cell_cmn', r.x, r.y, r.width, r.height, new Paddings(10));
        this.DrawImageInRect('img/icons/skill/', this._data[index].icon,0, 0, i_r, new Paddings(10));
        this.DrawTextEx(this._data[index].name, r.x + i_r.width, r.y + r.height/3.5, r.width - r.height);
        this.DrawImage('img/ui/', `checkbox_${this._data[index].IsEquipped() ? 'on' : 'off'}`, 0, 0, r.width - 56, r.y + 6, 50, 50);
        this.DrawText(`记忆 ${this._data[index].memory}`, r.x, r.y + r.height/3.5, r.width - 58, 'right');
        if (this.index === index) {
            this.DrawTexture('img/ui/', 'cell_select_cmn', r.x, r.y, r.width, r.height, new Paddings(9));
        }
    }
}

class LearningSkillListWindow extends ScrollListWindow {
    /** @type LearningSkill[] */
    _data;
    get maxCols() { return 1;}
    get itemHeight() { return 64; }
    /** @returns {Skill} */
    get item() { return super.item;}

    /**
     * @param {PlayerChar} chr
     */
    MakeList(chr) {
        this._data = chr.learningSkills;
        super.MakeList();
    }

    DrawItem(index) {
        let r = this.GetItemRect(index);
        let i_r = new Rectangle(r.x, r.y, r.height, r.height);
        let ls = this._data[index];
        this.DrawTexture('img/ui/', 'cell_cmn', r.x, r.y, r.width, r.height, new Paddings(10));
        this.DrawImageInRect('img/icons/skill/', $dataSkills[ls.iname].icon,0, 0, i_r, new Paddings(10));
        this.DrawTextEx($dataSkills[ls.iname].name, r.x + i_r.width, r.y + r.height/3.5, r.width - r.height);
        this.DrawProgressBar('CP', 1, r.x + r.height + 200, r.y + r.height/3, r.width - r.x - r.height - 220, ls.ap, $dataSkills[ls.iname].ap);
        if (this.index === index) {
            this.DrawTexture('img/ui/', 'cell_select_cmn', r.x, r.y, r.width, r.height, new Paddings(9));
        }
    }
}

class BattleSkillListWindow extends ScrollListWindow {
    /** @type Skill[] */
    _data;
    get maxCols() { return 2;}
    get itemHeight() { return 56; }
    /** @returns {Skill} */
    get item() { return super.item;}
    /**
     * @param {Character} chr
     */
    MakeList(chr) {
        this._data = chr.activeSkills;
        super.MakeList();
    }

    IsItemEnabled() {
        return this.item.CanUse();
    }

    DrawItem(index) {
        if (!this._data[index]) return;
        let name = `${this._data[index].name} (\\#307ff5${this._data[index].manacost}\\#ffffff・\\#f49f51${this._data[index].cpcost}\\#ffffff・\\#888878${this._data[index].ctcost}\\#ffffff)`
        let r = this.GetItemRect(index);
        let i_r = new Rectangle(r.x, r.y, r.height, r.height);
        this.DrawTexture('img/ui/', this._data[index].CanUse()?'cell_cmn':'cell_gray', r.x, r.y, r.width, r.height, new Paddings(10));
        this.DrawImageInRect('img/icons/skill/', this._data[index].icon,0, 0, i_r, new Paddings(10));
        this.DrawTextEx(name, r.x + i_r.width, r.y + r.height/3.5, r.width - r.height);
        if (this.index === index) {
            this.DrawTexture('img/ui/', 'cell_select_cmn', r.x, r.y, r.width, r.height, new Paddings(9));
        }
    }
}

class BattleSkillDetailWindow extends CustomWindow {
    constructor(x, y, w, h, title, th = 0, titlebg = 'wd_title_cmn', bg = 'face_bg') {
        super(x, y, w, h, title, th, titlebg, bg);
    }

    /**
     * @param {string} s
     * @returns {number}
     */
    TestDraw(s) {
        const state = this.DrawTextEx(s, 0, 0, this.contentWidth);
        return state.y + 32;
    }

    /** @param {Skill} skill */
    SetSkill(skill) {
        this.content.clear();
        let s = '';
        s += `${skill.name} 【等级 ${skill.level}/${skill.maxLevel}】\n`;
        s += `消耗: \\${Colors.Indigo}${skill.manacost}  \\${Colors.Orange}${skill.cpcost}  \\${Colors.Gray}${skill.ctcost}\\${Colors.White}\n`;
        s += skill.GetDescription();
        let h = this.TestDraw(s) * 1.2;
        this.Move(this.x, -h, this.width, h);
        this.DrawTextEx(s, 0, 0, this.contentWidth);
    }
}

class EquipWindow extends ScrollListWindow {
    /** @type Equip[] */
    _data;
    get maxCols() { return 1;}
    get itemHeight() { return 64; }
    /** @returns {Equip} */
    get item() { return super.item;}

    /**
     * @param {PlayerChar} chr
     */
    MakeList(chr) {
        this._data = chr.equips;
        super.MakeList();
    }

    DrawItem(index) {
        let r = this.GetItemRect(index);
        let i_r = new Rectangle(r.x, r.y, r.height, r.height);
        this.DrawTexture('img/ui/', 'cell_cmn', r.x, r.y, r.width, r.height, new Paddings(10));
        let item = this._data[index];
        if (item) {
            this.DrawImageInRect('img/icons/item/', item.icon,0, 0, i_r);
            this.DrawTextEx(item.name, r.x + i_r.width, r.y + r.height/3.5, r.width - r.height);
        } else {
            this.DrawTextEx(`未装备${Names.EquipSlots[index]}`, r.x + i_r.width, r.y + r.height/3.5, r.width - r.height);
        }

        if (this.index === index) {
            this.DrawTexture('img/ui/', 'cell_select_cmn', r.x, r.y, r.width, r.height, new Paddings(9));
        }
    }
}

class ArkSelectWindow extends ScrollListWindow {
    /** @type Ark[] */
    _data;
    get maxCols() { return 1;}
    get itemHeight() { return 240; }
    /** @returns {Ark} */
    get item() { return super.item;}
    /** @type PlayerChar */
    _chr;

    /**
     * @param {PlayerChar} chr
     */
    MakeList(chr) {
        this._chr = chr;
        this._data = [undefined, ...$gameParty.arks];
        super.MakeList();
    }

    DrawItem(index) {
        let r = this.GetItemRect(index);
        let i_r = new Rectangle(r.x, r.y, 200, r.height);
        this.DrawTexture('img/ui/', 'cell_cmn', r.x, r.y, r.width, r.height, new Paddings(10));
        if (index > 0) {
            this.DrawImageInRect('img/icons/ark/', this._data[index].image,0, 0, i_r, new Paddings(10));
            this.DrawTexture('img/ui/', 'wd_back_teal', r.x + i_r.width - 4, r.y + 10, 300, r.height -20, new Paddings(4));
            this.DrawTextEx(`${this._data[index].name} 【等级 ${this._data[index].level}】`, r.x + i_r.width, r.y + 10, 300);
            this.DrawTextEx(this._data[index].shortDesc, r.x + i_r.width, r.y + 40, 300);
            let y = r.y + 10;
            let x = r.x + i_r.width + 304;
            this.DrawTexture('img/ui/', 'wd_back_orange', x - 4, y, r.width - x - 2, r.height -20, new Paddings(4));
            for (const ln of this._data[index].allLearnings) {
                this.DrawImage('img/icons/skill/', $dataSkills[ln.iname].icon, 0, 0, x, y, 32, 32);
                this.DrawText($dataSkills[ln.iname].name, x + 36, y + 3, r.width - x - 36);
                if (ln.level <= this._data[index].level) {
                    this.DrawText(`进度: ${this._chr.GetSkillLearningAp(ln.iname)}/${$dataSkills[ln.iname].ap}    AP倍率: ${ln.ap}`, x + 36, y + 3, r.width - x - 45, 'right');
                } else {
                    this.DrawText(`需要圣物等级${ln.level}`, x + 36, y + 3, r.width - x - 45, 'right');
                }
                y += 32;
            }
        } else {
            this.content.fontSize = 48;
            this.DrawText('卸下', r.x, r.y + this.itemHeight * 0.4, r.width, 'center');
            this.ResetFontSettings();
        }

        if (this.index === index) {
            this.DrawTexture('img/ui/', 'cell_select_cmn', r.x, r.y, r.width, r.height, new Paddings(9));
        }
    }
}

class ArkListWindow extends ScrollListWindow {
    /** @type Ark[] */
    _data;
    get maxCols() { return 1;}
    get itemHeight() { return 240; }
    /** @returns {Ark} */
    get item() { return super.item;}

    MakeList() {
        this._data = $gameParty.arks;
        super.MakeList();
    }

    DrawItem(index) {
        let r = this.GetItemRect(index);
        let i_r = new Rectangle(r.x, r.y, 200, r.height);
        this.DrawTexture('img/ui/', 'cell_cmn', r.x, r.y, r.width, r.height, new Paddings(10));
        this.DrawImageInRect('img/icons/ark/', this._data[index].image,0, 0, i_r, new Paddings(10));
        this.DrawTexture('img/ui/', 'wd_back_teal', r.x + i_r.width - 4, r.y + 10, 300, r.height -20, new Paddings(4));
        this.DrawTextEx(`${this._data[index].name} 【等级 ${this._data[index].level}】`, r.x + i_r.width, r.y + 10, 300);
        this.DrawTextEx(this._data[index].shortDesc, r.x + i_r.width, r.y + 40, 300);
        let y = r.y + 10;
        let x = r.x + i_r.width + 304;
        this.DrawTexture('img/ui/', 'wd_back_orange', x - 4, y, r.width - x - 2, r.height -20, new Paddings(4));
        for (const ln of this._data[index].allLearnings) {
            this.DrawImage('img/icons/skill/', $dataSkills[ln.iname].icon, 0, 0, x, y, 32, 32);
            this.DrawText($dataSkills[ln.iname].name, x + 36, y + 3, r.width - x - 36);
            if (ln.level <= this._data[index].level) {
                this.DrawText(`AP倍率: ${ln.ap}`, x + 36, y + 3, r.width - x - 45, 'right');
            } else {
                this.DrawText(`需要圣物等级${ln.level}`, x + 36, y + 3, r.width - x - 45, 'right');
            }
            y += 32;
        }
        if (this.index === index) {
            this.DrawTexture('img/ui/', 'cell_select_cmn', r.x, r.y, r.width, r.height, new Paddings(9));
        }
    }
}

class InfoWindow extends ScrollWindow {
    SetString(str) {
        let h = this.TestDraw(str);
        this.SetContentLength(h);
        this.Draw(str);
    }
    /**
     * @param {Skill} skill
     */
    SetSkill(skill) {
        let s = '';
        s += `${skill.name}\n\n`;
        s += `等级 ${skill.level}/${skill.maxLevel}  ${skill.IsPassive()?'被动':'主动'}\n`;
        s += `法力消耗: ${skill.manacost}\n`;
        s += `CP消耗:  ${skill.cpcost}\n`;
        s += `行动值消耗: ${skill.ctcost}\n\n`;
        s += skill.GetDescription();
        let h = this.TestDraw(s);
        this.SetContentLength(h);
        this.Draw(s);
    }

    /**
     * @param {Equip} eq
     */
    SetEquip(eq) {
        let s = '';
        s += `${eq.name}\n`;
        s += `${Names.EquipSlots[eq.slot]} `;
        s += eq.IsWeapon()? `${Names.WeaponTypes[eq.wept]}` : ``;
        s += '\n\n';
        s += `${eq.description}`;
        let h = this.TestDraw(s);
        this.SetContentLength(h);
        this.Draw(s);
    }

    /**
     * @param  {Character} chr
     */
    SetCharacter(chr) {
        let s = '';
        s += `${chr.name}\n`;
        s += `等级 ${chr.level}\n\n`;

        for (let p in ParamType) {
            s += `\\${Colors.Green}${Names.Params[p]}\\${Colors.White}`.padEnd(30, '　') + `${chr.GetParamByName(p)}\n`;
        }
        s += '\n';
        for (let p in SecParamType) {
            s += `\\${Colors.Cyan}${Names.Params[p]}\\${Colors.White}`.padEnd(30, '　') + `  ${chr.GetParamByName(p)}\n`;
        }
        let h = this.TestDraw(s);
        this.SetContentLength(h);
        this.Draw(s);
    }

    /**
     * @param {Character} chr
     */
    SetProfile(chr) {
        let s = '';
        s += `名称: ${chr.name}\n`;
        s += `种族: ${chr.race}\n`;
        s += `标签: ${chr.tags.join('、')}\n`;
        s += `性别: ${Names.Genders[chr.gender]}\n\n`;
        s += `    \\${Colors.Gray}${chr.profile}\\${Colors.White}`;
        let h = this.TestDraw(s);
        this.SetContentLength(h);
        this.Draw(s);
    }

    /** @param {Item} item */
    SetItem(item) {
        if (item instanceof  Equip) {
            this.SetEquip(item);
        } else {
            let s = '';
            s += `${item.name}\n`;
            s += `类型: ${Names.ItemTypes[item.type]}\n\n`;
            s += `${item.description}`;
            let h = this.TestDraw(s);
            this.SetContentLength(h);
            this.Draw(s);
        }
    }
    /** @param {Stage} stg */
    SetStage(stg) {
        this._stage = stg;
        let s =  stg.story;
        let h = this.TestDraw(s);
        this.SetContentLength(h);
        this.Draw(s);
    }

    Clear() {
        this.SetContentLength(this.contentHeight);
    }

    /**
     * @param {string} s
     * @returns {number}
     */
    TestDraw(s) {
        const state = this.DrawTextEx(s, 0, 0, this.contentWidth);
        return state.y + 32;
    }

    /**
     * @param {string} s
     */
    Draw(s) {
        this.DrawTextEx(s, 0, 0, this.contentWidth);
    }
}

class TitledInfoWindow extends InfoWindow {
    constructor(x, y, w, h, title, title_height, title_bg = 'wd_title_titled', bg = 'wd_back_titled') {
        super(x, y, w, h, 0, title, title_height, title_bg, bg);
    }

    get TitleBorders() {
        return new Paddings(4, 0, 4, 0);
    }

    get BackBorders() {
        return new Paddings(4, 0, 4, 4);
    }
}