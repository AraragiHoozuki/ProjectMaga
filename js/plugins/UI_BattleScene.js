class BattleScene extends CustomScene {
	constructor() {
		super();
		BattleFlow.scene = this;
	}
	CreateCustomContents() {
		super.CreateCustomContents();
		this.CreateSpriteset();
		this.CreateFaceList();
		this.CreateSkillList();
	}

	/** @type Spriteset_Battle */
	_spriteset;
	CreateSpriteset() {
		this._spriteset = new Spriteset_Battle();
		this.addChild(this._spriteset);
		BattleFlow.SetSpriteset(this._spriteset);
	};

	/** @type BattleFaceList */
	_faceList;
	CreateFaceList() {
		let w = $gameParty.battleMembers.length * BattleFaceList.FaceWidth;
		this._faceList = new BattleFaceList((Graphics.width - w) / 2, Graphics.height - BattleFaceList.FaceHeight - 90);
		this.addChild(this._faceList);
		BattleFlow._faceList = this._faceList;
	}

	/** @type BattleSkillListWindow */
	_skillList;
	CreateSkillList() {
		this._skillList = new BattleSkillListWindow(BattleFaceList.FaceWidth, Graphics.height - 180, Graphics.width - BattleFaceList.FaceWidth, BattleFaceList.FaceHeight, '', 0);
		this.addChild(this._skillList);
		this._skillList.Close();

		this._skillDetail = new BattleSkillDetailWindow(0, 0, Graphics.width - BattleFaceList.FaceWidth, 0, '', 0);
		this._skillList.addChild(this._skillDetail);
		this._skillDetail.Close();

		this._skillList.SetHandler(this._skillList.OnClick, this.OnSkillConfirm.bind(this));
		this._skillList.SetHandler(this._skillList.OnLongPress, ()=> {
			if (this._skillList.item) {
				this._skillDetail.SetSkill(this._skillList.item);
				this._skillDetail.Open();
			}
		});
		this._skillList.SetHandler(this._skillList.OnLongPressRelease, () => this._skillDetail.Close());
	}

	/** @type BattleSelector */
	_charSelector;
	CreateCharSelector() {
		this._charSelector = new BattleSelector();
		this.addChild(this._charSelector);
	}

	start() {
		super.start();
		BattleFlow.StartBgm();
		BattleFlow.BattleStart();
		this.startFadeIn(this.fadeSpeed(), false);
	}

	update() {
		const active = this.isActive();
		$gameTimer.update(active);
		$gameScreen.update();
		this.UpdateVisibility();
		if (active && !this.isBusy()) {
			this.UpdateBattleProcess();
		}
		this._faceList.Refresh();
		super.update();
	}

	UpdateVisibility() {
	}

	UpdateBattleProcess() {
		BattleFlow.update();
		this.UpdateInput();
	}

	UpdateInput() {
		if (BattleFlow.IsInputting()) {
			if (BattleFlow.character && !this._skillList.active) {
				this.StartSkillSelection();
			}
		} else {
			this._skillList.Close();
		}
	}

	StartSkillSelection() {
		this._skillList.MakeList(BattleFlow.character);
		this._skillList.Open();
		this._skillList.Activate();
	}

	OnSkillConfirm() {
		BattleFlow.PushAction(this._skillList.item, this._skillList.item.IsForAlly()? this._charSelector.SelectedPlayer:this._charSelector.SelectedEnemy);
		this._skillList.Deactivate();
		BattleFlow.InputCharacterChange();
	}


}

class BattleCharFace extends PIXI.Container {
	/**
	 *
	 * @param {PlayerChar} chr
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 */
	constructor(chr, x, y, width, height) {
		super();
		this.x = x;
		this.y = y;
		this.width = width || 0;
		this.height = height || 0;
		this._chr = chr;
		this.active = true;
		this.CreateFaceImage();
		this.CreateBars();
		this._chr.SetBattleFace(this);
	}

	get width() {return this._width;}
	get height() {return this._height;}
	set width(value) {this._width = value;}
	set height(value) {this._height = value;}

	/**
	 * @returns {PlayerChar}
	 */
	get character() {return this._chr;}

	/** @type Sprite */
	_face;
	CreateFaceImage() {
		let rect = new Rectangle(0, 0, this.width, this.height);
		let face = new Sprite(new Bitmap(rect.width, rect.height));
		face.bitmap.DrawImageInRect('img/ui/', 'face_bg', 0, 0, rect);
		face.bitmap.DrawImageInRect('img/faces/', this.character.model, 0, 0, rect, new Paddings(4));
		this.addChild(face);
		this._face = face;
	}

	/** @type Sprite */
	_bar;
	CreateBars() {
		let [padding, width] = [4, this.width];
		let bitmap = new Bitmap(width, 96);
		let y = 2;
		bitmap.DrawProgressBar('HP', 3, padding, y, width - 2 * padding, this.character.hp, this.character.mhp);
		bitmap.DrawProgressBar('MP', 3, padding, y+=20, width - 2 * padding, this.character.mana, this.character.mma);
		bitmap.DrawProgressBar('CP', 3, padding, y+=20, width - 2 * padding, this.character.cp, 100);
		bitmap.DrawProgressBar('CT', 3, padding, y+=20, width - 2 * padding, this.character.ct, 1000);
		let sp = new Sprite(bitmap);
		this.addChild(sp);
		sp.move(0, this.height - 10);
		this._bar = sp;
	}

	RefreshBars() {
		if (this._bar) {
			let bitmap = this._bar.bitmap;
			bitmap.clear();
			let [padding, width, y] = [4, this.width, 2];
			bitmap.DrawProgressBar('HP', 3, padding, y, width - 2 * padding, this.character.hp, this.character.mhp);
			bitmap.DrawProgressBar('MP', 3, padding, y+=20, width - 2 * padding, this.character.mana, this.character.mma);
			bitmap.DrawProgressBar('CP', 3, padding, y+=20, width - 2 * padding, this.character.cp, 100);
			bitmap.DrawProgressBar(this.character.IsChanting()?'CHANT':'CT', 3, padding, y+=20, width - 2 * padding, this.character.ct, 1000);
		}
	}

	update() {
		if (BattleFlow.IsInputting() && this.character === BattleFlow.character) {
			this._face.move(-(this.parent.x + this.x), 0);
			this._bar.move(-(this.parent.x + this.x), this.height - 10);
		} else {
			this._face.move(0, 0);
			this._bar.move(0, this.height - 10);
		}
	}
}

class BattleFaceList extends PIXI.Container {
	constructor(x, y) {
		super();
		this.x = x;
		this.y = y;
		this._x0 = x;
		this._y0 = y;
		this.CreateFaces();
	}

	_x0 = 0;
	_y0 = 0;

	static FaceHeight = 180;
	static FaceWidth = 180;

	/** @type BattleCharFace[] */
	_faces;
	CreateFaces() {
		let x = 0;
		this._faces = [];
		$gameParty.battleMembers.forEach(chr => {
			let face = new BattleCharFace(chr, x, 0, BattleFaceList.FaceWidth, BattleFaceList.FaceHeight);
			this._faces.push(face);
			this.addChild(face);
			x += BattleFaceList.FaceWidth;
		})
	}

	update() {
		for (let child of this.children) {
			if (child.update) child.update();
		}
	}

	Refresh() {
		if (this._faces) {
			this._faces.forEach(face => face.RefreshBars());
		}
	}
}

class BattleSelectCursor extends Sprite {
	/**
	 *
	 * @param isEnemy {boolean}
	 */
	constructor(isEnemy) {
		let name = isEnemy? 'target_arrow_enemy' :'target_arrow_ally';
		super(ImageManager.loadBitmap('img/ui/', name, 0, true));
		this._x0 = 0;
		this._y0 = 0;
		this.visible = false;
		this._showTime = 80;
		this._isEnemy = isEnemy;
		this.move(this._x0, this._y0);
	}

	/** @returns {PlayerChar|EnemyChar} */
	get character() {
		if (this._attachPoint instanceof BattleCharFace) {
			return this._attachPoint._chr;
		} else {
			return this._attachPoint;
		}
	}

	AttachTo(obj) {
		this._attachPoint = obj;
		this.visible = true;
		this._showTime = 80;
		let x, y;
		let e = this._attachPoint;
		let w, h;
		[x, y, w, h] = [e.battleSprite.x, e.battleSprite.y, e.battleSprite.width, e.battleSprite.height];
		x = x - this.width/2;
		y = y - h/3 - this.height;
		this.SetPosition(x, y);
	}

	SetPosition(x, y) {
		this._x0 = x;
		this._y0 = y;
		this.move(x, y);
	}

	update() {
		super.update();
		if (this.visible) {
			this._showTime--;
			if (this._showTime < 0) {
				this.visible = false;
			}
		}
	}
}

class BattleSelector extends Clickable {
	constructor() {
		super(0, 0, Graphics.width, Graphics.height);
		this._enemies = $gameTroop.members;
		this._actors = $gameParty.battleMembers;
		this._enemyCursor = new BattleSelectCursor(true);
		this._actorCursor = new BattleSelectCursor(false);
		this.addChild(this._enemyCursor);
		this.addChild(this._actorCursor);
		this.CreateDetailWindow();
	}

	CreateDetailWindow() {
		this._detailWindow = new BattleDetailWindow(100, 36, Graphics.width - 200, Graphics.height - 72, 0);
		this.addChild(this._detailWindow);
		this._detailWindow.Close();
	}

	/** @returns {EnemyChar} */
	get SelectedEnemy() {
		if (this._enemyCursor.character) {
			return this._enemyCursor.character;
		} else {
			return $gameTroop.members.find(e => e.IsAlive());
		}
	}
	/** @returns {PlayerChar} */
	get SelectedPlayer() {
		if (this._actorCursor.character) {
			return this._actorCursor.character;
		} else {
			return $gameParty.members.find(c => c.IsAlive());
		}
	}

	update() {
		this._enemyCursor.update();
		this._actorCursor.update();
		super.update();
	}

	_lastClicked = 0; //0 for player, 1 for enemy, -1 for null
	OnPress() {
		let index = this.GetClickedPlayer();
		if (index > -1) {
			SoundManager.playCursor();
			this._lastClicked = 0;
		} else {
			index = this.GetClickedEnemy();
			if (index > -1) {
				SoundManager.playCursor();
				this._lastClicked = 1;
			} else {
				this._lastClicked = -1;
			}
		}
	}

	OnLongPress() {
		if (this._lastClicked > -1) {
			this._detailWindow.SetCharacter(this._lastClicked===0?this.SelectedPlayer : this.SelectedEnemy);
			this._detailWindow.Open();
			this._detailWindow.Activate();
		}
	}

	OnLongPressRelease(isClick) {
		this._detailWindow.Close();
	}

	GetClickedPlayer() {
		let x0 = TouchInput.x;
		let y0 = TouchInput.y;
		for (const a of this._actors) {
			let [x, y, w, h] = [a.battleSprite.x, a.battleSprite.y, a.battleSprite.width, a.battleSprite.height];
			w = w/2;
			h = h/1.5;
			x -= w/2;
			y -= h;
			if (x0 >= x && y0 >= y && x0 < x + w && y0 < y + h) {
				this._actorCursor.AttachTo(a);
				return 0;
			}
		}
		return -1;
	}

	GetClickedEnemy() {
		let x0 = TouchInput.x;
		let y0 = TouchInput.y;
		for (let i = 0; i < this._enemies.length; i++) {
			let e = this._enemies[this._enemies.length - i - 1];
			if (!e.isAlive()) continue;
			let [x, y, w, h] = [e.battleSprite.x, e.battleSprite.y, e.battleSprite.width, e.battleSprite.height];
			w = w/2;
			h = h/1.5;
			x -= w/2;
			y -= h;
			if (x0 >= x && y0 >= y && x0 < x + w && y0 < y + h) {
				this._enemyCursor.AttachTo(e);
				return 0;
			}
		}
		return -1;
	}
}

class BattleDetailWindow extends ScrollWindow {
	constructor(x, y, w, h, scroll_length) {
		super(x, y, w, h, scroll_length, '', 0, undefined, 'wd_back_dark');
	}
	/** @type Character*/
	_chr;

	/** @param {Character} chr */
	SetCharacter(chr) {
		this._chr = chr;
		this.RefreshDetail();
	}

	RefreshDetail() {
		this.RefreshContent();
		let s = '';
		s += `${this._chr.name} (等级 ${this._chr.level})\n`;
		s += `生命: ${this._chr.hp} / ${this._chr.mhp}\n`;
		s += `法力: ${this._chr.mana} / ${this._chr.mma}\n`;
		s += `CP: ${this._chr.cp} / ${Character.MAXCP}\n`;
		s += `CT: ${this._chr.ct} / ${this._chr.ActionCt()}\n`;
		s += '状态: \n';
		let mods = this._chr.allModifiers.filter(m => !m.IsHidden());
		for (let mod of mods) {
			s += `◆来自技能 \\#881dc5${mod.skill.name}\\#ffffff(${mod.durationText}${mod.CanStack()?`, ${mod.stack}/${mod.stackMax}层`:''}): ${mod.GetDescription()}\n`;
		}
		this.DrawTextEx(s, 0, 0, this.contentWidth);
	}
}


//#region Overwrite Spriteset_Battle
Spriteset_Battle.prototype.initialize = function() {
	Spriteset_Base.prototype.initialize.call(this);
	this._battlebackLocated = false;
	/** @type Sprite_Damage[] */
	this._damages = [];
};

Spriteset_Battle.prototype.createLowerLayer = function() {
	Spriteset_Base.prototype.createLowerLayer.call(this);
	this.createBackground();
	this.createBattleback();
	this.createBattleField();
	this.createSpines().then(()=>{});
};

Spriteset_Battle.prototype.createSpines = async function() {
	this._spineContainer = new PIXI.Container();
	this.addChild(this._spineContainer);
	let x = Graphics.width - 400;
	let y = 350;
	for (const chr of $gameParty.battleMembers) {
		let ctrl = new BtlSprCtrl();
		let spine;
		if (chr.weapon_slot) {
			spine = await ctrl.Load(chr.model, undefined, chr.weapon_model, chr.weapon_slot);
		} else {
			spine = await ctrl.Load(chr.model, undefined);
		}

		this._spineContainer.addChild(spine);
		spine.x = x;
		spine.y = y;
		x += 75;
		y += 75;
		chr.SetBattleSprite(spine);
		$scene().addChild(ctrl);
	}
	x = 400;
	y = 350;
	this._hpGauges = [];
	for (const chr of $gameTroop.battleMembers) {
		let ctrl = new BtlSprCtrl();
		let spine = await ctrl.Load(chr.model, 'spine/enemySpine/');
		this._spineContainer.addChild(spine);
		spine.x = x;
		spine.y = y;
		$scene().addChild(ctrl);
		const hg = new HpGauge(x - 60, y, 120, 4,  'ProgressBarHP_Empty', 'ProgressBarHP_Filling', 'gauge_back_filling_hp');
		hg.SetCharacter(chr);
		this._hpGauges.push(hg);
		this.addChild(hg);
		x -= 120;
		y += 75;
		chr.SetBattleSprite(spine);

	}
	BattleFlow.scene.CreateCharSelector();
};

/**
 * @param {Sprite_Damage} damage
 */
Spriteset_Battle.prototype.addDamage = function(damage) {
	this._damages.push(damage);
	this.addChild(damage);
};

Spriteset_Battle.prototype.updateDamages = function() {
	if (this._damages.length > 0) {
		if (!this._damages[0].isPlaying()) {
			let sp = this._damages.shift();
			this.removeChild(sp);
			sp.destroy();
		}
	}
};

Spriteset_Battle.prototype.isDamagePopuping = function() {
	return this._damages.length > 0;
};

Spriteset_Battle.prototype.update = function() {
	Spriteset_Base.prototype.update.call(this);
	this.updateBattleback();
	this.updateAnimations();
	this.updateDamages();
};


Spriteset_Battle.prototype.isBusy = function() {
	return this.isDamagePopuping() || this._spineContainer.children.some(spine => spine.controller.isAnimationPlaying());
};

Sprite_Battler.prototype.updateVisibility = function() {
	Sprite_Clickable.prototype.updateVisibility.call(this);
	if (!this._battler || this._battler instanceof PlayerChar) {
		this.visible = false;
	}
};

Sprite_Battler.prototype.updateMain = function() {
	if (this._battler instanceof EnemyChar) {
		this.updateBitmap();
		this.updateFrame();
	}
	this.updateMove();
	this.updatePosition();
};

Sprite_Enemy.prototype.setBattler = function(battler) {
	Sprite_Battler.prototype.setBattler.call(this, battler);
	this._enemy = battler;
	this.setHome(battler.screenX, battler.screenY);
	this._stateIconSprite.setup(battler);
};

Sprite_Enemy.prototype.updateBitmap = function() {
	Sprite_Battler.prototype.updateBitmap.call(this);
	const name = this._enemy.model;
	const hue = 0;
	if (this._battlerName !== name || this._battlerHue !== hue) {
		this._battlerName = name;
		this._battlerHue = hue;
		this.loadBitmap(name);
		this.setHue(hue);
		this.initVisibility();
	}
};

Sprite_StateIcon.prototype.shouldDisplay = function() {
	//const battler = this._battler;
	//return battler && (battler.isActor() || battler.isAlive());
	return false;
};

Sprite_Battleback.prototype.battleback1Name = function() {
	return $gameTroop.back1;
};

Sprite_Battleback.prototype.battleback2Name = function() {
	return $gameTroop.back2;
};
//#endregion

//#region Animation
/**
 *
 * @param {number} id
 * @param {Point} pos
 * @param {boolean} mirror
 */
Spriteset_Base.prototype.createAnimation = function(id, pos, mirror = false) {
	const animation = $dataAnimations[id];
	let delay = this.animationBaseDelay();
	const nextDelay = this.animationNextDelay();

	let sprite = new Sprite_Animation();
	const baseDelay = this.animationBaseDelay();
	const previous = delay > baseDelay ? this.lastAnimationSprite() : null;

	sprite.setup(pos, animation, mirror, delay, previous);
	this._effectsContainer.addChild(sprite);
	this._animationSprites.push(sprite);
};

Spriteset_Base.prototype.removeAnimation = function(sprite) {
	this._animationSprites.remove(sprite);
	this._effectsContainer.removeChild(sprite);
	sprite.destroy();
};

Sprite_Animation.prototype.setup = function(
	position, animation, mirror, delay, previous
) {
	this._position = position;
	this._animation = animation;
	this._mirror = mirror;
	this._delay = delay;
	this._previous = previous;
	this._effect = EffectManager.load(animation.effectName);
	this._playing = true;
	const timings = animation.soundTimings.concat(animation.flashTimings);
	for (const timing of timings) {
		if (timing.frame > this._maxTimingFrames) {
			this._maxTimingFrames = timing.frame;
		}
	}
};

Sprite_Animation.prototype.updateFlash = function() {
};

Sprite_Animation.prototype._render = function(renderer) {
	if (this._handle && this._handle.exists) {
		this.onBeforeRender(renderer);
		this.saveViewport(renderer);
		this.setProjectionMatrix(renderer);
		this.setCameraMatrix(renderer);
		this.setViewport(renderer);
		Graphics.effekseer.beginDraw();
		Graphics.effekseer.drawHandle(this._handle);
		Graphics.effekseer.endDraw();
		this.resetViewport(renderer);
		this.onAfterRender(renderer);
	}
};

Sprite_Animation.prototype.targetPosition = function(renderer) {
	const pos = new Point();
	if (this._animation.displayType === 2) {
		pos.x = renderer.view.width / 2;
		pos.y = renderer.view.height / 2;
	} else {
		pos.x = this._position.x;
		pos.y = this._position.y;
	}
	return pos;
};

Sprite_Animation.prototype.checkEnd = function() {
	if (
		this._frameIndex > this._maxTimingFrames &&
		!(this._handle && this._handle.exists)
	) {
		this._playing = false;
	}
};
//#endregion

//#region DamageSprite
Sprite_Damage.prototype.initialize = function() {
	Sprite.prototype.initialize.call(this);
	this._duration = 60;
	this._flashColor = [0, 0, 0, 0];
	this._flashDuration = 0;
	this._damageBitmap = ImageManager.LoadUIBitmap(undefined, 'damage');
};

/**
 * @param {Damage} damage
 */
Sprite_Damage.prototype.setup = function(damage) {
	if (!damage.IsHit()) {
		this._colorType = 0;
		this.createMiss();
	} else if (damage.type === Damage.TYPE.HP) {
		this.createDigits(0, damage.value);
	} else if (damage.type === Damage.TYPE.MANA) {
		this.createDigits(2, damage.value);
	}
	if (damage.IsCritical()) {
		this.setupCriticalEffect();
	}
};

Sprite_Damage.prototype.destroy = function(options) {
	// for (const child of this.children) {
	// 	if (child.bitmap) {
	// 		child.bitmap.destroy();
	// 	}
	// }
	Sprite.prototype.destroy.call(this, options);
};

Sprite_Damage.prototype.createMiss = function() {
	let w = this.digitWidth();
	let h = this.digitHeight();
	let sprite = this.createChildSprite();
	sprite.setFrame(0, 4 * h, 10 * w, h);
	sprite.dy = 0;
	sprite.x = (6 * w) / 2;
};

Sprite_Damage.prototype.createDigits = function(baseRow, value) {
	let string = Math.abs(value).toString();
	let row = baseRow + (value < 0 ? 1 : 0);
	value = Math.abs(value);
	let w = this.digitWidth();
	let h = this.digitHeight();
	let l = string.length;
	let digit, sprite;
	let counter = 0;
	while (value > 0) {
		digit = value % 10;
		value = Math.floor(value / 10);
		sprite = this.createChildSprite();
		sprite.setFrame(digit * w, row * h, w, h);
		sprite.x = (l / 2 - (++counter)) * w ;
		sprite.dy = -(l - counter);
	}
};

Sprite_Damage.prototype.createChildSprite = function() {
	let sprite = new Sprite();
	sprite.bitmap = this._damageBitmap;
	sprite.anchor.x = 0.5;
	sprite.anchor.y = 1;
	sprite.y = -40;
	sprite.ry = sprite.y;
	this.addChild(sprite);
	return sprite;
};

Sprite_Damage.prototype.digitHeight = function() {
	return this._damageBitmap ? this._damageBitmap.height / 8 : 0;
};

Sprite_Damage.prototype.digitWidth = function() {
	return this._damageBitmap ? this._damageBitmap.width / 10 : 0;
};
//#endregion