export default class HistoryManager {
    constructor(renderer, dispatch, actions) {
        this.renderer = renderer;
        this.dispatch = dispatch;
        this.actions = actions;

        this.undoStack = [];
        this.redoStack = [];

        setTimeout(() => this.pushState(), 0);
    }

    pushState() {
        this.redoStack = [];
        const dataUrl = this.renderer.getActiveCanvas()?.toDataURL();
        if (dataUrl) {
            this.undoStack.push(dataUrl);
            this._updateStatus();
        }
    }

    undo() {
        if (this.undoStack.length <= 1) return;
        const lastState = this.undoStack.pop();
        this.redoStack.push(lastState);
        this._drawImage(this.undoStack[this.undoStack.length - 1]);
        this._updateStatus();
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const nextState = this.redoStack.pop();
        this.undoStack.push(nextState);
        this._drawImage(nextState);
        this._updateStatus();
    }

    _drawImage(dataUrl) {
        const ctx = this.renderer.getActiveContext();
        if (!ctx) return;
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, this.renderer.width, this.renderer.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = dataUrl;
    }

    _updateStatus() {
        const status = {
            canUndo: this.undoStack.length > 1,
            canRedo: this.redoStack.length > 0,
        };
        this.dispatch(this.actions.setHistoryStatus(status));
    }
}