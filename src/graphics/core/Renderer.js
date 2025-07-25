export default class Renderer {
    constructor(container) {
        if (!container) throw new Error("Renderer container not found!");
        this.container = container;
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
}