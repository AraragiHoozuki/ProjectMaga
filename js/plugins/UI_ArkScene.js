class ArkListScene extends MenuBaseScene {
    get headerText() {return '圣物';}

    CreateContents() {
        super.CreateContents();
        this.CreateArkList();
    }

    CreateArkList() {
        this._arkListWindow = new ArkListWindow(0, this.headerHeight, Graphics.width, Graphics.height - this.headerHeight, '', 0, undefined, 'wd_back_noframe');
        this.addChild(this._arkListWindow);
        this._arkListWindow.MakeList();
        this._arkListWindow.Activate();
        this._arkListWindow.SetHandler(this._arkListWindow.OnClick, this.OnArkClick.bind(this));
    }

    OnArkClick() {
        ArkDetailScene.ark = this._arkListWindow.item;
        SceneManager.push(ArkDetailScene);
    }
}

class ArkDetailScene extends MenuBaseScene {
    /** @type Ark */
    static ark = undefined;
    get headerText() {return '圣物';}

    CreateContents() {
        super.CreateContents();
        this.CreateArkImageWindow();
        this.CreateArkSkillWindow();
        this.CreateLearningSkillWindow();
        this.CreateFlavourWindow();
        this.CreateButtons();
        this.CreateInfoWindow();
    }

    _arkImage;
    CreateArkImageWindow() {
        this._arkImage = new CustomWindow(10, this.headerHeight, 400, 540,'', 0, undefined, 'wd_back_cmn');
        this.addChild(this._arkImage);
        this._arkImage.DrawText(`${ArkDetailScene.ark.name}`, 0, 0, this._arkImage.width, 'center');
        const rect = new Rectangle(0, 36, 400, 500);
        this._arkImage.DrawImageInRect('img/icons/ark/', ArkDetailScene.ark.image, 0, 0, rect, new Paddings(4));
    }

    _arkSkill;
    CreateArkSkillWindow() {
        this._arkSkill = new InfoWindow(10, this._arkImage.y + this._arkImage.height, 400, Graphics.height - this._arkImage.y - this._arkImage.height, 0, '', 0, undefined, 'wd_back_cmn');
        this._arkSkill.SetString(ArkDetailScene.ark.shortDesc);
        this.addChild(this._arkSkill);
        this._arkSkill.Activate();
    }

    _learning;
    CreateLearningSkillWindow() {
        this._learning = new ArkLearningList(this._arkImage.x + this._arkImage.width, this.headerHeight, 590, Graphics.height - this.headerHeight, '', 0, '', 'wd_back_cmn');
        this._learning.MakeList(ArkDetailScene.ark);
        this.addChild(this._learning);
        this._learning.Activate();

        this._learning.SetHandler(this._learning.OnLongPress, ()=>{
            if (this._learning.index >= 0) {
                this._infoWindow.SetString(Skill.GetDescription($dataSkills[this._learning.item.iname], 0));
                this._infoWindow.Open();
            }
        });
        this._learning.SetHandler(this._learning.OnLongPressRelease, ()=>{this._infoWindow.Close();});
    }

    _flavour;
    CreateFlavourWindow() {
        this._flavour = new InfoWindow(this._learning.x + this._learning.width, this.headerHeight, Graphics.width - this._learning.x - this._learning.width - 10, Graphics.height - this.headerHeight - 180, 0, '', 0, undefined, 'wd_back_cmn');
        this.addChild(this._flavour);
        this._flavour.SetString(ArkDetailScene.ark.flavour);
        this._flavour.Activate();
    }

    _levelupBtn;
    _exploreBtn;
    CreateButtons() {
        this._levelupBtn = new ArkLevelUpBtn('', 'btn_pos', this._flavour.x, this._flavour.y + this._flavour.height, this._flavour.width, 90, undefined, new Paddings(25), undefined, new Paddings(25));
        this.addChild(this._levelupBtn);
        this._levelupBtn.SetHandler(this._levelupBtn.OnClick, () => {
           if (ArkDetailScene.ark.IsMaxLevel()) {
               toast('已到最大等级', Colors.Red);
           } else if ($gameParty.ItemAmount('IT_MAT_BLUE_SOUL') < ArkDetailScene.ark.GetLevelUpCost()) {
               toast('圣魂不足', Colors.Red);
           } else {
               ArkDetailScene.ark.LevelUp();
               this._levelupBtn.RecreateText();
               AudioManager.PlaySe('se_heavy_click');
           }
        });
        this._exploreBtn = new ArkExploreBtn('', 'btn_pos', this._flavour.x, this._flavour.y + this._flavour.height + this._levelupBtn.height, this._flavour.width, 90, undefined, new Paddings(25), undefined, new Paddings(25));
        this.addChild(this._exploreBtn);
        this._exploreBtn.SetHandler(this._exploreBtn.OnClick, () => {
            if (ArkDetailScene.ark.IsExploreItemGot()) {
                toast('已经取得探索道具', Colors.Red);
            } else if (ArkDetailScene.ark.explore < Ark.MaxExplore) {
                const w =  new InfoWindow(100, this.headerHeight, Graphics.width - 200, Graphics.height - this.headerHeight * 2 - 100, 0, '', 0, undefined, 'wd_back_cmn');
                w.SetString(`探索值达到${Ark.MaxExplore}时可以获得：${$dataItems[ArkDetailScene.ark.data.item].name}\n${$dataItems[ArkDetailScene.ark.data.item].description}`);
                this.Dialog(w, false, true, ()=>{});
            } else {
                ArkDetailScene.ark.GetExploreItem();
                AudioManager.PlaySe('se_heavy_click');
            }
        });

    }

    _infoWindow;
    CreateInfoWindow() {
        this._infoWindow = new InfoWindow(100, this.headerHeight, Graphics.width - 200, Graphics.height - this.headerHeight * 2, 0, '', 0, undefined, 'wd_back_dark');
        this.addChild(this._infoWindow);
        this._infoWindow.Close();
    }
}

class ArkLearningList extends ScrollListWindow {
    /** @type ArkLearn[] */
    _data;
    get maxCols() { return 1;}
    get itemHeight() { return 80; }
    /** @returns {ArkLearn} */
    get item() { return super.item;}

    /**
     * @param {Ark} ark
     */
    MakeList(ark) {
        this._data = ark.allLearnings;
        super.MakeList();
    }

    DrawItem(index) {
        let r = this.GetItemRect(index);
        let i_r = new Rectangle(r.x, r.y, r.height, r.height);
        let ls = this._data[index];
        this.DrawTexture('img/ui/', 'cell_cmn', r.x, r.y, r.width, r.height, new Paddings(10));
        this.DrawImageInRect('img/icons/skill/', $dataSkills[ls.iname].icon,0, 0, i_r, new Paddings(10));
        this.DrawTextEx(`${$dataSkills[ls.iname].name}\nAP倍率: ${ls.ap}    需要AP: ${$dataSkills[ls.iname].ap}    需要等级: ${ls.level}`, r.x + i_r.width, r.y + 12, r.width - r.height);
        if (this.index === index) {
            this.DrawTexture('img/ui/', 'cell_select_cmn', r.x, r.y, r.width, r.height, new Paddings(9));
        }
    }
}

class ArkLevelUpBtn extends Button {

    CreateText(text) {
        this._textSprite = new Sprite(new Bitmap(this.width, this.height));
        this.addChild(this._textSprite);
        this.RecreateText();

    }

    RecreateText() {
        this._textSprite.bitmap.clear();
        this._textSprite.bitmap.drawText('升级', 0, 24, this.width, 24,'center');
        this._textSprite.bitmap.DrawImage('img/icons/item/', 'blue_soul', 0, 0, 20, 48,24, 24);
        if ($gameParty.ItemAmount('IT_MAT_BLUE_SOUL') < ArkDetailScene.ark.GetLevelUpCost()) {
            this._textSprite.bitmap.textColor = Colors.Red;
        }
        this._textSprite.bitmap.drawText(`${ArkDetailScene.ark.GetLevelUpCost()}/${$gameParty.ItemAmount('IT_MAT_BLUE_SOUL')}`, 0, 48, this.width, 24,'center');
    }
}

class ArkExploreBtn extends ArkLevelUpBtn {
    RecreateText() {
        this._textSprite.bitmap.clear();
        this._textSprite.bitmap.drawText(`探索度(${ArkDetailScene.ark._explore}/${Ark.MaxExplore})`, 0, 0, this.width, this.height, 'center');
    }
}