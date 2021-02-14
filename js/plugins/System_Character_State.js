
class State {
    _iname = 'EMPTY';
    constructor(iname) {
        this._iname = iname;
    }

    get iname() { return this._iname; }
}