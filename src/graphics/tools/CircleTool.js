import BaseTool from './BaseTool.js';

export default class CircleTool extends BaseTool {
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
        const dx = event.offsetX - this.lastX;
        const dy = event.offsetY - this.lastY;
        const radius = Math.sqrt(dx * dx + dy * dy);
        this._drawCircle(this.lastX, this.lastY, radius, toolState);
    }

    onMouseUp(event, toolState) {
        if (!this.isDrawing || !this.ctx) return;
        this.ctx.putImageData(this.snapshot, 0, 0);
        const dx = event.offsetX - this.lastX;
        const dy = event.offsetY - this.lastY;
        const radius = Math.sqrt(dx * dx + dy * dy);
        this._drawCircle(this.lastX, this.lastY, radius, toolState);
        super.onMouseUp(event, toolState);
    }

    _drawCircle(x, y, radius, toolState) {
        this.ctx.fillStyle = toolState.backgroundColor;
        this.ctx.strokeStyle = toolState.foregroundColor;
        this.ctx.lineWidth = toolState.lineWidth;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        if (toolState.shapeFillMode === 'fill' || toolState.shapeFillMode === 'outline_and_fill') {
            this.ctx.fill();
        }
        if (toolState.shapeFillMode === 'outline' || toolState.shapeFillMode === 'outline_and_fill') {
            this.ctx.stroke();
        }
    }
}