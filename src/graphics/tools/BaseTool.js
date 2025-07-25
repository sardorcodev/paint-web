export default class BaseTool {
    constructor(renderer) {
        if (!renderer) {
            throw new Error("BaseTool requires a renderer.");
        }
        this.renderer = renderer;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
    }

    // Endi barcha metodlar (event, toolState) qabul qiladi
    onMouseDown(event, toolState) {
        this.isDrawing = true;
        [this.lastX, this.lastY] = [event.offsetX, event.offsetY];
    }

    onMouseMove(event, toolState) {
        if (!this.isDrawing) return;
    }

    onMouseUp(event, toolState) {
        this.isDrawing = false;
    }

    onMouseLeave(event, toolState) {
        if (this.isDrawing) {
            this.onMouseUp(event, toolState);
        }
    }
}