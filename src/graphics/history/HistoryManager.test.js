import { describe, expect, it, vi } from 'vitest';
import HistoryManager, { DEFAULT_MAX_HISTORY_ENTRIES } from './HistoryManager.js';

const createHistoryManager = (options = {}, dataUrls = []) => {
    let captureIndex = 0;
    const canvas = {
        toDataURL: vi.fn(() => dataUrls[captureIndex++] ?? `state-${captureIndex}`),
    };
    const renderer = {
        width: 10,
        height: 10,
        getActiveCanvas: vi.fn(() => canvas),
        getActiveContext: vi.fn(() => ({
            clearRect: vi.fn(),
            drawImage: vi.fn(),
        })),
    };
    const dispatch = vi.fn();
    const actions = {
        setHistoryStatus: (payload) => ({ type: 'history/setHistoryStatus', payload }),
    };

    const manager = new HistoryManager(renderer, dispatch, actions, {
        captureInitialState: false,
        ...options,
    });

    return { manager, canvas, dispatch, renderer };
};

describe('HistoryManager', () => {
    it('uses a bounded default history size', () => {
        const { manager } = createHistoryManager();

        expect(manager.maxHistoryEntries).toBe(DEFAULT_MAX_HISTORY_ENTRIES);
    });

    it('keeps the undo stack within the configured max length', () => {
        const { manager } = createHistoryManager(
            { maxHistoryEntries: 3 },
            ['state-1', 'state-2', 'state-3', 'state-4', 'state-5']
        );

        for (let i = 0; i < 5; i += 1) {
            manager.pushState();
        }

        expect(manager.undoStack).toEqual(['state-3', 'state-4', 'state-5']);
    });

    it('clears redo after a new pushed state', () => {
        const { manager } = createHistoryManager({}, ['new-state']);
        manager.undoStack = ['initial-state'];
        manager.redoStack = ['redo-state'];

        manager.pushState();

        expect(manager.undoStack).toEqual(['initial-state', 'new-state']);
        expect(manager.redoStack).toEqual([]);
    });

    it('does not crash when undo is called without enough history', () => {
        const { manager } = createHistoryManager();

        expect(() => manager.undo()).not.toThrow();
        expect(manager.undo()).toBe(false);
        expect(manager.undoStack).toEqual([]);
    });

    it('does not crash when redo is called with an empty redo stack', () => {
        const { manager } = createHistoryManager();

        expect(() => manager.redo()).not.toThrow();
        expect(manager.redo()).toBe(false);
        expect(manager.redoStack).toEqual([]);
    });
});
