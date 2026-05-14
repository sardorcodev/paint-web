import { describe, expect, it } from 'vitest';
import {
    createDefaultDocument,
    normalizeDocumentData,
    serializeDocument,
    updateDocumentSize,
} from './DocumentModel.js';

describe('DocumentModel', () => {
    it('creates a serializable default document', () => {
        const document = createDefaultDocument({
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
        });

        expect(document).toMatchObject({
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
            layers: [],
        });
        expect(typeof document.createdAt).toBe('string');
        expect(document.updatedAt).toBe(document.createdAt);
        expect(() => JSON.stringify(document)).not.toThrow();
    });

    it('normalizes unsafe document data', () => {
        const document = normalizeDocumentData({
            width: '320.9',
            height: 0,
            backgroundColor: '',
            createdAt: 'bad-date',
            updatedAt: '2025-01-01T00:00:00.000Z',
            layers: [{ id: 'future-layer' }],
        });

        expect(document.width).toBe(320);
        expect(document.height).toBe(1);
        expect(document.backgroundColor).toBe('#ffffff');
        expect(document.layers).toEqual([{ id: 'future-layer' }]);
        expect(Date.parse(document.createdAt)).not.toBeNaN();
        expect(document.updatedAt).toBe('2025-01-01T00:00:00.000Z');
    });

    it('updates document size without mutating the source document', () => {
        const document = createDefaultDocument({ width: 100, height: 100 });
        const updatedDocument = updateDocumentSize(document, 240, 180);

        expect(document.width).toBe(100);
        expect(document.height).toBe(100);
        expect(updatedDocument.width).toBe(240);
        expect(updatedDocument.height).toBe(180);
        expect(Date.parse(updatedDocument.updatedAt)).not.toBeNaN();
    });

    it('serializes normalized document data', () => {
        const serialized = serializeDocument({ width: 50, height: 60 });
        const parsedDocument = JSON.parse(serialized);

        expect(parsedDocument.width).toBe(50);
        expect(parsedDocument.height).toBe(60);
        expect(parsedDocument.backgroundColor).toBe('#ffffff');
    });
});
