class UpdateScene extends CustomScene {
    CreateCustomContents() {
        Update.GetFilesToUpdate().then((list) => this.OnFileListGet(list));
        this.CreateWindow();
    }

    _filelist;
    OnFileListGet(filelist) {
        if (filelist.length < 1) {
            SceneManager.goto(MainScene);
        } else {
            let files = [];
            for (const file of filelist) {
                if(!file.filename.startsWith('.')&&!files.includes(file.filename)&&(file.status==='added'||file.status==='modified'||file.status==='renamed'||file.status==='removed')) {
                    files.push(file);
                }
            }
            this._filelist = files;
            this._filenum = files.length;
            this.ProcessDownload();
        }
    }
    /** @type CustomWindow */
    _window;
    CreateWindow() {
        const w = new CustomWindow(100, 200, Graphics.boxWidth - 200, Graphics.boxHeight - 400, '', 0);
        this._window = w;
        this.addChild(w);
        w.DrawText('正在检查更新(若有更新请在更新完成后重启游戏)...', 0, w.height/2-32, w.width, 'center');
    }

    _fileCount = 0;
    ProcessDownload() {
        const file = this._filelist.shift();
        const $fs = require('fs');
        if (file) {
            this._fileCount ++;
            this.UpdateDownloadInfo(file.filename)
            if (file.status === 'removed') {
                if ($fs.existsSync(file.filename)) $fs.unlinkSync(file.filename);
                this.ProcessDownload();
            } else {
                const $axios = require('axios');
                $axios({
                    url: `https://${Update.raw_host}${Update.raw_path}/main/${file.filename}`,
                    method: 'GET',
                    responseType: 'arraybuffer'
                }).then(resp => {
                    if (resp.status !== 200) {
                        throw new Error(`网络连接错误: ${resp.status} ${resp.statusText}`);
                    } else {
                        $fs.writeFileSync(file.filename, Buffer.from(resp.data));
                        if (file.status === 'rename') $fs.unlinkSync(file.previous_filename);
                        this.ProcessDownload();
                    }
                });
            }
        } else {
            $fs.writeFileSync('data/version.json', `{"time": ${Date.now()}}`);
            SceneManager.goto(MainScene);
        }
    }

    _filenum = 0;
    UpdateDownloadInfo(name = '') {
        const w = this._window;
        w.content.clear();
        w.DrawText(`当前正在下载第${this._fileCount}/${this._filenum}个文件`, 0, w.height/2-36, w.width, 'center');
        w.DrawText(name, 0, w.height/2, w.width, 'center');
    }
}