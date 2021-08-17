
var $dataVersion;
class Network {
    /**
     * @param {Object} options
     * @returns {Promise<string>}
     * @constructor
     */
    static async HttpsGet(options) {
        return new Promise((resolve) => {
            let data = '';
            const $https = require('https');
            $https.get(options, (res) => {
                res.on("data", (chunk) => {
                    data += chunk;
                });

                res.on("end", () => {
                    resolve(data);
                });
            }).on('error', (e) => {
                console.error(e);
            });
        });
    }
}

class Update {
    static host = 'api.github.com';
    static raw_host = 'raw.githubusercontent.com';
    static repo_path = '/repos/AraragiHoozuki/ProjectMaga';
    static raw_path = '/AraragiHoozuki/ProjectMaga';

    /**
     * @returns {Promise<Object[]>}
     */
    static async GetCommits() {
        const options = {
            host: 'api.github.com',
            path: `${this.repo_path}/commits`,
            headers: {
                'User-Agent': 'node.js'
            }
        }
        let json = await Network.HttpsGet(options);
        json = JSON.parse(json);
        let ret = [];
        for (const commit of json) {
            if (Date.parse(commit.commit.author.date) > $dataVersion.time) {
                ret.push(commit);
            } else {
                break;
            }
        }
        return ret;
    }

    /**
     * @returns {Promise<Object[]>}
     */
    static async GetFilesToUpdate() {
        const commits = await this.GetCommits();
        let modified = [];
        if (commits.length > 0) {
            for (const commit of commits) {
                const detail = await Network.HttpsGet({
                    host: 'api.github.com',
                    path: `${this.repo_path}/commits/${commit.sha}`,
                    headers: {
                        'User-Agent': 'node.js'
                    }
                });
                modified = modified.concat(JSON.parse(detail).files);
            }
        }
        return modified;
    }
}