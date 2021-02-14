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
     *
     * @param left  {number}
     * @param top {number}
     * @param right {number}
     * @param bottom {number}
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
/**
 * 
 * @param {string} folder 
 * @param {string} filename
 * @returns {Bitmap} 
 */
ImageManager.LoadUIBitmap = function(folder = 'img/ui/', filename) {
    return ImageManager.loadBitmap(folder, filename);
};


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