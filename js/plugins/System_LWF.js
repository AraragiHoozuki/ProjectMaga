class LWFUtils {
    static stage;
    static cache;
    static lwf;
    static currentId = 0;
    static Init() {
        this.lwfs = [];
        if (LWF) {
            LWFUtils.stage = document.createElement('canvas');
            LWFUtils.stage.width = 1280;
            LWFUtils.stage.height = 720;
            LWFUtils.stage.style.zIndex = '2';
            LWFUtils.stage.style.position = 'absolute';
            LWFUtils.stage.style.top = '0';
            LWFUtils.stage.style.left = '0';
            LWFUtils.stage.style.bottom = '0';
            LWFUtils.stage.style.right = '0';
            LWFUtils.stage.style.margin = "auto";
            LWFUtils.stage.style.pointerEvents = 'none';
            document.body.appendChild(LWFUtils.stage);
            window.onresize=()=>{
                LWFUtils.stage.style.width=Graphics._realScale * LWFUtils.stage.width + 'px';
                LWFUtils.stage.style.height=Graphics._realScale * LWFUtils.stage.height + 'px';
            };
            LWF.useCanvasRenderer();
            LWFUtils.cache = LWF.ResourceCache.get();
            LWFUtils.Load('lwf/battleLwf/', '810000000').then(lwf=>{
                LWFUtils.lwf = lwf;
                LWFUtils.lwf.rootMovie.moveTo(0,0);
            });
        }
    }

    static Load(folder, name) {
        return new Promise((resolve, reject)=> {
            LWFUtils.cache.loadLWF({
                'lwf': name + '.lwf',
                'prefix': folder + name + '/',
                'stage': LWFUtils.stage,
                'onload': (lwf) => {
                    lwf.setFrameRate(Graphics.app.ticker.FPS);
                    //lwf.rootMovie.scaleTo(lwf.width/1280, lwf.height/720);
                    resolve(lwf);
                }
            });
        });
    }

    static PlayLwf(folder, name, x, y) {
        LWFUtils.Load(folder, name).then((lwf)=> {
            LWFUtils.lwf.rootMovie.attachLWF(lwf);
            lwf.rootMovie.moveTo(x, y);
        });
    }

    static StaticLwf(folder, name, x, y) {
        LWFUtils.currentId++;
        const id = LWFUtils.currentId;
        LWFUtils.Load(folder, name).then((lwf)=> {
            LWFUtils.lwf.rootMovie.attachLWF(lwf, id);
            lwf.rootMovie.moveTo(x, y);
        });
        return id;
    }

    static RemoveLwf(id) {
        LWFUtils.lwf.rootMovie.deleteAttachedLWF(LWFUtils.lwf.rootMovie, LWFUtils.lwf.rootMovie.attachedLWFs[id]);
    }
}

LWFUtils.SceneManager_updateMain = SceneManager.updateMain;

SceneManager.updateMain = function() {
    this.updateFrameCount();
    this.updateInputData();
    this.updateEffekseer();
    this.changeScene();
    this.updateScene();
    if (LWFUtils.lwf) {
        LWFUtils.lwf.exec(Graphics.app.ticker.deltaMS/1000);
        LWFUtils.lwf.render();
    }
};

Scene_Boot.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    SoundManager.preloadImportantSounds();
    if (DataManager.isBattleTest()) {
        DataManager.setupBattleTest();
        SceneManager.goto(Scene_Battle);
    } else if (DataManager.isEventTest()) {
        DataManager.setupEventTest();
        SceneManager.goto(Scene_Map);
    } else {
        this.startNormalGame();
    }
    this.resizeScreen();
    this.updateDocumentTitle();
    //added
    LWFUtils.Init();
};