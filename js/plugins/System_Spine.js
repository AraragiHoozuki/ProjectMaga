class SpineUtils {
    /**
     *
     * @param {string} filename
     */
    static async MakeWeaponAtlasPage(filename) {
        const path = `spine/weapon/${filename}.png`;
        const res = await DataUtils.Load(path);
        const texture = PIXI.BaseTexture.from(res.name);
        const page = new PIXI.spine.SpineRuntime.AtlasPage();
        page.width = texture.resource.width;
        page.height = texture.resource.height;
        page.format = undefined;
        page.minFilter = undefined;
        page.magFilter = undefined;
        page.uWrap = 1;
        page.vWrap = 1;
        page.rendererObject = texture;
        const region = new PIXI.spine.SpineRuntime.AtlasRegion();
        region.page = page;
        region.rotate = false;
        region.u = region.v = region.u2 = region.v2 = 0;
        region.width = region.originalWidth = page.width;
        region.height = region.originalHeight = page.height;
        region.index = -1;
        return region;
    }

    /**
     * @param {PIXI.spine.Spine} spine
     * @param {string} slot
     * @param {PIXI.spine.SpineRuntime.AtlasRegion} wep
     * @constructor
     */
    static SetSpineWeapon(spine, slot, wep) {
        const index = spine.skeleton.findSlotIndex(slot);
        spine.skeleton.slots[index].attachment.width = wep.width * 10;
        spine.skeleton.slots[index].attachment.height = wep.height * 10;
        spine.skeleton.slots[index].attachment.rendererObject = wep;
        return wep;
        //spine.skeleton.slots[index].currentSprite._width = wep.width * 10;
        //spine.skeleton.slots[index].currentSprite._height = wep.height * 10;
        //console.log(index);
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

/**
 * Battle Sprite Controller
 */
class BtlSprCtrl extends PIXI.Container{

    _ready = false;
    /** @type PIXI.spine.Spine */
    _spine = undefined;
    _weapon = undefined;

    get spine() {return this._spine;}

    async Load(model, path = 'spine/', weapon, slotName) {
        this._spine = await SpineUtils.LoadSpine(model, path);
        if (weapon) {
            this._weapon = await SpineUtils.MakeWeaponAtlasPage(weapon).then(wep => SpineUtils.SetSpineWeapon(this._spine, slotName, wep));
        }
        this.OnReady();
        return this._spine;
    }

    OnReady() {
        this._ready = true;
        this._spine.controller = this;
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