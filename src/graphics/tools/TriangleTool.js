import BaseTool from './BaseTool.js';

export default class TriangleTool extends BaseTool {
    constructor(renderer) {
        super(renderer);
        this.snapshot = null;
    }
    
    onMouseDown(event, state) {
        super.onMouseDown(event, state);
        if (!this.ctx) return;
        this.snapshot = this.ctx.getImageData(0, 0, this.renderer.width, this.renderer.height);
    }
    
    onMouseMove(event, state) {
        super.onMouseMove(event, state);
        if (!this.isDrawing || !this.ctx) return;
        this.ctx.putImageData(this.snapshot, 0, 0);
        this._drawTriangle(event.offsetX, event.offsetY, state.tool);
    }

    onMouseUp(event, state) {
        if (!this.isDrawing || !this.ctx) return;
        this.ctx.putImageData(this.snapshot, 0, 0);
        this._drawTriangle(event.offsetX, event.offsetY, state.tool);
        super.onMouseUp(event, state);
    }

    _drawTriangle(endX, endY, toolState) {
        this.ctx.fillStyle = toolState.backgroundColor;
        this.ctx.strokeStyle = toolState.foregroundColor;
        this.ctx.lineWidth = toolState.lineWidth;

        this.ctx.beginPath();
        // 1-nuqta: sichqoncha bosilgan joy (uchburchakning uchi)
        this.ctx.moveTo(this.lastX, this.lastY);
        // 2-nuqta: sichqonchaning joriy pozitsiyasi
        this.ctx.lineTo(endX, endY);
        // 3-nuqta: joriy pozitsiyaning gorizontal aksi
        const thirdX = this.lastX - (endX - this.lastX);
        this.ctx.lineTo(thirdX, endY);

        this.ctx.closePath(); // Shaklni yopish

        if (toolState.shapeFillMode === 'fill' || toolState.shapeFillMode === 'outline_and_fill') {
            this.ctx.fill();
        }
        if (toolState.shapeFillMode === 'outline' || toolState.shapeFillMode === 'outline_and_fill') {
            this.ctx.stroke();
        }
    }
}