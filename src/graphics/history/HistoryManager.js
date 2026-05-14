export const DEFAULT_MAX_HISTORY_ENTRIES = 50;

export default class HistoryManager {
    constructor(renderer, dispatch, actions, options = {}) {
        this.renderer = renderer;
        this.dispatch = dispatch;
        this.actions = actions;
        this.maxHistoryEntries = this._normalizeMaxEntries(options.maxHistoryEntries);

        this.undoStack = [];
        this.redoStack = [];

        if (options.captureInitialState !== false) {
            setTimeout(() => this.pushState(), 0);
        }
    }

    pushState() {
        const dataUrl = this._captureActiveCanvas();
        if (!dataUrl) {
            this._updateStatus();
            return false;
        }

        this.redoStack = [];
        this.undoStack.push(dataUrl);
        this._pruneUndoStack();
        this._updateStatus();
        return true;
    }

    undo() {
        if (this.undoStack.length <= 1) {
            this._updateStatus();
            return false;
        }

        const lastState = this.undoStack.pop();
        this.redoStack.push(lastState);
        this._drawImage(this.undoStack[this.undoStack.length - 1]);
        this._updateStatus();
        return true;
    }

    redo() {
        if (this.redoStack.length === 0) {
            this._updateStatus();
            return false;
        }

        const nextState = this.redoStack.pop();
        this.undoStack.push(nextState);
        this._pruneUndoStack();
        this._drawImage(nextState);
        this._updateStatus();
        return true;
    }

    _normalizeMaxEntries(value) {
        if (value === undefined) return DEFAULT_MAX_HISTORY_ENTRIES;

        const parsedValue = Number(value);
        if (!Number.isFinite(parsedValue) || parsedValue < 1) {
            return DEFAULT_MAX_HISTORY_ENTRIES;
        }

        return Math.floor(parsedValue);
    }

    _captureActiveCanvas() {
        const activeCanvas = this.renderer?.getActiveCanvas?.();
        if (!activeCanvas?.toDataURL) return null;

        try {
            return activeCanvas.toDataURL();
        } catch (error) {
            console.warn('History capture skipped:', error);
            return null;
        }
    }

    _pruneUndoStack() {
        while (this.undoStack.length > this.maxHistoryEntries) {
            this.undoStack.shift();
        }
    }

    _drawImage(dataUrl) {
        const ctx = this.renderer?.getActiveContext?.();
        if (!ctx || !dataUrl || typeof Image === 'undefined') return;

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
        const setHistoryStatus = this.actions?.setHistoryStatus;
        if (this.dispatch && setHistoryStatus) {
            this.dispatch(setHistoryStatus(status));
        }
    }
}
