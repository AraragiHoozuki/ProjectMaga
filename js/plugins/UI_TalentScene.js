class TalentScene extends MenuBaseScene {
    static colorInput = '#52c8e8'
    static OffsetX = 400;
    static OffsetY = 150;
    static NodeDistance = 120;
    static NodeSize = 100;
    static EdgeStyleLocked = {
        width: 10,
        color: 0xffffff
    };
    static EdgeStyleUnlocked = {
        width:2,
        color: 0x52c8e8
    };
    /** @type PlayerChar */
    static player = undefined;

    /** @type TalentNode[][] */
    _nodes = [[],[],[],[],[]];

    /** @type PIXI.Graphics[][] */
    _edges = [[],[],[],[],[]];

    _edgeLayer;

    static DIRECTIONS = {
        LEFT: 0b1,
        UP: 0b10,
        RIGHT: 0b100,
        DOWN: 0b1000
    }

    get backgroundImageName() {return 'scene_bg_pattern_galaxy';}
    get headerText() {return '天赋';}

    /**
     *
     * @param {number} row
     * @param {number} col
     * @returns {[number, number]|undefined}
     */
    GetPreviousPos(row, col) {
        const flag = TalentScene.player.data.talent_edges[row][col];
        switch(flag) {
            case 0:
                return undefined;
            case 1:
                col--;
                break;
            case 2:
                row--;
                break;
            case 4:
                col++
                break;
            case 8:
                row++;
                break;
            default:
                break;
        }
        return [row, col];
    }

    CanUnlock(row, col) {
        const temp = this.GetPreviousPos(row, col);
        return temp === undefined || TalentScene.player.IsTalentUnlocked(...temp);
    }

    /**
     * @param {number} row
     * @param {number} col
     * @returns {number[]}
     */
    GetNodeCenterCoordinate(row, col) {
        const x = TalentScene.OffsetX + col * TalentScene.NodeDistance;
        const y = TalentScene.OffsetY + row * TalentScene.NodeDistance;
        return [x, y];
    }


    CreateContents() {
        super.CreateContents();
        this.CreateEdges();
        this.CreateNodes();
        this.CreateTextAndNumber();
        this.CreateInfoWindow();
    }

    CreateNodes() {
        for (let row = 0; row < 5; row ++) {
            for(let col = 0; col < 5; col ++) {
                this._nodes[row][col] = this.CreateNode(row, col);
            }
        }
    }

    CreateNode(row, col) {
        let iname;
        let isCraft = false;
        if (typeof TalentScene.player.data.talents[row][col] === 'number') {
            iname = TalentScene.player.data.crafts[TalentScene.player.data.talents[row][col]];
            isCraft = true;
        } else {
            iname = TalentScene.player.data.talents[row][col];
        }
        const [x, y] = this.GetNodeCenterCoordinate(row, col);
        const node = new TalentNode(iname, x - TalentScene.NodeSize/2, y - TalentScene.NodeSize/2, TalentScene.NodeSize, TalentScene.NodeSize);
        this.addChild(node);
        node.SetHandler(node.OnClick, (node)=> {
            if (TalentScene.player.IsTalentUnlocked(row, col)) {
                this.Toast('该天赋已经习得', Colors.Red);
            } else if (!this.CanUnlock(row,col)) {
                this.Toast('需要习得前一天赋', Colors.Red);
            } else {
                let sp, sk;
                let str = '';
                const w = new InfoWindow(200, 100, Graphics.width - 400, Graphics.height - 200, 0, '', 0, undefined, undefined);
                if (isCraft) {
                    sk = TalentScene.player.crafts[TalentScene.player.data.talents[row][col]];
                } else {
                    sk = TalentScene.player.learnedSkills.find(s => s.iname === iname);
                }
                if(sk===undefined) {
                    sp = $dataSkills[iname].sp[0];
                    str += `学习技能【${$dataSkills[iname].name}】， 需要花费技能点${$dataSkills[iname].sp[0]}点\n`;
                    str += Skill.GetDescription($dataSkills[iname], 0);
                } else {
                    sp = sk.spNeeded;
                    str += `升级技能【${$dataSkills[iname].name}】， 需要花费技能点${sk.spNeeded}点\n`;
                    str += Skill.GetDescription($dataSkills[iname], sk.level, sk.level+1);
                }
                let h = w.TestDraw(str);
                w.SetContentLength(h);
                w.Draw(str);
                this.Dialog(w,  TalentScene.player.sp >= sp, true, (confirm)=>{
                    if(confirm) {
                        TalentScene.player.UnlockTalent(row, col);
                        AudioManager.PlaySe('se_heavy_click');
                        this._numberSp.SetNumber(TalentScene.player.sp);
                    }
                });
            }
        });

        node.SetHandler(node.OnLongPress, ()=> {
            let sk = TalentScene.player.crafts.find(c=>c&&c.iname === iname);
            let str;
            if (sk) {
                str = Skill.GetDescription($dataSkills[iname], sk.level, TalentScene.player.IsTalentUnlocked(row, col)?-1:sk.level + 1);
            } else {
                sk = TalentScene.player.learnedSkills.find(s => s.iname === iname);
                if (sk) {
                    str =  Skill.GetDescription($dataSkills[iname], sk.level, TalentScene.player.IsTalentUnlocked(row, col)?-1:sk.level + 1);
                } else {
                    str = Skill.GetDescription($dataSkills[iname], -1);
                }
            }
            this._infoWindow.content.clear();
            this._infoWindow.DrawTextEx(str, 0, 0, this._infoWindow.contentWidth);
            this._infoWindow.Open();
        });

        node.SetHandler(node.OnLongPressRelease, this.CloseInfoWindow.bind(this));
        return node;
    }

    CreateEdges() {
        for (let row = 0; row < 5; row ++) {
            for(let col = 0; col < 5; col ++) {
                const prev = this.GetPreviousPos(row, col);
                if (prev) {
                    const [x, y] = this.GetNodeCenterCoordinate(row, col);
                    const [px, py] = this.GetNodeCenterCoordinate(...prev)
                    const edge = new PIXI.Graphics();
                    edge.lineStyle(TalentScene.EdgeStyleLocked);
                    edge.moveTo(px, py);
                    edge.lineTo(x, y);
                    this._edges[row][col] = edge;
                    this.addChild(edge);
                }
            }
        }
    }

    _textSp;
    _numberSp;
    CreateTextAndNumber() {
        this._textSp = new PIXI.Text('技能点：', TextStyles.KaiTitle);
        this._textSp.y = 200;
        this.addChild(this._textSp);

        this._numberSp = new NumberSprite(0, this._textSp.y + 50, TalentScene.player.sp, 'number_azure');
        this.addChild(this._numberSp);
    }

    _infoWindow;
    CreateInfoWindow() {
        this._infoWindow = new CustomWindow(200, 100, Graphics.width - 400, Graphics.height - 200, '', 0,'wd_title_cmn','face_bg');
        this.addChild(this._infoWindow);
        this._infoWindow.Close();
    }

    UpdateNodes() {
        for (let row = 0; row < 5; row ++) {
            for(let col = 0; col < 5; col ++) {
                const node = this._nodes[row][col];
                if (TalentScene.player.IsTalentUnlocked(row, col)) {
                    node.SetImageSpriteTint(0xffffff)
                } else if(this.CanUnlock(row, col)) {
                    node.SetImageSpriteTint(0x8d8d8d)
                } else {
                    node.SetImageSpriteTint(0x3e3e3e)
                }

                if (this._edges[row][col]) {
                    if (TalentScene.player.IsTalentUnlocked(row, col)) {
                        this._edges[row][col].tint = TalentScene.EdgeStyleUnlocked.color;
                    } else {
                        this._edges[row][col].tint = TalentScene.EdgeStyleLocked.color;
                    }
                }
            }
        }
    }

    update() {
        super.update();
        this.UpdateNodes();
    }

    CloseInfoWindow() {
        this._infoWindow.Close();
    }
}

class TalentNode extends Button {
    constructor(iname, x, y, width, height) {
        super('', $dataSkills[iname].icon, x, y, width, height, 'btn_lc_cmn', undefined, undefined, undefined, 'img/icons/skill/');
        this._skillIname = iname;
    }

    _skillIname;
    get skillIname() {return this._skillIname;}

    SetImageSpriteTint(val) {
        this._imageSprite.tint = val;
    }
}
