class BattleResultScene extends CustomScene {
	CreateCustomContents() {
		this.GainBattleRewards();
		this.CreateTitle();
		this.CreateCharWindow();
		this.CreateDropWindow();
		this.CreateCloseBtn();
	}

	start() {
		super.start();
		AudioManager.stopBgm();
		AudioManager.playSe({name: '$victory', volume: 100, pitch: 100});
	}

	get titleHeight() {return 80;}

	_title;
	CreateTitle() {
		this._title = new Sprite(ImageManager.LoadUIBitmap(undefined, 'img_btl_win'));
		this._title.move(Graphics.width/2 - 80, 20);
		this.addChild(this._title);
	}

	_drops = [];
	GainBattleRewards() {
		for (let e of $gameTroop.members) {
			$gameParty.battleMembers.forEach(c => {
				if (e.level >= c.level) {
					c.GainExp(10 * (1.1 ** (e.level - c.level)));
				} else {
					c.GainExp(10 * (0.9 ** (c.level - e.level)));
				}
			});
		}
		for (let drop of $gameTroop.drops) {
			if (Math.randomInt(100) <= drop.probability) {
				this._drops.push(drop);
				$gameParty.GetItem(drop.iname, drop.amount);
			}
		}
	}

	_charWindow;
	CreateCharWindow() {
		const h = this.titleHeight;
		const w = 160;

		this._charWindow = new CustomWindow(0, h, Graphics.width/2, Graphics.height - h, '', 0);
		this.addChild(this._charWindow);
		let y = 0;
		for (let c of $gameParty.battleMembers) {
			this._charWindow.DrawImage('img/ui/', 'face_bg', 0, 0, 0, y, w, w);
			this._charWindow.DrawImage('/img/faces/', c.model, 0, 0, 0, y, w, w, new Paddings(4));
			this._charWindow.DrawText(c.name, w + 8, y + 6, Graphics.width/2);
			this._charWindow.DrawText(`等级${c.level}`, w + 8, y + 36, Graphics.width/2);
			this._charWindow.DrawProgressBar('Exp', 4, w + 8, y + 66, 420, c.exp, 100);
			y += w;
		}
	}

	_dropWindow;
	CreateDropWindow() {
		const h = this.titleHeight;
		this._dropWindow = new DropListWindow(Graphics.width/2, h, Graphics.width/2, Graphics.height - h, '', 0);
		this.addChild(this._dropWindow);
		this._dropWindow.SetList(this._drops);
		this._dropWindow.Activate();
	}

	_closeBtn;
	CreateCloseBtn() {
		this._closeBtn = new Button('', 'btn_close', Graphics.width - 108, 0, 108, 48);
		this.addChild(this._closeBtn);
		this._closeBtn.SetClickHandler(()=>{
			$gameParty.ConcludeBattle();
			AudioManager.stopSe();
		});
	}

}

class DropListWindow extends ItemListWindow {
	DrawItem(index) {
		if (!this._data[index]) return;
		let r = this.GetItemRect(index);
		let i_r = new Rectangle(r.x, r.y, r.height, r.height);
		this.DrawTexture('img/ui/', 'cell_cmn', r.x, r.y, r.width, r.height, new Paddings(10));
		let item = $dataItems[this._data[index].iname];
		this.DrawImageInRect('img/icons/item/', item.icon,0, 0, i_r);
		this.DrawTextEx(item.name, r.x + i_r.width, r.y + r.height/3.5, r.width - r.height);
		this.DrawItemAmount(this._data[index], r);

		if (this.index === index) {
			this.DrawTexture('img/ui/', 'cell_select_cmn', r.x, r.y, r.width, r.height, new Paddings(9));
		}
	}
}