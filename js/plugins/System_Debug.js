class VPContentArea extends PIXI.Container {
    update() {
        for (const child of [...this.children].reverse()) {
            if (child.update) {
                child.update();
            }
        }
    }
}

class VerticalLayoutContentArea extends VPContentArea {
    _currentH = 0;
    addChild(c) {
        c.y = this._currentH;
        this._currentH += c.height;
        super.addChild(c);
    }

    get currentH() {return this._currentH;}
    set currentH(val) { this._currentH = val;}
}

class HorizontalLayoutContentArea extends VPContentArea {
    _currentW;
    addChild(c) {
        c.x = this._currentW;
        this._currentW += c.width;
        super.addChild(c);
    }

    get currentW() {return this._currentW;}
    set currentW(val) { this._currentW = val;}
}

class ViewPort extends Clickable {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     * @param {Paddings} p 
     * @param {SpreadingPreset} spr_conf
     */
    constructor(x, y, w, h, p, spr_conf) {
        super(x, y, w, h);
        this._paddings = p;
        this._sprConf = spr_conf;
        this.Init();
    }

    get contentWidth() {
        return this.width - this._bg._paddings.left - this._bg._paddings.right;
    }

    get contentArea() {return this._contentArea;}

    Init() {
        this._bg = this.addChild(new Spreading(0, 0, this._width, this._height, this._sprConf, 1));
        this.CreateContentArea();
        this.CreateScroller();
        this.ConfigContentArea();
        this.Activate();
    }


    CreateContentArea() {
        this._contentArea = new VPContentArea();
        this.addChild(this._contentArea);
    }

    CreateScroller() {
        this._scroller = this.addChild(new Spreading(this._width - 4 - this._paddings.left, 0, 4, 5, {path: undefined, paddings: [0,2,0,2]}, 1));
    }

    ConfigContentArea() {
        this._contentArea.x = this._paddings.left;
        this._contentArea.y = this._paddings.top;
        const mask = new PIXI.Graphics()
            .beginFill(0xFFFFFF)
            .drawRect(this._paddings.left, this._paddings.top, this._width - this._paddings.left - this._paddings.right, this._height - this._paddings.top - this._paddings.bottom)
            .endFill();
        this.addChild(mask);
        this._contentArea.mask = mask;
        this._scroller.mask = mask;
    }

    

    _items = [];
    AddItem(it) {
        this._contentArea.addChild(it);
        this._items.push(it);
        return it;
    }

    update() {
        super.update();
        this.UpdateInertia();
        this.UpdateScroll();
        this.UpdateBorderBouncing();
        this.UpdateContentScroll();
        this.UpdateScroller();
    }

    //#region Scroll
    _scrollEnabledX = false;
    _scrollEnabledY = false;

    static InertiaAttenuation  = 0.94;

    _scroll = 0;
    _scrolling = 0;
    _scrollX = 0;
    _scrollingX = 0;
    /*** @returns {number} */
    get scroll() { return this._scroll + this._scrolling; }
    /*** @returns {number} */
    get scrollX() { return this._scrollX + this._scrollingX; }
    /*** @returns {number} */
    get scrollPadding() { return 12; }

    _inertia = 0;
    _inertiaX = 0;
    UpdateInertia() {
        if (!this.IsPressed() && (this._inertia > 1 || this._inertia < -1)) {
            if (this._scrollEnabledY && (this._inertia > 1 || this._inertia < -1)) {
                this._scroll += this._inertia;
                this._inertia = this._inertia * ViewPort.InertiaAttenuation;
            }
            if (this._scrollEnabledX && (this._inertiaX > 1 || this._inertiaX < -1)) {
                this._scrollX += this._inertiaX;
                this._inertiaX = this._inertiaX * ViewPort.InertiaAttenuation;
            }
        }
    }

    _lastY = 0;
    _lastX = 0;
    UpdateScroll() {
        if (this.IsPressed()) {
            if (this._scrollEnabledY) {
                const y = TouchInput.y;
                this._scrolling = y - this._pressPoint.y;
                this._inertia = y - this._lastY;
                this._lastY = y;
            }
            if (this._scrollEnabledX) {
                const x = TouchInput.x;
                this._scrollingX = x - this._pressPoint.x;
                this._inertiaX = x - this._lastX;
                this._lastX = x;
            }
        }
    }

    ProcessRelease() {
        super.ProcessRelease();
        if (this._scrollEnabledY) {
            this._scroll += this._scrolling;
            this._scrolling = 0;
        }
        if (this._scrollEnabledX) {
            this._scrollX += this._scrollingX;
            this._scrollingX = 0;
        }
    }



    UpdateBorderBouncing() {
        if (this.IsPressed()) return;
        if (this._scrollEnabledY) {
            if (this._scroll > 0) {
                this._scroll -= (this._scroll) / 3;
                if (this._scroll < 1) this._scroll = 0;
            }
    
            const min = -this._contentArea.height + 100;
            if (this._scroll < min) {
                this._scroll -= (this._scroll -min) / 3;
                if (min - this._scroll < 1) this._scroll = min;
            }
        }
        

        if (this._scrollEnabledX) {
            if (this._scrollX > 0) {
                this._scrollX -= (this._scrollX) / 3;
                if (this._scrollX < 1) this._scrollX = 0;
            }
    
            if (this._scrollX < -this._contentArea.width) {
                this._scrollX -= (this._scrollX + this._contentArea.width) / 3;
                if (-this._contentArea.width - this._scrollX < 1) this._scrollX = -this._contentArea.width;
            }
        }
    }

    UpdateContentScroll() {
        if (this._scrollEnabledY) this._contentArea.y = this.scroll + this._paddings.top;
        if (this._scrollEnabledX) this._contentArea.x = this.scrollX + this._paddings.left; 
    }

    UpdateScroller() {
        if (this._contentArea.height <= this.height - this._paddings.top - this._paddings.bottom) {
            this._scroller.visible = false;
        } else {
            this._scroller.visible = true;
            this._scroller.height = (this.height - this._paddings.top - this._paddings.bottom)*(this.height - this._paddings.top - this._paddings.bottom)/(this._contentArea.height + 100);
            this._scroller.y = (-this.scroll) / (this._contentArea.height - 100) * (this.height - this._paddings.top - this._paddings.bottom - this._scroller.height);
        }
    }
    //#endregion
}

class ViewPortVertical extends ViewPort {
    CreateContentArea() {
        this._contentArea = new VerticalLayoutContentArea();
        this.addChild(this._contentArea);
    }
}

class ViewPortHorizontal extends ViewPort {
    CreateContentArea() {
        this._contentArea = new HorizontalLayoutContentArea();
        this.addChild(this._contentArea);
    }
}

class BattleMap extends PIXI.Container {
    static TileWidth = 48;
    static TileHeight = 48;
    static Folder = 'data/battle_maps/';
    _iname = '';
    _focus = new Point(0, 0);
    _tilesetId = 0;
    _mapData;

    async Load(iname) {
        this._iname = iname;
        DataUtils.Load(BattleMap.Folder + this._iname + '.json').then(res => {
            this._mapData = res.data;
            this.OnLoad();
        });
    }

    OnLoad() {
        this._tilesetId = this._mapData.tilesetId;
        this._focus.set(0, 0);
        this.Recreate();
    }

    Recreate() {
        this.CreateTilemap();
        this.CreateMoveShow();
        this.CreateGridLine();
        this.CreateCursor();
    }

    CreateTilemap() {
        const tm = new Tilemap();
        tm.tileWidth = BattleMap.TileWidth;
        tm.tileHeight = BattleMap.TileHeight;
        tm.setData(this._mapData.width, this._mapData.height, this._mapData.data);
        tm.width = BattleMap.TileWidth * this._mapData.width;
        tm.height = BattleMap.TileHeight * this._mapData.height;
        tm.horizontalWrap = false;
        tm.verticalWrap = false;
        this.addChild(tm);
        this._tilemap = tm;
        this.LoadTileset();
    }

    LoadTileset() {
        this._tileset = $dataTilesets[this._tilesetId];
        if (this._tileset) {
            const bitmaps = [];
            const tilesetNames = this._tileset.tilesetNames;
            for (const name of tilesetNames) {
                bitmaps.push(ImageManager.loadTileset(name));
            }
            this._tilemap.setBitmaps(bitmaps);
            this._tilemap.flags = this.tilesetFlags;
        }
    }
    get tilesetFlags() {
        const tileset = this._tileset;
        if (tileset) {
            return tileset.flags;
        } else {
            return [];
        }
    }


    CreateMoveShow() {
        this._moveShow = new Sprite(new Bitmap(BattleMap.TileWidth * this._mapData.width, BattleMap.TileHeight * this._mapData.height));
        this.addChild(this._moveShow);
        this._moveShow.opacity = 160;
    }

    CreateGridLine() {
        this._grid = new MapGrid(this._mapData.width, this._mapData.height);
        this.addChild(this._grid);
    }

    CreateCursor() {
        this._cursor = new Sprite(new Bitmap(BattleMap.TileWidth,BattleMap.TileWidth));
        this._cursor.bitmap.DrawImage('img/ui/','grid_select',0,0,0,0,BattleMap.TileWidth,BattleMap.TileWidth);
        this.addChild(this._cursor);
        this._cursorPos = new Point(0,0);
    }

    

    TerrainTag(x, y) {
        if (this.isValid(x, y)) {
            const flags = this.tilesetFlags;
            const tiles = this.layeredTiles(x, y);
            for (const tile of tiles) {
                const tag = flags[tile] >> 12;
                if (tag > 0) {
                    return tag;
                }
            }
        }
        return 0;
    }

    GetTiles(x, y) {
        const tiles = [];
        for (let i = 0; i < 4; i++) {
         tiles.push(this.GetTileId(x, y, 3 - i));
        }
        return tiles;
    }

    GetTileId(x, y, z) {
        const width = this._mapData.width;
        const height = this._mapData.height;
        return this._mapData.data[(z * height + y) * width + x] || 0;
    }

    CheckMapPassage(x, y, bit = 0b1) {
        const flags = this.tilesetFlags;
        const tiles = this.GetTiles(x, y);
        for (const tile of tiles) {
            const flag = flags[tile];
            if ((flag & 0x10) !== 0) {
                // [*] No effect on passage
                continue;
            }
            if ((flag & bit) === 0) {
                // [o] Passable
                return true;
            }
            if ((flag & bit) === bit) {
                // [x] Impassable
                return false;
            }
        }
        return false;
    }

    CanReach(x, y) {
        return x < this._mapData.width && x > -1 && y < this._mapData.height && y > -1 && this.CheckMapPassage(x, y);
    }

    FindReachableNodes(x, y, m) {
        MoveNode.StartNewMove();
        const open = [new MoveNode(x, y, m, null)];
        const close = [];
        open.push();
        while (open.length != 0) {
            const node = open.shift();
            for (const dir of [[1,0], [-1,0], [0,1], [0, -1]]) {
                let t = node.MoveNext(dir);
                if (t.movePt >= 0 && this.CanReach(t.x, t.y) && close.indexOf(t) < 0)
                    open.push(t);
                
            }
            close.push(node);
        }
        return close;
    }

    /**
     * 
     * @param {MoveNode[]} nodes 
     */
    ShowMoveNodes(nodes) {
        for(const node of nodes) {
            this._moveShow.bitmap.fillRect(node.x * BattleMap.TileWidth, node.y * BattleMap.TileHeight, BattleMap.TileWidth,BattleMap.TileHeight, Colors.Blue);
        }
    }

    ClearMoveShow() {
        this._moveShow.bitmap.clear();
    }



    update() {
        for (const child of this.children) {
            if (child.update) {
                child.update();
            }
        }
        this.UpdateSelectGrid();
    }

    UpdateSelectGrid() {
        if (TouchInput.isTriggered()) {
            this.ClearMoveShow();
            const pos = this.worldTransform.applyInverse(new Point(TouchInput.x, TouchInput.y));
            this._cursorPos.set(Math.floor(pos.x / BattleMap.TileWidth),Math.floor(pos.y / BattleMap.TileHeight));
            if (this.CheckMapPassage(this._cursorPos.x, this._cursorPos.y)) {
                toast('通行');
                this.ShowMoveNodes(this.FindReachableNodes(this._cursorPos.x, this._cursorPos.y, 3));
            } else {
                toast('不通行');
            }
            const x = BattleMap.TileWidth * this._cursorPos.x;
            const y = BattleMap.TileHeight * this._cursorPos.y;
            this._cursor.move(x, y);
            this.x = Graphics.width/2 - x;
            this.y = Graphics.height/2 - y;
            console.log('map click');
        }
    }
}

class MoveNode {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} p - 剩余移动力 
     * @param {MoveNode} prev - 上一节点
     */
    constructor(x, y, p, prev) {
        this._x = x;
        this._y = y;
        this._movePoints = p;
        this._prevNode = prev;
        MoveNode.Nodes.push(this);
    }

    get x() {return this._x;}
    get y() {return this._y;}
    get movePt() {return this._movePoints;}
    get prevNode() {return this._prevNode;}

    /**
     * @param {number[]} dir - direction vector 
     * @returns {MoveNode}
     */
    MoveNext(dir) {
        return new MoveNode(
            this.x + dir[0],
            this.y + dir[1],
            this.movePt - 1,
            this
        );
    }

    static Nodes = [];

    static StartNewMove() {
        MoveNode.Nodes = [];
    }
    
}

class MapGrid extends Sprite {
    initialize(w, h) {
        super.initialize();
        const width = BattleMap.TileWidth * w;
        const height = BattleMap.TileHeight * h;
        this.bitmap = new Bitmap(width, height);
        this.DrawGrid(w, h);
    }

    static LineColor = 'rgb(0,0,0)';

    DrawGrid(w, h) {
        for (let i=0;i<w;++i) {
            const x = i * BattleMap.TileWidth;
            const bh = this.bitmap.height;
            this.bitmap.fillRect(x, 0, 1, bh, MapGrid.LineColor);
        }
        for (let i=0;i<h;++i) {
            const y = i * BattleMap.TileHeight;
            const bw = this.bitmap.height;
            this.bitmap.fillRect(0, y, bw, 1, MapGrid.LineColor);
        }
    }
}

class BattleMapScene extends CustomScene {

    get backgroundImageName() {return 'scene_bg_pattern_black';}
    CreateCustomContents() {
        this._map = new BattleMap();
        this.addChild(this._map);
        this._map.Load('test');
	}

}

class SpinePlayItem extends Spreading {
    constructor(w, name, mode) {
        super(0, 0, w, 120, Spreading.Presets.ANADEN_CELL, mode);
        const tx = new PIXI.Text(name, TextStyles.KaiTitle);
        this.addChild(tx);
        tx.anchor.set(0.5);
        tx.y = this.height/2;
        tx.x = tx.width/2 + 20;
        this._btn = new Button(w - 240, 20, 200, 80, '播放', ...Button.Presets.ANADEN_PURPLE, TextStyles.KaiTitle);
        this.addChild(this._btn);
        this._btn.OnClick.add(()=> {
            this._spine?.state.setAnimationByName(0, name, true);
        });
    }

    SetSpine(spine) {
        this._spine = spine;
    }


    update() {
        this._btn.update();
    }
}



class DebugScene extends MenuBaseScene {
	CreateCustomContents() {
		super.CreateCustomContents();
		//this.CreateCharList();
		this.CreateButtons();
	}

	CreateCharList() {
		this._charListWindow = new CharacterListWindow(0, 0, Graphics.width, Graphics.height, '', 0);
		this.addChild(this._charListWindow);
		this._charListWindow.MakeList();
		this._charListWindow.Activate();
	}

	async CreateButtons() {
        let btn;
        window.sp = await SpineUtils.LoadSpine('104050091');
        const regions = await SpineUtils.MakeWeaponRegions('211050133');
        sp.state.setAnimationByName(0, 'idleBattle', true);
        SpineUtils.SetSpineWeapon(sp, 'weapon_bow', regions[0]);
        SpineUtils.SetSpineWeapon(sp, 'weapon_arrow', regions[1]);
        sp.x = 150; sp.y = 300;
        const ct = this.addChild(new PIXI.Container());
        ct.addChild(sp);
        window.vp = this.addChild(new ViewPortVertical(400, 100, 700, 520, new Paddings(15), Spreading.Presets.ANADEN_BACK));
        vp._scrollEnabledY = true;
        for (const ani of sp.skeleton.data.animations) {
            const spt = new SpinePlayItem(660, ani.name, 1);
            spt.SetSpine(sp);
            vp.AddItem(spt);
        }
    }

	TestFunc() {
		//BattleFlow.BeginBattle("ES_TEST");
		this.Toast('特朗普跟小三跑了！', '#dd004d');
	}

	TestLwf() {
		let name = prompt();
		if (name)
			LWFUtils.PlayLwf('lwf/battleLwf/', name, 500, 300);
	}

	TestNumber() {
		let name = prompt();
		this._number.SetNumber(parseInt(name));
	}
}