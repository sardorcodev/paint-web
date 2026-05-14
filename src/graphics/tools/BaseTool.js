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

    onMouseDown(event) {
        this.isDrawing = true;
        [this.lastX, this.lastY] = [event.offsetX, event.offsetY];
    }

    onMouseMove() {
        if (!this.isDrawing) return;
    }

    onMouseUp() {
        this.isDrawing = false;
    }

    onMouseLeave(event, toolState) {
        if (this.isDrawing) {
            this.onMouseUp(event, toolState);
        }
    }
}
