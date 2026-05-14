import { describe, expect, it, vi } from 'vitest';
import EditorController from './EditorController.js';
import ToolRegistry from '../tools/ToolRegistry.js';
import {
    EXPORT_IMAGE,
    POINTER_CANCEL,
    POINTER_DOWN,
    POINTER_MOVE,
    POINTER_UP,
    PUSH_HISTORY_STATE,
    REDO,
    SET_ACTIVE_TOOL,
    UNDO,
} from '../commands/editorCommands.js';

const createController = ({ tool, historyManager, renderer } = {}) => {
    const activeTool = tool ?? {
        isDrawing: false,
        onMouseDown: vi.fn(),
        onMouseMove: vi.fn(),
        onMouseUp: vi.fn(),
        onMouseLeave: vi.fn(),
    };
    const eraserTool = {
        isDrawing: false,
        onMouseDown: vi.fn(),
    };

    const registry = new ToolRegistry({ brush: activeTool, eraser: eraserTool }, 'brush');
    const history = historyManager ?? {
        pushState: vi.fn(() => true),
        undo: vi.fn(() => true),
        redo: vi.fn(() => true),
    };
    const activeRenderer = renderer ?? {
        exportImage: vi.fn(() => true),
        destroy: vi.fn(),
    };

    return {
        controller: new EditorController({
            renderer: activeRenderer,
            historyManager: history,
            toolRegistry: registry,
        }),
        tool: activeTool,
        eraserTool,
        history,
        renderer: activeRenderer,
    };
};

describe('EditorController', () => {
    it('delegates pointer down and move to the active tool', () => {
        const { controller, tool } = createController();
        const event = { offsetX: 1, offsetY: 2 };
        const toolState = { foregroundColor: '#000000' };

        const result = controller.handlePointerDown(event, toolState);
        controller.handlePointerMove(event, toolState);

        expect(result).toMatchObject({ handled: true, result: undefined, toolId: 'brush' });
        expect(tool.onMouseDown).toHaveBeenCalledWith(event, toolState);
        expect(tool.onMouseMove).toHaveBeenCalledWith(event, toolState);
    });

    it('pushes history when a drawing tool finalizes on pointer up', () => {
        const tool = {
            isDrawing: false,
            onMouseDown: vi.fn(),
            onMouseMove: vi.fn(),
            onMouseUp: vi.fn(() => {
                tool.isDrawing = false;
            }),
        };
        const { controller, history } = createController({ tool });
        const event = { offsetX: 1, offsetY: 2 };

        tool.isDrawing = true;
        controller.handlePointerDown(event, {});

        expect(controller.handlePointerUp(event, {})).toBe(true);
        expect(tool.onMouseUp).toHaveBeenCalledWith(event, {});
        expect(history.pushState).toHaveBeenCalledTimes(1);
    });

    it('pushes history for instant tools that report a change', () => {
        const tool = {
            isDrawing: false,
            onMouseDown: vi.fn(() => true),
        };
        const { controller, history } = createController({ tool });

        controller.handlePointerDown({ offsetX: 1, offsetY: 2 }, {});

        expect(controller.handlePointerUp({ offsetX: 1, offsetY: 2 }, {})).toBe(true);
        expect(history.pushState).toHaveBeenCalledTimes(1);
    });

    it('does not push history for non-mutating instant tools', () => {
        const tool = {
            isDrawing: false,
            onMouseDown: vi.fn(() => ({ color: '#000000' })),
        };
        const { controller, history } = createController({ tool });

        controller.handlePointerDown({ offsetX: 1, offsetY: 2 }, {});

        expect(controller.handlePointerUp({ offsetX: 1, offsetY: 2 }, {})).toBe(false);
        expect(history.pushState).not.toHaveBeenCalled();
    });

    it('delegates undo, redo, export, and destroy safely', () => {
        const { controller, history, renderer } = createController();

        expect(controller.undo()).toBe(true);
        expect(controller.redo()).toBe(true);
        expect(controller.exportImage()).toBe(true);
        controller.destroy();

        expect(history.undo).toHaveBeenCalledTimes(1);
        expect(history.redo).toHaveBeenCalledTimes(1);
        expect(renderer.exportImage).toHaveBeenCalledTimes(1);
        expect(renderer.destroy).toHaveBeenCalledTimes(1);
    });

    it('does not crash when collaborators are missing', () => {
        const controller = new EditorController();

        expect(controller.getActiveTool()).toBeNull();
        expect(controller.handlePointerMove({}, {})).toBe(false);
        expect(controller.handlePointerUp({}, {})).toBe(false);
        expect(controller.undo()).toBe(false);
        expect(controller.redo()).toBe(false);
        expect(controller.pushHistoryState()).toBe(false);
        expect(controller.exportImage()).toBe(false);
        expect(() => controller.destroy()).not.toThrow();
    });

    it('returns false for unknown commands', () => {
        const { controller } = createController();

        expect(controller.execute('editor/unknown')).toBe(false);
    });

    it('executes SET_ACTIVE_TOOL through the tool registry', () => {
        const { controller, eraserTool } = createController();

        expect(controller.execute(SET_ACTIVE_TOOL, { toolId: 'eraser' })).toBe(true);
        expect(controller.getActiveTool()).toBe(eraserTool);
    });

    it('executes UNDO and REDO through the history manager', () => {
        const { controller, history } = createController();

        expect(controller.execute(UNDO)).toBe(true);
        expect(controller.execute(REDO)).toBe(true);
        expect(history.undo).toHaveBeenCalledTimes(1);
        expect(history.redo).toHaveBeenCalledTimes(1);
    });

    it('executes EXPORT_IMAGE through the renderer', () => {
        const { controller, renderer } = createController();

        expect(controller.execute(EXPORT_IMAGE)).toBe(true);
        expect(renderer.exportImage).toHaveBeenCalledTimes(1);
    });

    it('executes pointer commands through the active tool', () => {
        const tool = {
            isDrawing: false,
            onMouseDown: vi.fn(() => {
                tool.isDrawing = true;
            }),
            onMouseMove: vi.fn(),
            onMouseUp: vi.fn(() => {
                tool.isDrawing = false;
            }),
        };
        const { controller, history } = createController({ tool });
        const event = { offsetX: 4, offsetY: 5 };
        const toolState = { foregroundColor: '#111111' };

        const pointerDownResult = controller.execute(POINTER_DOWN, { event, toolState });
        const pointerMoveResult = controller.execute(POINTER_MOVE, { event, toolState });
        const pointerUpResult = controller.execute(POINTER_UP, { event, toolState });

        expect(pointerDownResult).toMatchObject({ handled: true, toolId: 'brush' });
        expect(pointerMoveResult).toBe(true);
        expect(pointerUpResult).toBe(true);
        expect(tool.onMouseDown).toHaveBeenCalledWith(event, toolState);
        expect(tool.onMouseMove).toHaveBeenCalledWith(event, toolState);
        expect(tool.onMouseUp).toHaveBeenCalledWith(event, toolState);
        expect(history.pushState).toHaveBeenCalledTimes(1);
    });

    it('executes PUSH_HISTORY_STATE through the history manager', () => {
        const { controller, history } = createController();

        expect(controller.execute(PUSH_HISTORY_STATE)).toBe(true);
        expect(history.pushState).toHaveBeenCalledTimes(1);
    });

    it('does not push history twice for duplicate pointer completion', () => {
        const tool = {
            isDrawing: false,
            onMouseDown: vi.fn(() => {
                tool.isDrawing = true;
            }),
            onMouseUp: vi.fn(() => {
                tool.isDrawing = false;
            }),
            onMouseLeave: vi.fn(() => {
                tool.isDrawing = false;
            }),
        };
        const { controller, history } = createController({ tool });
        const event = { offsetX: 2, offsetY: 3 };

        controller.execute(POINTER_DOWN, { event, toolState: {} });
        expect(controller.execute(POINTER_UP, { event, toolState: {} })).toBe(true);
        expect(controller.execute(POINTER_CANCEL, { event, toolState: {} })).toBe(false);

        expect(history.pushState).toHaveBeenCalledTimes(1);
    });

    it('finalizes drawing on pointer cancel once', () => {
        const tool = {
            isDrawing: false,
            onMouseDown: vi.fn(() => {
                tool.isDrawing = true;
            }),
            onMouseLeave: vi.fn(() => {
                tool.isDrawing = false;
            }),
        };
        const { controller, history } = createController({ tool });
        const event = { offsetX: 2, offsetY: 3 };

        controller.execute(POINTER_DOWN, { event, toolState: {} });

        expect(controller.execute(POINTER_CANCEL, { event, toolState: {} })).toBe(true);
        expect(controller.execute(POINTER_UP, { event, toolState: {} })).toBe(false);
        expect(tool.onMouseLeave).toHaveBeenCalledWith(event, {});
        expect(history.pushState).toHaveBeenCalledTimes(1);
    });
});
