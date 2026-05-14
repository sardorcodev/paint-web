export default class Renderer {
    constructor(container, dispatch, actions) {
        if (!container) throw new Error("Renderer container not found!");
        this.container = container;
        this.dispatch = dispatch;
        this.actions = actions;

        this.layers = [];

        // Document size is the drawable bitmap. Viewport size is the visible
        // container. Phase 1 keeps them separate without adding zoom/pan yet.
        this.documentWidth = 0;
        this.documentHeight = 0;
        this.viewportWidth = 0;
        this.viewportHeight = 0;

        // Backward-compatible aliases used by the current tools/history code.
        this.width = 0;
        this.height = 0;

        this.resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            this._handleResize(width, height);
        });
        this.resizeObserver.observe(this.container);
    }

    _handleResize(viewportWidth, viewportHeight) {
        const nextViewportWidth = Math.round(viewportWidth);
        const nextViewportHeight = Math.round(viewportHeight);

        if (nextViewportWidth <= 0 || nextViewportHeight <= 0) return;

        this.viewportWidth = nextViewportWidth;
        this.viewportHeight = nextViewportHeight;

        // Preserve Phase 0 behavior: the document bitmap may grow to fit a
        // larger viewport, but viewport shrink must never crop user artwork.
        const nextDocumentWidth = this.documentWidth > 0
            ? Math.max(this.documentWidth, this.viewportWidth)
            : this.viewportWidth;
        const nextDocumentHeight = this.documentHeight > 0
            ? Math.max(this.documentHeight, this.viewportHeight)
            : this.viewportHeight;

        if (nextDocumentWidth === this.documentWidth && nextDocumentHeight === this.documentHeight) {
            this._dispatchCanvasSize();
            return;
        }

        const snapshots = new Map();
        this.layers.forEach(canvas => {
            const snapshot = this._createLayerSnapshot(canvas);
            if (snapshot) snapshots.set(canvas, snapshot);
        });

        this._setDocumentSize(nextDocumentWidth, nextDocumentHeight);

        this.layers.forEach(canvas => {
            canvas.width = this.documentWidth;
            canvas.height = this.documentHeight;
            canvas.style.width = `${this.documentWidth}px`;
            canvas.style.height = `${this.documentHeight}px`;

            if (canvas.dataset.name === 'background') {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, this.documentWidth, this.documentHeight);
                }
            }

            const snapshot = snapshots.get(canvas);
            if (snapshot) {
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(snapshot, 0, 0);
            }
        });

        this._dispatchCanvasSize();
    }

    _setDocumentSize(width, height) {
        this.documentWidth = width;
        this.documentHeight = height;

        this.width = width;
        this.height = height;
    }

    _createLayerSnapshot(canvas) {
        if (canvas.width <= 0 || canvas.height <= 0) return null;

        const snapshot = document.createElement('canvas');
        snapshot.width = canvas.width;
        snapshot.height = canvas.height;

        const ctx = snapshot.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(canvas, 0, 0);
        return snapshot;
    }

    _dispatchCanvasSize() {
        this.dispatch(this.actions.setCanvasSize({
            width: this.documentWidth,
            height: this.documentHeight,
        }));
    }

    addLayer(name = 'layer') {
        const canvas = document.createElement('canvas');
        canvas.width = this.documentWidth;
        canvas.height = this.documentHeight;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = `${this.documentWidth}px`;
        canvas.style.height = `${this.documentHeight}px`;
        canvas.dataset.name = name;

        this.container.appendChild(canvas);
        this.layers.push(canvas);

        if (name === 'background' && this.documentWidth > 0 && this.documentHeight > 0) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, this.documentWidth, this.documentHeight);
            }
        }

        if (this.layers.length === 1 && name === 'background') {
             this._handleResize(this.container.offsetWidth, this.container.offsetHeight);
        }

        return canvas;
    }
    
    destroy() {
        this.resizeObserver.unobserve(this.container);
    }

    getActiveCanvas() {
        return this.layers.find(canvas => canvas.dataset.name === 'drawing') || this.layers[this.layers.length - 1];
    }

    getActiveContext() {
        const activeCanvas = this.getActiveCanvas();
        return activeCanvas ? activeCanvas.getContext('2d') : null;
    }

    /**
     * YANGI METOD: Barcha qatlamlarni bitta rasmga birlashtirib, uni fayl sifatida yuklab oladi.
     * @param {string} filename - Yuklab olinadigan fayl nomi
     */
    exportImage(filename = `ProPaint-chizma-${Date.now()}.png`) {
        // Vaqtinchalik canvas yaratamiz
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.width;
        exportCanvas.height = this.height;
        const ctx = exportCanvas.getContext('2d');

        // Barcha qatlamlarni (background, drawing) birma-bir vaqtinchalik canvas'ga chizamiz
        this.layers.forEach(canvas => {
            ctx.drawImage(canvas, 0, 0);
        });

        // Natijani faylga o'tkazamiz
        const dataUrl = exportCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.click();
    }
}
