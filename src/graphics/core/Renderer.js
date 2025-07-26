export default class Renderer {
    constructor(container, dispatch, actions) {
        if (!container) throw new Error("Renderer container not found!");
        this.container = container;
        this.dispatch = dispatch;
        this.actions = actions;

        this.layers = [];
        this.width = 0;
        this.height = 0;

        this.resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            this._handleResize(width, height);
        });
        this.resizeObserver.observe(this.container);
    }

    _handleResize(width, height) {
        this.width = width;
        this.height = height;

        this.dispatch(this.actions.setCanvasSize({ 
            width: Math.round(width), 
            height: Math.round(height) 
        }));

        this.layers.forEach(canvas => {
            canvas.width = this.width;
            canvas.height = this.height;
        });

        const bgLayer = this.layers.find(c => c.dataset.name === 'background');
        if (bgLayer) {
            const ctx = bgLayer.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, this.width, this.height);
        }
    }

    addLayer(name = 'layer') {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.dataset.name = name;

        this.container.appendChild(canvas);
        this.layers.push(canvas);

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