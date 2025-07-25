import BaseTool from './BaseTool.js';

export default class LineTool extends BaseTool {
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
        this._drawLine(event.offsetX, event.offsetY, toolState);
    }

    onMouseUp(event, toolState) {
        if (!this.isDrawing || !this.ctx) return;
        this.ctx.putImageData(this.snapshot, 0, 0);
        this._drawLine(event.offsetX, event.offsetY, toolState);
        super.onMouseUp(event, toolState);
    }

    _drawLine(x, y, toolState) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.strokeStyle = toolState.foregroundColor;
        this.ctx.lineWidth = toolState.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
    }
}