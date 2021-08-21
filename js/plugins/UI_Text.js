//#region font
let _Scene_Boot_prototype_loadGameFonts = Scene_Boot.prototype.loadGameFonts;
Scene_Boot.prototype.loadGameFonts = function() {
    _Scene_Boot_prototype_loadGameFonts.call(this);
    FontManager.load("rmmz-mainfont", 'A-OTF-MaruFoPro-Medium-2.otf');
    FontManager.load("kai", '汉仪劲楷简.ttf');
    FontManager.load("xin", 'A-OTF-MaruFoPro-Medium-2.otf');
};

const TextStyles = {
    SmallBlack : {
        breakWords: true,
        fontFamily: "rmmz-mainfont",
        fontSize: 18,
        miterLimit: 1,
        wordWrap: true,
        wordWrapWidth: 200
    },
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
    Title: {
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
        "fontSize": 120,
        "strokeThickness": 2
    },
    KaiBtn: {
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
    KaiBtnBlack: {
        fontFamily: "kai",
        fontSize: 36,
        strokeThickness: 1
    },
    KaiWhite: {
        fontFamily: "kai",
        fontSize: 36,
        fill: "white",
        strokeThickness: 1
    },
    KaiWhiteSmall: {
        fontFamily: "kai",
        fontSize: 24,
        fill: "white",
        strokeThickness: 2
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


class TextArea extends PIXI.Container {
     /**
     * @param {string} text
     * @param {Object} style 
     * @param {Paddings} text_p 
     * @param {number} y 
     * @param {number} x 
     * @param {number} w 
     * @param {number} h 
     * @param {Object} spr_conf
     * @param {number} spr_mode
     */
    constructor(text, style, text_p, x, y, w, h, spr_conf, spr_mode  = Spreading.Mode.Tile) {
        super();
        this.x = x;
        this.y = y;
        this._width = w;
        this._height = h;
        style.wordWrapWidth = this.width - text_p.left - text_p.right;
        this._text = new PIXI.Text(text, style);
        this._text.y = text_p.top;
        this._text.x = text_p.left;
        if (this._height < this._text.height + text_p.top + text_p.bottom) {
            this._height = this._text.height + text_p.top + text_p.bottom;
        }
        this._spr = this.addChild(new Spreading(0, 0, w, this._height, spr_conf, spr_mode));
        this.addChild(this._text);
    }

    get width() {return this._width;}
    get height() {return this._height;}
}