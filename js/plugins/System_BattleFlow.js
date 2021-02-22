class BattleFlow {
     /**
     * Enum for phases
     * @readonly
     * @enum {number}
     */
    static PHASE = {
        THINKING: 0,
        INPUTTING: 1,
        ACTION_LOOP: 2,
        ACTION_PREPARE: 3,
        ACTION_RESOLVE: 4
    };

    /** @type BattleScene */
    static scene;

    /**
     * @type PHASE
     * - indicate the current phase of battle
     */
    static _phase = BattleFlow.PHASE.THINKING;
    /** @type Spriteset_Battle */
    static _spriteset;
    /** @type Character */
    static _chr;
    /** @type Character[] */
    static _inputtingChrs = [];
    /** @type BattleFaceList */
    static _faceList;
    /** @type Action[] */
    static _actions = [];
    /** @type Action */
    static _action

    /** @returns {Character} */
    static get character() { return BattleFlow._chr; }

    /**
     * @param {Spriteset_Battle} set
     */
    SetSpriteSet(set) {
        BattleFlow._spriteset = set;
    }

    static BeginBattle(iname) {
        $gameTroop.Setup(iname);
        $gameScreen.onBattleStart();
        SceneManager.push(BattleScene);
    }

    static StartBgm() {
        if ($gameTroop.bgm) {
            AudioManager.playBgm({name: $gameTroop.bgm, pitch: 100, volume: 100});
        } else {
            AudioManager.playBgm($gameSystem.battleBgm());
        }
        AudioManager.stopBgs();
        AudioManager.stopSe();
    }

    /**
     * @param {Spriteset_Battle} set
     */
    static SetSpriteset(set) {
        BattleFlow._spriteset = set;
    }

    static BattleStart() {
        BattleFlow._phase = BattleFlow.PHASE.THINKING;
        BattleFlow._endPoint = false;
        BattleFlow._endLoopTime = 0;
        $gameSystem.onBattleStart();
        $gameParty.OnBattleStart();
        $gameTroop.OnBattleStart();
    }

    static _inputting = false;
    static IsInputting() {
        return BattleFlow._phase === BattleFlow.PHASE.INPUTTING;
    }

    /** @returns {Character[]} */
    static AllBattleMembers() {
        return [...$gameParty.battleMembers, ...$gameTroop.members];
    }

    /**
     * @param {Character} chr
     * @returns {number}
     */
    static CalcCtSpeed(chr) {
        return chr.GetParam(ParamType.SPD);
    }

    static update(){
        if (BattleFlow.CheckBattleEnd()) {
            BattleFlow.BattleEnd();
        } else {
            switch(BattleFlow._phase) {
                case BattleFlow.PHASE.THINKING:
                    BattleFlow.Think();
                    break;
                case BattleFlow.PHASE.ACTION_LOOP:
                    BattleFlow.UpdateActionLoop();
                    break;
                case BattleFlow.PHASE.ACTION_PREPARE:
                    BattleFlow.UpdateActionPrepare();
                    break;
                case BattleFlow.PHASE.ACTION_RESOLVE:
                    BattleFlow.UpdateActionResolve();
                    break;
                default:
                    break;
            }
        }
    }

    static CheckBattleEnd() {
        return $gameParty.IsAllDead() || $gameTroop.IsAllDead();
    }

    static _endPoint = false;
    static _endLoopTime = 0;
    static BattleEnd() {
        if (!this._spriteset.isBusy()) {
            if ($gameParty.IsAllDead()) {
                $gameParty.OnBattleEnd();
                this._actions = [];
                AudioManager.stopBgm();
                SceneManager.goto(Scene_Gameover);
            } else if ($gameTroop.IsAllDead()) {
                if (!this._endPoint) {
                    this._endPoint = true;
                    $gameParty.OnBattleEnd();
                    this._actions = [];
                }
                this._endLoopTime ++;
                if(TouchInput.isClicked()||this._endLoopTime >= 200) {
                    SceneManager.push(BattleResultScene);
                }

            }
        }
    }

    static Think() {
        let chrs = BattleFlow.AllBattleMembers();
        let hasPlayer = false;
        let hasEnemy = false;
        for (let chr of chrs) {
            if (!chr.IsAlive()) continue;
            chr.AddCt(BattleFlow.CalcCtSpeed(chr));
            if (chr.ct >= chr.ActionCt()) {
                chr.OnTurnStart();
                if (chr instanceof PlayerChar) {
                    hasPlayer = true;
                    BattleFlow._inputtingChrs.push(chr);
                } else if (chr instanceof EnemyChar) {
                    chr.DecideAction();
                    hasEnemy = true;
                }
            }
        }
        BattleFlow._faceList.Refresh();
        if (hasPlayer) {
            BattleFlow.StartInput();
        } else if (hasEnemy) {
            BattleFlow._phase = BattleFlow.PHASE.ACTION_LOOP;
        }
    }

    static StartInput() {
        BattleFlow._phase = BattleFlow.PHASE.INPUTTING;
        BattleFlow.InputCharacterChange();
    }

    static InputCharacterChange() {
        BattleFlow._chr = BattleFlow._inputtingChrs.shift();
        if (!BattleFlow._chr) {
            BattleFlow._phase = BattleFlow.PHASE.ACTION_LOOP;
        }
    }

    /**
     * @param {Skill} skill
     * @param {Character} target
     */
    static PushAction(skill, target) {
        this._actions.push(new Action(skill, target));
    }

    /**
     * @param {Skill} skill
     * @param {Character} target
     */
    static Reaction(skill, target) {
        this._actions.unshift(new Action(skill, target, true));
    }

    static UpdateActionLoop() {
        this._action = this._actions.shift();
        if (!this._action) {
            BattleFlow._phase = BattleFlow.PHASE.THINKING;
        } else {
            BattleFlow._phase = BattleFlow.PHASE.ACTION_PREPARE;
        }
    }

    static UpdateActionPrepare() {
        this._action.Prepare();
        if (this._action._state > Action.STATE.ANIMATION) this._phase = BattleFlow.PHASE.ACTION_RESOLVE;
        this.ActionPoints = this._action._skill.actionPoints.clone();
    }

    static ActionPoints = [];
    static UpdateActionResolve() {
        if (this.ActionPoints.length < 1) {
            BattleFlow._phase = BattleFlow.PHASE.ACTION_LOOP;
        } else {
            if (this._action._user.battleSprite.state.tracks[0].time >= this.ActionPoints[0]) {
                this.ActionPoints.shift();
                this._action._skill.OnSkillEffect(this._action);
            }
        }
    }

    /**
     * @param {number} id
     * @param {PlayerChar|EnemyChar|Character} target
     */
    static PlayAnimation(id, target) {
        let pos;
        if (target instanceof PlayerChar) {
            let face = target.battleFace;
            pos = face.worldTransform.apply(new Point(face.width/2,  -face.height/5));
        } else {
            pos = new Point(target.battleSprite.x, target.battleSprite.y - target.battleSprite.width / 2);
        }
        pos.x += Math.randomInt(20) - 10;
        pos.y += Math.randomInt(40) - 20;
        this._spriteset.createAnimation(id, pos);
    }

    /**
     * @param  {Damage} damage
     */
    static PopupDamage(damage) {
        let sp = new Sprite_Damage();
        sp.x = damage.victim.battleSprite.x;
        sp.y = damage.victim.battleSprite.y - damage.victim.battleSprite.width/3;
        sp.x += Math.randomInt(80) - 40;
        sp.y += Math.randomInt(80) - 40;
        sp.setup(damage);
        this._spriteset.addDamage(sp);
    }

    /**
     * @param {Skill} skill
     * @param {Character} victim
     * @param {number} value
     * @param {ELEMENT} element
     * @param {ATTACK_TYPE} attack
     * @param {boolean} physical - true for physical damage, false for magical
     * @param {Damage.TYPE} type
     */
    static ApplyDamage(skill, victim, value, element = Damage.ELEMENT.NONE, attack= Damage.ATTACK_TYPE.NONE, physical = true, type = Damage.TYPE.HP) {
        let damage = new Damage(skill, victim, value, element, attack, physical, type);
        damage.Resolve();
        damage.Apply();
    }

    /**
     * @param {Skill} skill
     * @param {Character} target
     * @param {string} name
     * @param {number} duration
     * @returns {Modifier}
     */
    static ApplyModifier(skill, target, name, duration= undefined) {
        if (!target.HasAcquiredModifier(name, skill)) {
            let cla = eval(name);
            /** @type Modifier */
            let mod = new cla(target, skill);
            target.AcquireModifier(mod);
            if (duration) mod._duration = duration;
            return mod;
        }
        return undefined;
    }
    /**
     * @param {Skill} skill
     * @param {Character} target
     * @param {string} name
     * @param {number} n
     */
    static StackModifier(skill, target, name, n=1) {
        if (target.HasAcquiredModifier(name)) {
            target.GetAcquiredModifier(name).Stack(n);
        } else {
            this.ApplyModifier(skill, target, name);
            target.GetAcquiredModifier(name).Stack(n - 1);
        }
    }
}

class Action {
    /**
     * Enum for action states
     * @readonly
     * @enum {number}
     */
    static STATE = {
        START: 0,
        COST: 1,
        ANIMATION: 2,
        EFFECT: 3,
        END: 4
    };

    /** @type Character */
    _user;
    /** @type Character[] */
    _targets;
    /** @type Skill */
    _skill;
    _reaction;

    _state = Action.STATE.START;

    /**
     * @param {Skill} skill
     * @param {Character} target
     * @param {boolean} isReaction
     */
    constructor(skill, target, isReaction= false) {
        this._user = skill.owner;
        this._skill = skill;
        this._targets = this.DecideTargets(target);
        this._reaction = isReaction;
    }

    /**
     * @returns {boolean}
     */
    IsReaction() {
        return this._reaction;
    }

    /**
     * @param {Character} target
     * @returns {Character[]}
     */
    DecideTargets(target) {
        /** @type Character[] */
        let targets = target===undefined?[]:[target];
        if (this._skill.IsForAll()) {
            if (this._skill.IsForAlly()) {
                if ( this._user instanceof EnemyChar) {
                    targets = $gameTroop.members;
                } else {
                    targets = $gameParty.members;
                }
            } else {
                if ( this._user instanceof EnemyChar) {
                    targets = $gameParty.members;
                } else {
                    targets = $gameTroop.members;
                }
            }
            targets = targets.clone();
        }
        if (this._skill.IsForSelf()) {
            if (this._skill.IsForAlly()) {

            } else if (!targets.includes(this._user)) {
                targets = [this._user];
            }
        } else {
            targets.remove(this._user);
        }
        if (!this._skill.IsForDead()) {
            targets = targets.filter(c => c.IsAlive());
        }
        if (this._skill.IsRandom()) {
            let rand = [];
            for (let i = 0; i < this._skill.targetCount; i++) {
                rand.push(targets[Math.floor(Math.random() * targets.length)]);
            }
            targets = rand;
        }
        return targets;
    }

    Prepare() {
        if (!this._user.IsAlive()) {
            this._state = Action.STATE.END + 1;
            return;
        }
        switch(this._state) {
            case Action.STATE.START:
                this._skill.OnSkillStart(this);
                this._state ++;
                break;
            case Action.STATE.COST:
                this._skill.OnSkillCost();
                this._state ++;
                break;
            case Action.STATE.ANIMATION:
                BattleFlow.scene.Toast(`${this._user.name}: ${this._skill.name}`, this._user instanceof PlayerChar?Colors.Green:Colors.Red);
                this._skill.OnSkillAnimation(this);
                this._state ++;
                break;
            default:
                break;
        }
    }


}

class Damage {
    /**
     * Damage types
     * @readonly
     * @enum {number}
     */
    static TYPE = {
        HP: 0,
        MANA: 1
    };

    /**
     * ELEMENT types
     * @readonly
     * @enum {number}
     */
    static ELEMENT = {
        NONE: 0,
        PYRO: 1,
        HYDRO: 2,
        AIR: 3,
        GEO: 4,
        NECRO: 5,
        DIVINE: 6,
        SOURCE: 7
    };

    /**
     * @param  {ELEMENT} el
     * @returns {number}
     */
    static GetElementAssistIndex(el) {
        return el - 1;
    }
    /**
     * @param  {ELEMENT} el
     * @returns {number}
     */
    static GetElementResistIndex(el) {
        return this.GetElementAssistIndex(el) + 7;
    }

    /**
     * Attack types
     * @readonly
     * @enum {number}
     */
    static ATTACK_TYPE = {
        NONE: 0,
        SLASH: 1,
        PIERCE: 2,
        BLOW: 3,
        MAGIC: 4,
        DOT: 5
    };

    /**
     * @param {ATTACK_TYPE} at
     */
    static GetATAssistIndex(at) {
        return at + 13;
    }

    /**
     * @param {ATTACK_TYPE} at
     */
    static GetATResistIndex(at) {
        return this.GetATAssistIndex(at) + 4;
    }


    /**
     * @param {Skill} skill
     * @param {Character} victim
     * @param {number} value
     * @param {ELEMENT} element
     * @param {ATTACK_TYPE} attack
     * @param {boolean} physical
     * @param {TYPE} type
     */
    constructor(skill, victim, value, element, attack, physical = true, type = Damage.TYPE.HP) {
        this._skill = skill;
        this._victim = victim;
        this._source = skill.owner;
        this._value = value;
        this._element = element;
        this._attack = attack;
        this._physical = physical === true;
        this._type = type;
    }
    /** @type Skill */
    _skill;
    get skill() {return this._skill;}

    /** @type TYPE */
    _type = Damage.TYPE.HP;
    get type() { return this._type;}

    /** @type number */
    _value;
    get value() {return this._value;}
    get absValue() {return Math.abs(this._value);}

    get victim() {return this._victim;}
    get source() {return this._source;}
    get element() {return this._element;}

    /**
     * damage attack type
     * @returns {ATTACK_TYPE}
     */
    get attack() {return this._attack;}

    _hit = true;
    IsHit() {
        return this._hit;
    }

    _critical = false;
    IsCritical() {
        return this._critical;
    }

    IsPhysical() {
        return this._physical === true;
    }

    IsMagical() {
        return !this.IsPhysical();
    }

    Resolve() {
        this.CheckHit();
        this.CheckCritical();
        this.CalcDefense();
        this.CalcElement();
        this.CalcAttackType();
        this.CalcPhysical();
        this.CalcCritical();
        this.CalcFinal();
    }

    CheckHit() {
    }

    CheckCritical() {
        if (this.type !== Damage.TYPE.HP) return;
        let base = this.source.GetParam(SecParamType.CRITICAL_CHANCE, true);
        this._critical =  Math.ProbCheck(base, this.source.GetParam(ParamType.LUK));
    }

    CalcDefense() {
        if (this._value >= 0 && this.type === Damage.TYPE.HP) {
            let def = this.victim.GetParam((this._physical?ParamType.DEF:ParamType.MND));
            this._value -= def;
            this._value = Math.max(this._value, 1);
        }
    }

    CalcElement() {
        if (this._element === Damage.ELEMENT.NONE) return;
        let assist = this.source.GetParam(Damage.GetElementAssistIndex(this._element), true);
        let resist = this.victim.GetParam(Damage.GetElementResistIndex(this._element), true);
        let scale = Math.max(0, (100 + assist - resist)/100);
        this._value *= scale;
    }

    CalcAttackType() {
        if (this._attack === Damage.ATTACK_TYPE.NONE) return;
        let assist = this.source.GetParam(Damage.GetATAssistIndex(this._attack), true);
        let resist = this.victim.GetParam(Damage.GetATResistIndex(this._attack), true);
        let scale = Math.max(0, (100 + assist - resist)/100);
        this._value *= scale;
    }

    CalcPhysical() {
        if(this.value < 0) return;
        const assist = this.source.GetParam(this.IsPhysical()?SecParamType.ASSIST_PHYSICAL:SecParamType.ASSIST_MAGICAL, true);
        const resist = this.victim.GetParam(this.IsPhysical()?SecParamType.ASSIST_PHYSICAL:SecParamType.ASSIST_MAGICAL, true);
        const scale = Math.max((assist + 100)*(100-resist)/10000);
        this._value *= scale;
    }

    CalcCritical() {
        if (this.IsCritical()) {
            let assist = this.source.GetParam(SecParamType.CRITICAL_DAMAGE, true);
            this._value *= (assist + 150) / 100;
        }
    }

    CalcFinal() {
        this._value = Math.floor(this._value);
    }

    _damageModifies = {
        /** @type number[]*/
        plus: [],
        /** @type number[]*/
        scale: [],
        /** @type number[]*/
        cap: []
    }
    ApplyControl() {
        for (const p of this._damageModifies.plus) {
            this._value += p;
            if (this._value < 0) {
                this._value = 0;
                return;
            }
        }
        for (const s of this._damageModifies.scale) {
            this._value += this.value * s/100;
        }
        for (const c of this._damageModifies.cap) {
            this._value = Math.min(this._value, c);
        }
    }

    /**
     * @param {number} plus
     * @param {number} scale
     * @param {number} cap
     */
    RegisterControl(plus = 0, scale = undefined, cap = undefined) {
        if (plus) this._damageModifies.plus.push(plus);
        if (scale) this._damageModifies.scale.push(scale);
        if (cap !== undefined) this._damageModifies.cap.push(cap);
    }

    Apply() {
        if (this.type === Damage.TYPE.HP) {
            if (this._value >= 0) {
                this.victim.OnBeforeTakeDamage(this);
                this.ApplyControl();
                this.CalcFinal();
            }
            this.victim.AddHp( - this._value);
            BattleFlow.PopupDamage(this);
            if (this._value >= 0) {
                this.source.OnDealDamage(this);
                this.victim.OnTakeDamage(this);
            } else {
                this.source.OnDealHealing(this);
                this.victim.OnTakeHealing(this);
            }
        } else if (this.type === Damage.TYPE.MANA) {
            this.victim.AddMana(- this._value);
            BattleFlow.PopupDamage(this);
        }
    }
}