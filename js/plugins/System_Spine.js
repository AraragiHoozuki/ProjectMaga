class SpineUtils {
    /**
     *
     * @param {string} filename
     */
    static async MakeWeaponRegions(filename) {
        const path = `spine/weapon/${filename}.atlas`;
        let res = await DataUtils.Load(path);
        const reader = new AtlasReader(res.data);
        let line, page, region;
        let regions = [];
        let tuple = [];
        tuple.length = 4;
        while (true) {
            line = reader.readLine();
            if (line === null) {
                return regions;
            }
            line = reader.trim(line);
            if (!line.length)
                page = null;
            else if (!page) {
                page = new PIXI.spine.SpineRuntime.AtlasPage();
                page.name = line;
                if (reader.readTuple(tuple) == 2) { // size is only optional for an atlas packed with an old TexturePacker.
                    page.width = parseInt(tuple[0]);
                    page.height = parseInt(tuple[1]);
                    reader.readTuple(tuple);
                } else {
                    //old format, detect width and height by texture
                }
                page.format = PIXI.spine.SpineRuntime.Atlas.Format[tuple[0]];
                reader.readTuple(tuple);
                page.minFilter = PIXI.spine.SpineRuntime.Atlas.TextureFilter[tuple[0]];
                page.magFilter = PIXI.spine.SpineRuntime.Atlas.TextureFilter[tuple[1]];
                let direction = reader.readValue();
                page.uWrap = PIXI.spine.SpineRuntime.Atlas.TextureWrap.clampToEdge;
                page.vWrap = PIXI.spine.SpineRuntime.Atlas.TextureWrap.clampToEdge;
                if (direction == "x")
                    page.uWrap = PIXI.spine.SpineRuntime.Atlas.TextureWrap.repeat;
                else if (direction == "y")
                    page.vWrap = PIXI.spine.SpineRuntime.Atlas.TextureWrap.repeat;
                else if (direction == "xy")
                    page.uWrap = page.vWrap = PIXI.spine.SpineRuntime.Atlas.TextureWrap.repeat;
    
                let texture =  (await DataUtils.Load(`spine/weapon/${filename}.png`)).texture;
                page.rendererObject = texture;
                if (!page.width || !page.height) {
                    page.width = texture.width;
                    page.height = texture.height;
                    if (!page.width || !page.height) {
                        console.log("ERROR spine atlas page " + page.name + ": meshes wont work if you dont specify size in atlas (http://www.html5gamedevs.com/topic/18888-pixi-spines-and-meshes/?p=107121)");
                    }
                }
            } else {
                region = new PIXI.spine.SpineRuntime.AtlasRegion();
                //region.name = line;
                region.page = page;
                region.rotate = reader.readValue() == "true";
                reader.readTuple(tuple);
                let x = parseInt(tuple[0]);
                let y = parseInt(tuple[1]);
                reader.readTuple(tuple);
                let width = parseInt(tuple[0]);
                let height = parseInt(tuple[1]);
                region.u = region.u2 = x / page.width;
                region.v = region.v2 = y / page.height;
                if (region.rotate) {
                    region.u2 = (x + height) / page.width;
                    region.v2 = (y + width) / page.height;
                } else {
                    region.u2 = (x + width) / page.width;
                    region.v2 = (y + height) / page.height;
                }
                let resolution = page.rendererObject.resolution;
                region.x = x / resolution;
                region.y = y / resolution;
                region.width = Math.abs(width) / resolution;
                region.height = Math.abs(height) / resolution;

                if (reader.readTuple(tuple) == 4) { // split is optional
                    region.splits = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];

                    if (reader.readTuple(tuple) == 4) { // pad is optional, but only present with splits
                        region.pads = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];
                        reader.readTuple(tuple);
                    }
                }

                region.originalWidth = region.width;
                region.originalHeight = region.height;
                reader.readTuple(tuple);
                // region.offsetX = parseInt(tuple[0]) / resolution;
                // region.offsetY = parseInt(tuple[1]) / resolution;
                region.index = parseInt(reader.readValue());
                regions.push(region);
            }
        }

    }

    /**
     * @param {PIXI.spine.Spine} spine
     * @param {string} slot
     * @param {PIXI.spine.SpineRuntime.AtlasRegion} wep
     * @constructor
     */
    static SetSpineWeapon(spine, slotName, wep) {
        setTimeout(()=> {
            const index = spine.skeleton.findSlotIndex(slotName);
            const slot = spine.skeleton.slots[index];
            slot.attachment.width = wep.width * 10;
            slot.attachment.height = wep.height * 10;
            slot.attachment.rendererObject = wep;
            return wep;
        }, 0);
    }

    /**
     * @param {string} model
     * @param {string} folder
     * @returns {Promise<PIXI.spine.Spine>}
     */
    static async LoadSpine(model, folder='spine/'){
        const path = folder + model + '.skel';
        const res = await DataUtils.Load(path, {'xhrType': 'arraybuffer'});
        const spine = new PIXI.spine.Spine(res.spineData);
        if (folder === 'spine/enemySpine/') {
            spine.scale.x = spine.scale.y = 400 / spine.height;
        } else {
            spine.scale.x = spine.scale.y = 0.1;
        }
       return spine;
    }
}

class AtlasReader {
    constructor(text) {
        this.lines = text.split(/\r\n|\r|\n/);
        this.index = 0;
    }

    trim(value) {
        return value.replace(/^\s+|\s+$/g, "");
    }
    readLine() {
        if (this.index >= this.lines.length) return null;
        return this.lines[this.index++];
    }
    readValue() {
        var line = this.readLine();
        var colon = line.indexOf(":");
        if (colon == -1) throw "Invalid line: " + line;
        return this.trim(line.substring(colon + 1));
    }
      /** Returns the number of tuple values read (1, 2 or 4). */
    readTuple(tuple) {
        var line = this.readLine();
        var colon = line.indexOf(":");
        if (colon == -1) throw "Invalid line: " + line;
        var i = 0, lastMatch = colon + 1;
        for (; i < 3; i++) {
          var comma = line.indexOf(",", lastMatch);
          if (comma == -1) break;
          tuple[i] = this.trim(line.substr(lastMatch, comma - lastMatch));
          lastMatch = comma + 1;
        }
        tuple[i] = this.trim(line.substring(lastMatch));
        return i + 1;
    }
} 

/**
 * Battle Sprite Controller
 */
class SpineCtrl extends PIXI.Container{
    /**
     * 
     * @param {PlayerChar} chr 
     */
    constructor(chr) {
        super();
        this._chr = chr;
        this.Load(chr.model, undefined, chr.weapon_model, chr.weapon_slot);
    }

    _ready = false;
    /** @type PIXI.spine.Spine */
    _spine = undefined;
    _weapon = undefined;

    get spine() {return this._spine;}
    get chr() {return this._chr;}

    async Load(model, path = 'spine/', weapon, slotNames) {
        this._spine = await SpineUtils.LoadSpine(model, path);
        if (weapon) {
            this._weapon = await SpineUtils.MakeWeaponRegions(weapon).then((weps) => {
                for (let i = 0; i< slotNames.length; i++) {
                    SpineUtils.SetSpineWeapon(this._spine, slotNames[i], weps[i]);
                }
            });
        }
        this.OnReady();
        return this._spine;
    }

    OnReady() {
        this._ready = true;
        this._spine.controller = this;
        this.addChild(this._spine);
        this.SetIdle();
        this._spine.state.setAnimationByName(0, this._idleName, true);
    }

    _idleName = 'idleBattle';
    SetIdle() {
        if (this._spine.skeleton.data.findAnimation('idleBattle')) {
            this._idleName = 'idleBattle';
        } else {
            this._idleName = 'idle';
        }
    }

    ResetIdle() {
        this.SetIdle();
        this._spine.state.addAnimationByName(0, this._idleName, true, 0);
    }

    ChangeIdle(name) {
        this._idleName = name;
    }

    _animation;
    SetSkillAnimation(name, loop = false) {
        if (this._spine.skeleton.data.findAnimation(name)) {
            BattleFlow.ReadyForEffect = false;
            this._animation = name;
            /** @type spine.TrackEntry */
            const track = this._spine.state.setAnimationByName(0, name, loop);
            track.onComplete = () => {this.OnAnimationEnd()};
            if (!loop) {
                this._spine.state.addAnimationByName(0, this._idleName, true, 0);
            }
        } else {
            console.log(`animation name ${name} not found!`);
        }
    }


    OnAnimationEnd() {
        this._animation = undefined;
    }

    /**
     * check if an none idle animation is playing
     * @returns {boolean}
     */
    isAnimationPlaying() {
        return this._animation !== undefined;
    }

    SetDamageAnimation() {
        this._spine.state.setAnimationByName(0, 'damage', false);
        this._spine.state.addAnimationByName(0, this._idleName, true, 0);
    }

    SetDeathAnimation() {
        const track = this._spine.state.setAnimationByName(0, 'death', false);
        track.onComplete = () => {this.OnAnimationEnd()};
    }

    SetVictoryAnimation() {
        this._spine.state.setAnimationByName(0, 'victory', false);
        this._spine.state.addAnimationByName(0, 'victory_loop', true, 0);
    }

    StartDisappear() {
        this._disappearing = true;
    }

    _disappearing = false;
    update() {
        if (this._disappearing && this._spine.alpha > 0) {
            this._spine.alpha -= 0.02;
        }
    }

}