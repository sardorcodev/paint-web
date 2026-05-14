import {
    EXPORT_IMAGE,
    POINTER_DOWN,
    POINTER_MOVE,
    POINTER_UP,
    POINTER_CANCEL,
    PUSH_HISTORY_STATE,
    REDO,
    SET_ACTIVE_TOOL,
    UNDO,
} from '../commands/editorCommands.js';

export default class EditorController {
    constructor({
        renderer = null,
        historyManager = null,
        toolRegistry = null,
        documentModel = null,
    } = {}) {
        this.renderer = renderer;
        this.historyManager = historyManager;
        this.toolRegistry = toolRegistry;
        this.documentModel = documentModel;
        this.pendingHistoryState = false;
        this.activeEditInProgress = false;
        this.historyCommittedForActiveEdit = false;
    }

    execute(commandName, payload = {}) {
        switch (commandName) {
            case SET_ACTIVE_TOOL:
                return this.setActiveTool(payload.toolId);
            case POINTER_DOWN:
                return this.handlePointerDown(payload.event, payload.toolState);
            case POINTER_MOVE:
                return this.handlePointerMove(payload.event, payload.toolState);
            case POINTER_UP:
                return this.handlePointerUp(payload.event, payload.toolState);
            case POINTER_CANCEL:
                return this.handlePointerCancel(payload.event, payload.toolState);
            case PUSH_HISTORY_STATE:
                return this.pushHistoryState();
            case UNDO:
                return this.undo();
            case REDO:
                return this.redo();
            case EXPORT_IMAGE:
                return this.exportImage();
            default:
                return false;
        }
    }

    setActiveTool(toolId) {
        return this.toolRegistry?.setActiveTool?.(toolId) ?? false;
    }

    getActiveTool() {
        return this.toolRegistry?.getActiveTool?.() ?? null;
    }

    getActiveToolId() {
        return this.toolRegistry?.getActiveToolId?.() ?? null;
    }

    handlePointerDown(event, toolState) {
        const tool = this.getActiveTool();
        if (!tool?.onMouseDown) return { handled: false, result: null, tool: null, toolId: null };

        this.activeEditInProgress = true;
        this.historyCommittedForActiveEdit = false;
        this.pendingHistoryState = false;

        const result = tool.onMouseDown(event, toolState);
        this.pendingHistoryState = result === true;

        return {
            handled: true,
            result,
            tool,
            toolId: this.getActiveToolId(),
        };
    }

    handlePointerMove(event, toolState) {
        const tool = this.getActiveTool();
        if (!tool?.onMouseMove) return false;

        tool.onMouseMove(event, toolState);
        return true;
    }

    handlePointerUp(event, toolState) {
        if (!this.activeEditInProgress || this.historyCommittedForActiveEdit) {
            return false;
        }

        const tool = this.getActiveTool();
        let shouldPushHistory = this.pendingHistoryState;

        if (!shouldPushHistory && tool?.isDrawing && tool?.onMouseUp) {
            tool.onMouseUp(event, toolState);
            shouldPushHistory = true;
        }

        if (shouldPushHistory) {
            this._commitActiveEditHistory();
        }

        this._resetActiveEdit();
        return shouldPushHistory;
    }

    handlePointerCancel(event, toolState) {
        if (!this.activeEditInProgress || this.historyCommittedForActiveEdit) {
            return false;
        }

        const tool = this.getActiveTool();
        const shouldPushHistory = this.pendingHistoryState || Boolean(tool?.isDrawing);

        tool?.onMouseLeave?.(event, toolState);

        if (shouldPushHistory) {
            this._commitActiveEditHistory();
        }

        this._resetActiveEdit();
        return shouldPushHistory;
    }

    undo() {
        return this.historyManager?.undo?.() ?? false;
    }

    redo() {
        return this.historyManager?.redo?.() ?? false;
    }

    pushHistoryState() {
        return this.historyManager?.pushState?.() ?? false;
    }

    exportImage() {
        return this.renderer?.exportImage?.() ?? false;
    }

    destroy() {
        this.renderer?.destroy?.();
    }

    _commitActiveEditHistory() {
        if (this.historyCommittedForActiveEdit) return false;

        const didPush = this.pushHistoryState();
        this.historyCommittedForActiveEdit = true;
        return didPush;
    }

    _resetActiveEdit() {
        this.pendingHistoryState = false;
        this.activeEditInProgress = false;
        this.historyCommittedForActiveEdit = false;
    }
}
