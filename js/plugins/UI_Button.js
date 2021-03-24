class Button extends Clickable {
	/**
	 *
	 * @param text {string}
	 * @param image {string}
	 * @param x {number}
	 * @param y {number}
	 * @param w {number}
	 * @param h {number}
	 * @param pressed_image {string}
	 * @param  {Paddings} pd - image sprite texture paddings
	 * @param  {Paddings} pressed_pd - image hovered paddings
	 * @param  {Paddings} pressed_texture_pd - image hovered texture paddings
	 * @param  {string} image_folder
	 */
	constructor(text, image, x, y, w, h, pressed_image = image + '_hover' , pd= new Paddings(), pressed_pd = new Paddings(), pressed_texture_pd = new Paddings(), image_folder = undefined) {
		super(x, y, w, h);
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this._paddings = pd;
		this._hoverPaddings = pressed_pd;
		this._hoverTexturePaddings = pressed_texture_pd;
		this.CreateImage(image, image_folder);
		this.CreatePressedSprite(pressed_image);
		this.CreateText(text);
	}
	/** @type Paddings */
	_paddings;
	/** @type Paddings */
	_hoverPaddings;
	/** @type Paddings */
	_hoverTexturePaddings;

	get width() {return this._width;}
	get height() {return this._height;}
	set width(value) {this._width = value;}
	set height(value) {this._height = value;}

	get paddings() { return this._paddings; }
	get hoverPaddings() { return this._hoverPaddings; }
	get hoverTexturePaddings() { return this._hoverTexturePaddings; }


	_active = true;
	/**
	 * @returns {boolean}
	 */
	get active() {return this._active;}
	Activate() {this._active = true;}
	Deactivate() {this._active = false;}
	Hide() {
		this.visible = false;
		this.Deactivate();
	}

	ShowAndActivate() {
		this.visible = true;
		this.Activate();
	}


	/** @type Sprite */
	_imageSprite;
	CreateImage(image, image_folder) {
		/** @type Bitmap */
		let texture = ImageManager.LoadUIBitmap(image_folder, image);
		if (this.width <= 0) {
			this.width = texture.width;
		}
		if (this.height <= 0) {
			this.height = texture.height;
		}

		let bitmap = new Bitmap(this.width, this.height);
		bitmap.DrawTexture(texture, 0, 0, this.width, this.height, this.paddings.left, this.paddings.right, this.paddings.top, this.paddings.bottom);
		this._imageSprite = new Sprite(bitmap);
		this.addChild(this._imageSprite);
	}

	/** @type Sprite */
	_textSprite;
	CreateText(text) {
		this._textSprite = new Sprite(new Bitmap(this.width, this.height));
		this._textSprite.bitmap.drawText(text, 0, 0, this.width, this.height,'center');
		this.addChild(this._textSprite);
	}

	/** @type Sprite */
	_pressedSprite;
	CreatePressedSprite(image) {
		let bitmap = ImageManager.LoadUIBitmap(undefined, image);
		this._pressedSprite = new Sprite(new Bitmap(this.width + this.hoverPaddings.left + this.hoverPaddings.right, this.height + this.hoverPaddings.top + this.hoverPaddings.bottom));
		this._pressedSprite.bitmap.DrawTexture(bitmap, 0, 0, this._pressedSprite.width, this._pressedSprite.height, this.hoverTexturePaddings.left, this.hoverTexturePaddings.right, this.hoverTexturePaddings.top, this.hoverTexturePaddings.bottom);
		this.addChild(this._pressedSprite);
		this._pressedSprite.move(-this.hoverPaddings.left, -this.hoverPaddings.top);
		this._pressedSprite.visible = false;
	}

	/**
	 * @param {number} x - target x coordinate
	 * @param {number} y - target y coordinate
	 */
	Move(x, y) {
		this.x = x;
		this.y = y;
	}


	OnPress() {
		super.OnPress();
		this._pressedSprite.visible = true;
	}

	OnRelease() {
		super.OnRelease();
		this._pressedSprite.visible = false;
	}

	OnLongPressRelease(isClick) {
		super.OnLongPressRelease(isClick);
		if (!this._handlers[this.OnLongPress.name]) {
			this.OnRelease();
			if (isClick) this.OnClick();
		}
	}

	/**
	 * function called when click
	 * @type function
	 */
	_clickHandler;

	/**
	 *
	 * @param {function} method
	 * @constructor
	 */
	SetClickHandler(method) {
		this._clickHandler = method;
	}

	_clickSe = '$btn_click';
	SetClickSe(name) {
		this._clickSe = name;
	}
	OnClick() {
		super.OnClick();
		if (this._handlers[this.OnClick.name]) {
			AudioManager.playSe({name: this._clickSe, pitch: 100, volume: 200});
		}
	}
}