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
                if(!file.filename.startsWith('.')&&!files.includes(file.filename)&&(file.status==='added'||file.status==='modified')) {
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
        w.DrawText('正在检查更新...', 0, w.height/2-32, w.width, 'center');
    }

    _fileCount = 0;
    ProcessDownload() {
        const file = this._filelist.shift();
        if (file) {
            this._fileCount ++;
            this.UpdateDownloadInfo(file.filename)
            const outstream = $fs.createWriteStream(file.filename);
            $axios({
                url: `https://${Update.raw_host}${Update.raw_path}/main/${file.filename}`,
                method: 'GET',
                responseType: 'arratBuffer'
            }).then(resp => {
                $fs.writeFileSync(file.filename, resp.data);
                this.ProcessDownload();
            });
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