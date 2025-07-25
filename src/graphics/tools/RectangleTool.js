import BaseTool from './BaseTool.js';

export default class RectangleTool extends BaseTool {
    constructor(renderer) {
        super(renderer);
        this.snapshot = null;
    }
    
    onMouseDown(event, toolState) {
        super.onMouseDown(event, toolState);
        this.ctx = this.renderer.getActiveContext();
        if (!this.ctx) return;
        this.snapshot = this.ctx.getImageData(0, 0, this.renderer.width, this.renderer.height);
    }
    
    onMouseMove(event, toolState) {
        super.onMouseMove(event, toolState);
        if (!this.isDrawing || !this.ctx) return;
        this.ctx.putImageData(this.snapshot, 0, 0);
        const width = event.offsetX - this.lastX;
        const height = event.offsetY - this.lastY;
        this._drawRect(this.lastX, this.lastY, width, height, toolState);
    }

    onMouseUp(event, toolState) {
        if (!this.isDrawing || !this.ctx) return;
        this.ctx.putImageData(this.snapshot, 0, 0);
        const width = event.offsetX - this.lastX;
        const height = event.offsetY - this.lastY;
        this._drawRect(this.lastX, this.lastY, width, height, toolState);
        super.onMouseUp(event, toolState);
    }

    _drawRect(x, y, width, height, toolState) {
        this.ctx.fillStyle = toolState.backgroundColor;
        this.ctx.strokeStyle = toolState.foregroundColor;
        this.ctx.lineWidth = toolState.lineWidth;

        if (toolState.shapeFillMode === 'fill' || toolState.shapeFillMode === 'outline_and_fill') {
            this.ctx.fillRect(x, y, width, height);
        }
        if (toolState.shapeFillMode === 'outline' || toolState.shapeFillMode === 'outline_and_fill') {
            this.ctx.strokeRect(x, y, width, height);
        }
    }
}