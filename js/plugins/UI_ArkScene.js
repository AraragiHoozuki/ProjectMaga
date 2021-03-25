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
    }
}