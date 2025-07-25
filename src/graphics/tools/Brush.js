import BaseTool from './BaseTool.js';

export default class Brush extends BaseTool {
    constructor(renderer) {
        super(renderer);
    }
    
    onMouseDown(event, toolState) {
        super.onMouseDown(event, toolState);
        this.ctx = this.renderer.getActiveContext();
        if (!this.ctx) return;
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.draw(this.lastX, this.lastY, toolState);
    }
    
    onMouseMove(event, toolState) {
        super.onMouseMove(event, toolState);
        if (this.isDrawing) {
            this.draw(event.offsetX, event.offsetY, toolState);
        }
    }

    draw(x, y, toolState) {
        if (!this.ctx) return;
        this.ctx.strokeStyle = toolState.foregroundColor;
        this.ctx.lineWidth = toolState.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.lineTo(x, y);
        this.ctx.stroke();

        [this.lastX, this.lastY] = [x, y];
    }
}