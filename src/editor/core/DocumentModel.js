const DEFAULT_BACKGROUND_COLOR = '#ffffff';
const DEFAULT_DOCUMENT_SIZE = 1;

const toPositiveInteger = (value, fallback = DEFAULT_DOCUMENT_SIZE) => {
    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue) || parsedValue < 1) return fallback;

    return Math.floor(parsedValue);
};

const toIsoTimestamp = (value = new Date().toISOString()) => {
    const parsedTime = Date.parse(value);
    return Number.isNaN(parsedTime) ? new Date().toISOString() : new Date(parsedTime).toISOString();
};

export const createDefaultDocument = ({
    width = DEFAULT_DOCUMENT_SIZE,
    height = DEFAULT_DOCUMENT_SIZE,
    backgroundColor = DEFAULT_BACKGROUND_COLOR,
} = {}) => {
    const timestamp = new Date().toISOString();

    return {
        width: toPositiveInteger(width),
        height: toPositiveInteger(height),
        backgroundColor,
        createdAt: timestamp,
        updatedAt: timestamp,
        layers: [],
    };
};

export const normalizeDocumentData = (data = {}) => {
    const source = data && typeof data === 'object' ? data : {};
    const createdAt = toIsoTimestamp(source.createdAt);

    return {
        width: toPositiveInteger(source.width),
        height: toPositiveInteger(source.height),
        backgroundColor: source.backgroundColor || DEFAULT_BACKGROUND_COLOR,
        createdAt,
        updatedAt: toIsoTimestamp(source.updatedAt || createdAt),
        layers: Array.isArray(source.layers) ? [...source.layers] : [],
    };
};

export const updateDocumentSize = (document, width, height) => ({
    ...normalizeDocumentData(document),
    width: toPositiveInteger(width),
    height: toPositiveInteger(height),
    updatedAt: new Date().toISOString(),
});

export const serializeDocument = (document) =>
    JSON.stringify(normalizeDocumentData(document));
