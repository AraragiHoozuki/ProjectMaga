class Gauge extends PIXI.Container {
    constructor(x, y, w, edge, bar, front, back) {
        super();
        this.x = x;
        this.y = y;
        this._width = w;
        this._edge = edge;
        const img_bar = ImageManager.loadBitmap('img/ui/', bar, 0, true);
        const back_filling = ImageManager.loadBitmap('img/ui/', back, 0, true);
        const front_filling = ImageManager.loadBitmap('img/ui/', front, 0, true);

        const bar_bitmap = new Bitmap(w, img_bar.height);
        bar_bitmap.DrawTexture(img_bar, 0, 0, w, img_bar.height, edge, edge, 0, 0);
        this._barSprite = new Sprite(bar_bitmap);
        this.addChild(this._barSprite);

        const back_bitmap = new Bitmap(w, img_bar.height);
        back_bitmap.DrawTexture(back_filling, 0, 0, w, img_bar.height, edge, edge, 0, 0);
        this._backSprite = new Sprite(back_bitmap);
        this.addChild(this._backSprite);

        const front_bitmap = new Bitmap(w, img_bar.height);
        front_bitmap.DrawTexture(front_filling, 0, 0, w, img_bar.height, edge, edge, 0, 0);
        this._frontSprite = new Sprite(front_bitmap);
        this.addChild(this._frontSprite);

        this._textSprite = new Sprite(new Bitmap(w, img_bar.height));
        this.addChild(this._textSprite);

        this._frontFilling = front_filling;
        this._backFilling = back_filling;
        this._current = this._max = 100;
        this._backL = this._frontL = w;
    }

    SetValue(curr, max = this._max) {
        this._current = curr;
        this._max = max;
        this.RefreshFront();
    }

    RefreshFront() {
        const l = this._width * this._current / this._max;
        const bm = this._frontSprite.bitmap;
        bm.clear();
        bm.DrawTexture(this._frontFilling, 0, 0, l, bm.height, this._edge, this._edge, 0, 0);
        this._frontL = l;

        this._textSprite.bitmap.clear();
        this._textSprite.bitmap.drawText(this._current + '/' + this._max, 0, 16, length, this.fontSize,'right');
    }

    UpdateBack() {
        const bm = this._backSprite.bitmap;
        if (this._backL > this._frontL) {
            this._backL -= 1;
        } else {
            this._backL = this._frontL;
        }
        bm.clear();
        bm.DrawTexture(this._backFilling, 0, 0, this._backL, bm.height, this._edge, this._edge, 0, 0);
    }

    update() {
        this.UpdateBack();
        this.visible = Math.abs(this._backL - this._frontL) >= 1;
    }

}

class HpGauge extends Gauge {
    /** @param {Character} chr*/
    SetCharacter(chr) {
        this._chr = chr;
    }
    get chr() {return this._chr;}
}