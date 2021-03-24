class NumberSprite extends PIXI.Container {
    constructor(x, y, number, path, align = 'left') {
        super();
        this.x = x;
        this.y = y;
        number = Math.floor(number);
        this._number = number;
        this._currentNumber = number;
        this._bitmap = ImageManager.LoadUIBitmap(undefined, path);
        this._align = align;
        this.CreateNumbers();
    }

    _number = 0;
    _currentNumber = 0;
    _bitmap;
    /**@type Sprite[] */
    _spritesGroup = [];
    _align = 'left';

    _digitWidth;
    get digitWidth() {
        if (!this._digitWidth) {
            this._digitWidth = this._bitmap.width / 10;
        }
        return this._digitWidth;
    }
    _digitHeight;
    get digitHeight() {
        if (!this._digitHeight) {
            this._digitHeight = this._bitmap.height;
        }
        return this._digitHeight;
    }

    AddNumberSprite(sp) {
        this._spritesGroup.unshift(sp);
        this.addChild(sp);
    }

    CreateNumbers() {
        let n = this._number;
        let sp;
        if (n === 0) {
            sp = new Sprite(this._bitmap);
            sp.setFrame(0, 0, this.digitWidth, this.digitHeight);
            this.AddNumberSprite(sp);
        } else {
            while(n > 0) {
                const d = n % 10;
                n = Math.floor(n/10);
                sp = new Sprite(this._bitmap);
                sp.setFrame(d*this.digitWidth, 0, this.digitWidth, this.digitHeight);
                this.AddNumberSprite(sp);
            }
        }
        this.AlignSprites();
    }

    AlignSprites() {
        let x = 0;
        if(this._align === 'left') {
            x = 0;
            for(const sp of this._spritesGroup) {
                sp.x = x;
                sp.y = 0;
                x += this.digitWidth;
            }
        } else if(this._align === 'right') {
            x = this._spritesGroup.length * this.digitWidth;
            for(const sp of this._spritesGroup) {
                sp.x = -x;
                sp.y = 0;
                x -= this.digitWidth;
            }
        }
        this._needRealign = false;
    }

    ChangeNumber(n = 0) {
        n = Math.floor(n);
        for(let i = this._spritesGroup.length - 1; i >= 0; i--) {
            const d = n%10;
            n = Math.floor(n/10);
            const sp = this._spritesGroup[i];
            sp.setFrame(d*this.digitWidth, 0, this.digitWidth, this.digitHeight);
            if (d > 0 && n <= 0 && i > 0) {
                for(let j = 0; j < i; j++) {
                    const del = this._spritesGroup.shift();
                    this.removeChild(del);
                }
                this._needRealign = true;
                break;
            }
        }
        while(n > 0) {
            const d = n % 10;
            n = Math.floor(n/10);
            const sp = new Sprite(this._bitmap);
            sp.setFrame(d*this.digitWidth, 0, this.digitWidth, this.digitHeight);
            this.AddNumberSprite(sp);
            this._needRealign = true;
        }
    }

    SetNumber(n = 0) {
        this._number = Math.floor(n);
        AudioManager.PlaySe('se_number_change');
    }

    _needChangeNumber = false;
    _needRealign = false;
    update() {
        if (this._currentNumber === this._number) {
            this._needChangeNumber = false;
        } else if (Math.abs(this._number - this._currentNumber) < 1) {
            this._currentNumber = this._number;
            this._needChangeNumber = true;
        } else {
            this._currentNumber += ((this._number - this._currentNumber)/5);
            this._needChangeNumber = true;
        }
        if (this._needChangeNumber) {
            this.ChangeNumber(this._currentNumber);

        }
        if (this._needRealign) this.AlignSprites();
    }

}