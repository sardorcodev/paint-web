import { describe, expect, it } from 'vitest';
import FillTool from './FillTool.js';

const createFillTool = () => new FillTool({});

describe('FillTool color helpers', () => {
    it('converts hex colors to opaque RGBA', () => {
        const tool = createFillTool();

        expect(tool._hexToRgba('#ff00aa')).toEqual([255, 0, 170, 255]);
    });

    it('matches identical RGBA colors', () => {
        const tool = createFillTool();

        expect(tool._colorsMatch([10, 20, 30, 255], [10, 20, 30, 255])).toBe(true);
    });

    it('treats different alpha values as different colors', () => {
        const tool = createFillTool();

        expect(tool._colorsMatch([10, 20, 30, 255], [10, 20, 30, 128])).toBe(false);
    });
});
