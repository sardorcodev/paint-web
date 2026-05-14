import { describe, expect, it } from 'vitest';
import ToolRegistry from './ToolRegistry.js';

describe('ToolRegistry', () => {
    it('registers tools and returns tools by id', () => {
        const brush = { id: 'brush' };
        const registry = new ToolRegistry({ brush });

        expect(registry.getTool('brush')).toBe(brush);
        expect(registry.getTool('missing')).toBeNull();
    });

    it('tracks the active tool safely', () => {
        const brush = { id: 'brush' };
        const eraser = { id: 'eraser' };
        const registry = new ToolRegistry({ brush, eraser }, 'brush');

        expect(registry.getActiveTool()).toBe(brush);
        expect(registry.setActiveTool('eraser')).toBe(true);
        expect(registry.getActiveTool()).toBe(eraser);
    });

    it('rejects unknown active tool ids without changing the current tool', () => {
        const brush = { id: 'brush' };
        const registry = new ToolRegistry({ brush }, 'brush');

        expect(registry.setActiveTool('missing')).toBe(false);
        expect(registry.getActiveTool()).toBe(brush);
        expect(registry.getActiveToolId()).toBe('brush');
    });

    it('rejects invalid registrations', () => {
        const registry = new ToolRegistry();

        expect(registry.registerTool('', {})).toBe(false);
        expect(registry.registerTool('brush', null)).toBe(false);
        expect(registry.getActiveTool()).toBeNull();
    });
});
